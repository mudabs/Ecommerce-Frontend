import { Pagination as MuiPagination, Stack } from "@mui/material";

const Pagination = ({ currentPage, totalPages, onPageChange, className = "" }) => {
    if (totalPages <= 1) return null;

    return (
        <nav className={className} aria-label="Pagination">
            <Stack alignItems="center" sx={{ py: 3 }}>
                <MuiPagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(_, page) => onPageChange(page)}
                    color="primary"
                    shape="rounded"
                    showFirstButton
                    showLastButton
                />
            </Stack>
        </nav>
    );
};

export default Pagination;
