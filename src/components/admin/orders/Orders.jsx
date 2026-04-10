import React, { useEffect, useState } from 'react'
import { FaShoppingCart } from 'react-icons/fa';
import { FiRefreshCw, FiSearch } from 'react-icons/fi';
import OrderTable from './OrderTable';
import { useSelector } from 'react-redux';
import useOrderFilter from '../../../hooks/useOrderFilter';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const Orders = () => {
  const {adminOrder, pagination} = useSelector((state) => state.order);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pathname = useLocation().pathname;

  useOrderFilter();

  useEffect(() => {
    setSearchTerm(searchParams.get('keyword') || '');
  }, [searchParams]);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      const nextParams = new URLSearchParams(searchParams);
      const normalizedSearch = searchTerm.trim();

      if (normalizedSearch === (searchParams.get('keyword') || '')) return;

      if (normalizedSearch) {
        nextParams.set('keyword', normalizedSearch);
      } else {
        nextParams.delete('keyword');
      }
      nextParams.delete('page');
      navigate(`${pathname}?${nextParams.toString()}`);
    }, 500);

    return () => window.clearTimeout(handler);
  }, [navigate, pathname, searchParams, searchTerm]);

  const handleClearSearch = () => {
    setSearchTerm('');
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('keyword');
    nextParams.delete('page');
    navigate(nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname);
  };

  const emptyOrder = !adminOrder || adminOrder?.length ===0;
  return (
    <div className='pb-6 pt-6'>
      <div className='flex flex-col gap-4 pb-6 lg:flex-row lg:items-center lg:justify-between'>
        <div className='relative w-full max-w-xl'>
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='Search orders by email or status'
            className='w-full rounded-md border border-gray-400 py-2 pl-10 pr-12 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#1976d2]'
          />
          <FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-700' size={18} />
          {searchTerm && (
            <button
              type='button'
              onClick={handleClearSearch}
              className='absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-700 transition hover:bg-slate-100'
              title='Clear search'
            >
              <FiRefreshCw size={16} />
            </button>
          )}
        </div>
      </div>

      {emptyOrder ? (
            <div className='flex flex-col items-center justify-center text-gray-600 py-10'>
                <FaShoppingCart size={50} className='mb-3'/>
                <h2 className='text-2xl font-semibold'>
                  {searchParams.get('keyword') ? 'No orders match your search' : 'No Orders Placed Yet'}
                </h2>
            </div>
        ) : (
           <OrderTable adminOrder={adminOrder} pagination={pagination}/>
        )}
    </div>
  )
}

export default Orders