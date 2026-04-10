import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { MdPersonAdd } from "react-icons/md";
import { FiRefreshCw, FiSearch } from "react-icons/fi";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import SellerTable from "./SellerTable";
import ErrorPage from "../../shared/ErrorPage";
import Loader from "../../shared/Loader";
import Modal from "../../shared/Modal";
import AddSellerForm from "./AddSellerForm";
import useSellerFilter from "./useSellerFilter";

const Sellers = () => {
  const [openModal, setOpenModal] = useState(false);
  const { sellers, pagination } = useSelector((state) => state.seller);
  const { isLoading, errorMessage } = useSelector((state) => state.errors);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pathname = useLocation().pathname;

  useSellerFilter();

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

  const emptySellers = !sellers || sellers?.length === 0;

  if (errorMessage) {
    return <ErrorPage message={errorMessage} />;
  }

  return (
    <React.Fragment>
      <div className="pt-6 pb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-xl">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search sellers by username or email"
            className="w-full rounded-md border border-gray-400 py-2 pl-10 pr-12 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#1976d2]"
          />
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-700 transition hover:bg-slate-100"
              title="Clear search"
            >
              <FiRefreshCw size={16} />
            </button>
          )}
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-custom-blue hover:bg-blue-800 text-white font-semibold py-2 px-4 flex items-center gap-2 rounded-md shadow-md transition-colors hover:text-slate-300 duration-300"
        >
          <MdPersonAdd className="text-xl" />
          Add Seller
        </button>
      </div>

      {!emptySellers && (
        <h1 className="text-slate-800 text-3xl text-center font-bold pb-6 uppercase">
          All Sellers
        </h1>
      )}

      {isLoading ? (
        <Loader />
      ) : (
        <>
          {emptySellers ? (
            <>
              <div className="flex flex-col items-center justify-center text-gray-600 py-10">
                <h2 className="text-2xl font-semibold">
                  {searchParams.get('keyword') ? 'No sellers match your search' : 'No Seller Created Yet'}
                </h2>
              </div>
            </>
          ) : (
            <SellerTable sellers={sellers} pagination={pagination} />
          )}
        </>
      )}

      <Modal open={openModal} setOpen={setOpenModal} title="Add New Seller">
        <AddSellerForm setOpen={setOpenModal} />
      </Modal>
    </React.Fragment>
  );
};

export default Sellers;