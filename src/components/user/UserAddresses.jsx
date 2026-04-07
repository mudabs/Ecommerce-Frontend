import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FaAddressBook } from 'react-icons/fa';
import AddressInfoModal from '../checkout/AddressInfoModal';
import AddAddressForm from '../checkout/AddAddressForm';
import AddressList from '../checkout/AddressList';
import { DeleteModal } from '../checkout/DeleteModal';
import Skeleton from '../shared/Skeleton';
import { deleteUserAddress, getUserAddresses } from '../../store/actions';

const UserAddresses = () => {
    const dispatch = useDispatch();
    const [openAddressModal, setOpenAddressModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const { address } = useSelector((state) => state.auth);
    const { isLoading, btnLoader, errorMessage } = useSelector((state) => state.errors);

    useEffect(() => {
        dispatch(getUserAddresses());
    }, [dispatch]);

    const handleAddAddress = () => {
        setSelectedAddress(null);
        setOpenAddressModal(true);
    };

    const handleDeleteAddress = () => {
        dispatch(deleteUserAddress(
            toast,
            selectedAddress?.addressId,
            setOpenDeleteModal,
        ));
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Saved Addresses</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Manage the addresses used for shipping and checkout.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleAddAddress}
                    className="inline-flex items-center justify-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                >
                    Add Address
                </button>
            </div>

            {isLoading && (!address || address.length === 0) ? (
                <div className="space-y-4">
                    <Skeleton />
                    <Skeleton />
                </div>
            ) : null}

            {!isLoading && errorMessage ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                </div>
            ) : null}

            {!isLoading && !errorMessage && (!address || address.length === 0) ? (
                <div className="rounded-lg border border-dashed border-gray-300 px-6 py-12 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                        <FaAddressBook size={28} />
                    </div>
                    <h2 className="mt-4 text-xl font-semibold text-gray-900">No saved addresses yet</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Add an address here so it is ready the next time you check out.
                    </p>
                    <button
                        type="button"
                        onClick={handleAddAddress}
                        className="mt-6 inline-flex items-center justify-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                    >
                        Add Your First Address
                    </button>
                </div>
            ) : null}

            {!isLoading && !errorMessage && address?.length > 0 ? (
                <AddressList
                    addresses={address}
                    setSelectedAddress={setSelectedAddress}
                    setOpenAddressModal={setOpenAddressModal}
                    setOpenDeleteModal={setOpenDeleteModal}
                    selectable={false}
                />
            ) : null}

            <AddressInfoModal open={openAddressModal} setOpen={setOpenAddressModal}>
                <AddAddressForm
                    address={selectedAddress}
                    setOpenAddressModal={setOpenAddressModal}
                />
            </AddressInfoModal>

            <DeleteModal
                open={openDeleteModal}
                loader={btnLoader}
                setOpen={setOpenDeleteModal}
                title="Delete Address"
                onDeleteHandler={handleDeleteAddress}
            />
        </div>
    );
};

export default UserAddresses;