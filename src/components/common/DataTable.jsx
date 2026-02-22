import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Box, Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const DataTable = ({
  columns = [],
  rows = [],
  total = 0,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25, 50],
  emptyMessage = 'No data found',
  renderRow,
  loading = false,
}) => {
  const theme = useTheme();

  return (
    <Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: theme.palette.mode === 'dark'
                  ? `${theme.palette.primary.main}15`
                  : `${theme.palette.primary.main}08`,
              }}
            >
              {columns.map((col, i) => (
                <TableCell
                  key={i}
                  align={col.align || 'left'}
                  sx={{
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    color: theme.palette.text.primary,
                    borderBottomColor: theme.palette.divider,
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    ...col.sx,
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length > 0
              ? rows.map((row, index) => renderRow(row, index))
              : (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 8, borderBottomColor: theme.palette.divider }}>
                    <Typography color="text.secondary">{emptyMessage}</Typography>
                  </TableCell>
                </TableRow>
              )}
          </TableBody>
        </Table>
      </TableContainer>
      {total > 0 && onPageChange && (
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => onPageChange(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => onRowsPerPageChange && onRowsPerPageChange(parseInt(e.target.value, 10))}
          rowsPerPageOptions={rowsPerPageOptions}
          sx={{
            borderTop: '1px solid',
            borderColor: theme.palette.divider,
            bgcolor: theme.palette.mode === 'dark'
              ? `${theme.palette.primary.main}08`
              : `${theme.palette.primary.main}04`,
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              fontWeight: 500,
              color: theme.palette.text.secondary,
            },
            '.MuiTablePagination-select': {
              color: theme.palette.text.primary,
            },
          }}
        />
      )}
    </Box>
  );
};

export default DataTable;
