import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import { FaFolderOpen, FaThList } from "react-icons/fa";
import { FiRefreshCw, FiSearch } from "react-icons/fi";
import toast from "react-hot-toast";

import Modal from "../../shared/Modal";
import AddCategoryForm from "./AddCategoryForm";
import Loader from "../../shared/Loader";
import { DeleteModal } from "../../../components/shared/DeleteModal";
import useCategoryFilter from "../../../hooks/useCategoryFilter";
import ErrorPage from "../../shared/ErrorPage";
import { deleteCategoryDashboardAction } from "../../../store/actions";
import { categoryTableColumns } from "../../helper/tableColumn";

const Category = () => {
  const [searchParams] = useSearchParams();
  const pathname = useLocation().pathname;
  const params = new URLSearchParams(searchParams);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const [openModal, setOpenModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { categoryLoader, errorMessage } = useSelector((state) => state.errors);
  const { categories, pagination } = useSelector((state) => state.products);
  const [currentPage, setCurrentPage] = useState(
    pagination?.pageNumber + 1 || 1
  );

  useCategoryFilter();

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

  const tableRecords = categories?.map((item) => ({
    id: item.categoryId,
    categoryName: item.categoryName,
    version: item.version,
  }));

  const handleEdit = (category) => {
    setOpenUpdateModal(true);
    setSelectedCategory(category);
  };

  const handleDelete = (category) => {
    setSelectedCategory(category);
    setOpenDeleteModal(true);
  };

  const onDeleteHandler = () => {
    dispatch(
      deleteCategoryDashboardAction(setOpenDeleteModal, selectedCategory?.id, toast)
    );
  };

  const handlePaginationChange = (paginationModel) => {
    const page = paginationModel.page + 1; // Adjust to 1-based index
    setCurrentPage(page);

    params.set("page", page.toString());
    navigate(`${pathname}?${params}`);
  };

  const emptyCategories = !categories || categories?.length === 0;

  if (errorMessage) return <ErrorPage message={errorMessage} />;

  return (
    <div>
      <div className="pt-6 pb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-xl">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search categories by name"
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
          <FaThList className="text-xl" />
          Add Category
        </button>
      </div>
      {!emptyCategories && (
        <h1 className="text-slate-800 text-3xl text-center font-bold pb-6 uppercase">
          All Categories
        </h1>
      )}

      {categoryLoader ? (
        <Loader />
      ) : (
        <>
          {emptyCategories ? (
            <div className="flex flex-col items-center justify-center text-gray-600 py-10">
              <FaFolderOpen size={50} className="mb-3" />
              <h2 className="text-2xl font-semibold">
                {searchParams.get('keyword') ? 'No categories match your search' : 'No Categories Created Yet'}
              </h2>
            </div>
          ) : (
            <div className="max-w-fit mx-auto">
              <DataGrid
                className="w-full"
                rows={tableRecords}
                columns={categoryTableColumns(handleEdit, handleDelete)}
                paginationMode="server"
                rowCount={pagination?.totalElements || 0}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: pagination?.pageSize || 10,
                      page: currentPage - 1,
                    },
                  },
                }}
                onPaginationModelChange={handlePaginationChange}
                disableRowSelectionOnClick
                disableColumnResize
                pageSizeOptions={[pagination?.pageSize || 10]}
                pagination
                paginationOptions={{
                  showFirstButton: true,
                  showLastButton: true,
                  hideNextButton: currentPage === pagination?.totalPages,
                }}
              />
            </div>
          )}
        </>
      )}

      <Modal
        open={openUpdateModal || openModal}
        setOpen={openUpdateModal ? setOpenUpdateModal : setOpenModal}
        title={openUpdateModal ? "Update Category" : "Add Category"}
      >
        <AddCategoryForm
          setOpen={openUpdateModal ? setOpenUpdateModal : setOpenModal}
          open={categoryLoader}
          category={selectedCategory}
          update={openUpdateModal}
        />
      </Modal>

      <DeleteModal
        open={openDeleteModal}
        loader={categoryLoader}
        setOpen={setOpenDeleteModal}
        title="Are you want to delete this category"
        onDeleteHandler={onDeleteHandler}
      />
    </div>
  );
};

export default Category;