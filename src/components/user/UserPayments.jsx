import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addPaymentMethod, removePaymentMethod } from '../../store/actions';

const SAVED_PAYMENT_METHODS_KEY = 'SAVED_PAYMENT_METHODS';

const mockSavedCards = [
    {
        id: 'pm_mock_visa',
        provider: 'Stripe',
        brand: 'Visa',
        last4: '4242',
        expMonth: '08',
        expYear: '2028',
        cardholderName: 'Muda B.',
        billingLabel: 'Personal card',
        isDefault: true,
    },
    {
        id: 'pm_mock_mastercard',
        provider: 'Stripe',
        brand: 'Mastercard',
        last4: '4444',
        expMonth: '11',
        expYear: '2027',
        cardholderName: 'Muda B.',
        billingLabel: 'Backup card',
        isDefault: false,
    },
];

const demoCardQueue = [
    {
        id: 'pm_mock_amex',
        provider: 'Stripe',
        brand: 'American Express',
        last4: '0005',
        expMonth: '03',
        expYear: '2029',
        cardholderName: 'Muda B.',
        billingLabel: 'Travel card',
        isDefault: false,
    },
    {
        id: 'pm_mock_discover',
        provider: 'Stripe',
        brand: 'Discover',
        last4: '1117',
        expMonth: '06',
        expYear: '2026',
        cardholderName: 'Muda B.',
        billingLabel: 'Household card',
        isDefault: false,
    },
];

const loadSavedCards = () => {
    try {
        const storedCards = localStorage.getItem(SAVED_PAYMENT_METHODS_KEY);
        if (!storedCards) {
            return mockSavedCards;
        }

        const parsedCards = JSON.parse(storedCards);
        return Array.isArray(parsedCards) && parsedCards.length > 0
            ? parsedCards
            : mockSavedCards;
    } catch (error) {
        return mockSavedCards;
    }
};

const saveCards = (cards) => {
    localStorage.setItem(SAVED_PAYMENT_METHODS_KEY, JSON.stringify(cards));
};

const getBrandAccent = (brand) => {
    switch (brand) {
        case 'Visa':
            return 'from-sky-700 to-blue-500';
        case 'Mastercard':
            return 'from-orange-500 to-red-500';
        case 'American Express':
            return 'from-emerald-500 to-teal-600';
        case 'Discover':
            return 'from-amber-500 to-orange-500';
        default:
            return 'from-slate-700 to-slate-500';
    }
};

const UserPayments = () => {
    const dispatch = useDispatch();
    const { paymentMethod } = useSelector((state) => state.payment);
    const [savedCards, setSavedCards] = useState(() => loadSavedCards());

    useEffect(() => {
        saveCards(savedCards);
    }, [savedCards]);

    useEffect(() => {
        const defaultCard = savedCards.find((card) => card.isDefault);
        if (!defaultCard && paymentMethod === 'Stripe') {
            dispatch(removePaymentMethod());
            return;
        }

        if (defaultCard && paymentMethod !== defaultCard.provider) {
            dispatch(addPaymentMethod(defaultCard.provider));
        }
    }, [dispatch, paymentMethod, savedCards]);

    const handleSelectMethod = (method) => {
        dispatch(addPaymentMethod(method));
    };

    const handleClearPreference = () => {
        dispatch(removePaymentMethod());
    };

    const handleSetDefaultCard = (cardId) => {
        setSavedCards((currentCards) =>
            currentCards.map((card) => ({
                ...card,
                isDefault: card.id === cardId,
            }))
        );
    };

    const handleRemoveCard = (cardId) => {
        setSavedCards((currentCards) => {
            const updatedCards = currentCards.filter((card) => card.id !== cardId);

            if (!updatedCards.some((card) => card.isDefault)) {
                updatedCards[0] = { ...updatedCards[0], isDefault: true };
            }

            return updatedCards;
        });
    };

    const handleAddDemoCard = () => {
        const nextCard = demoCardQueue.find(
            (card) => !savedCards.some((savedCard) => savedCard.id === card.id)
        );

        if (!nextCard) {
            return;
        }

        setSavedCards((currentCards) => [...currentCards, nextCard]);
    };

    const handleResetMockCards = () => {
        setSavedCards(mockSavedCards);
    };

    const defaultCard = savedCards.find((card) => card.isDefault) || null;
    const hasUnusedDemoCards = demoCardQueue.some(
        (card) => !savedCards.some((savedCard) => savedCard.id === card.id)
    );

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Mocked saved-card UI for the future backend integration. Card data is masked and stored locally only.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    {hasUnusedDemoCards ? (
                        <button
                            type="button"
                            onClick={handleAddDemoCard}
                            className="inline-flex items-center justify-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                        >
                            Add Demo Card
                        </button>
                    ) : null}
                    <button
                        type="button"
                        onClick={handleResetMockCards}
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                        Reset Mock Data
                    </button>
                    {paymentMethod ? (
                        <button
                            type="button"
                            onClick={handleClearPreference}
                            className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            Clear Preference
                        </button>
                    ) : null}
                </div>
            </div>

            <div className="rounded-lg border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-800 mb-6">
                {defaultCard
                    ? `Default card: ${defaultCard.brand} ending in ${defaultCard.last4}. Checkout will use ${defaultCard.provider} as the provider.`
                    : 'No saved card is currently set as default.'}
            </div>

            {savedCards.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {savedCards.map((card) => {
                        const isSelected = card.isDefault;

                        return (
                            <div
                                key={card.id}
                                className={`overflow-hidden rounded-2xl border ${
                                    isSelected
                                        ? 'border-orange-400 shadow-md'
                                        : 'border-gray-200 shadow-sm'
                                }`}
                            >
                                <div className={`bg-linear-to-r ${getBrandAccent(card.brand)} p-5 text-white`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.3em] text-white/75">Saved Card</p>
                                            <h2 className="mt-3 text-2xl font-semibold">{card.brand}</h2>
                                        </div>
                                        <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold">
                                            {card.provider}
                                        </span>
                                    </div>

                                    <div className="mt-10 flex items-end justify-between gap-4">
                                        <div>
                                            <p className="text-sm text-white/75">Card number</p>
                                            <p className="mt-1 text-lg font-medium tracking-[0.35em]">
                                                •••• •••• •••• {card.last4}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-white/75">Expires</p>
                                            <p className="mt-1 text-lg font-medium">{card.expMonth}/{card.expYear.slice(-2)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 bg-white p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{card.cardholderName}</p>
                                            <p className="mt-1 text-sm text-gray-600">{card.billingLabel}</p>
                                        </div>

                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                            isSelected
                                                ? 'bg-orange-100 text-orange-700'
                                                : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {isSelected ? 'Default' : 'Saved'}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        {!isSelected ? (
                                            <button
                                                type="button"
                                                onClick={() => handleSetDefaultCard(card.id)}
                                                className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                                            >
                                                Set As Default
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleSelectMethod(card.provider)}
                                                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                                            >
                                                Preferred For Checkout
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveCard(card.id)}
                                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                        >
                                            Remove Card
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-gray-300 px-6 py-12 text-center">
                    <h2 className="text-xl font-semibold text-gray-900">No saved cards</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Add demo cards to review how masked saved payment methods will appear once the backend is ready.
                    </p>
                    {hasUnusedDemoCards ? (
                        <button
                            type="button"
                            onClick={handleAddDemoCard}
                            className="mt-5 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                        >
                            Add Demo Card
                        </button>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default UserPayments;