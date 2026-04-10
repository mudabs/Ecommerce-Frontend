import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";

import { getAllSellersDashboard } from "../../../store/actions";

const useSellerFilter = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams();

    const currentPage = searchParams.get("page")
      ? Number(searchParams.get("page"))
      : 1;
    params.set("pageNumber", currentPage - 1);

    const keyword = searchParams.get("keyword") || null;
    if (keyword) {
      params.set("keyword", keyword);
    }

    const queryString = params.toString();
    dispatch(getAllSellersDashboard(queryString));
  }, [dispatch, searchParams]);
};

export default useSellerFilter;