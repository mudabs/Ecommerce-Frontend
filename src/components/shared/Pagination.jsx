import { Pagination as MuiPagination, Stack, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    pageSize,
    pageSizeOptions = [2, 4, 8, 12, 16],
    onPageSizeChange,
    className = "",
}) => {
    const showPager = totalPages > 1;
    const showPageSize = typeof onPageSizeChange === "function";

    return (
        <nav className={className} aria-label="Pagination">
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems="center"
                justifyContent="space-between"
                sx={{ py: 3 }}
            >
                {showPageSize ? (
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel id="page-size-select-label">Page Size</InputLabel>
                        <Select
                            labelId="page-size-select-label"
                            value={pageSize}
                            label="Page Size"
                            onChange={(event) => onPageSizeChange(Number(event.target.value))}
                        >
                            {pageSizeOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option} / page
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ) : (
                    <span />
                )}
                {showPager ? (
                    <MuiPagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(_, page) => onPageChange(page)}
                        color="primary"
                        shape="rounded"
                        showFirstButton
                        showLastButton
                    />
                ) : null}
            </Stack>
        </nav>
    );
};

export default Pagination;
