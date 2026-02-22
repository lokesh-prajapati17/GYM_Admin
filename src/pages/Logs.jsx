import React, { useEffect, useState } from 'react';
import {
  Typography, Box, TableRow, TableCell,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { CardComponent, ButtonComponent, DataTable, StatusChip, SearchBar } from '../components/common';
import api from '../services/apiService';

const actionColors = {
  'Gym Created': 'success', 'Gym Updated': 'info', 'Gym Suspended': 'warning',
  'Gym Reactivated': 'success', 'Gym Deleted': 'error', 'Plan Created': 'success',
  'Plan Updated': 'info', 'Payment Recorded': 'success', 'Subscription Renewed': 'info',
  'Plan Upgraded': 'secondary', 'Owner Password Reset': 'warning',
};

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [actionFilter, setActionFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      const { data } = await api.get('/logs', {
        params: { action: actionFilter, search, page: page + 1, limit: rowsPerPage }
      });
      setLogs(data.data.logs || []);
      setTotal(data.data.total || 0);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchLogs(); }, [actionFilter, search, page, rowsPerPage]);

  const columns = [
    { label: 'Action' }, { label: 'Organization' }, { label: 'Details' },
    { label: 'Performed By' }, { label: 'Timestamp' },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight="bold">Audit Logs</Typography>
        <ButtonComponent variant="outlined" startIcon={<Refresh />} onClick={fetchLogs}>Refresh</ButtonComponent>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search logs..." />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Action</InputLabel>
          <Select value={actionFilter} label="Filter by Action" onChange={(e) => setActionFilter(e.target.value)}>
            <MenuItem value="">All Actions</MenuItem>
            {Object.keys(actionColors).map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <CardComponent noPadding>
        <DataTable
          columns={columns}
          rows={logs}
          total={total}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(val) => { setRowsPerPage(val); setPage(0); }}
          emptyMessage="No audit logs found"
          renderRow={(log) => (
            <TableRow key={log._id} hover>
              <TableCell><StatusChip label={log.action} /></TableCell>
              <TableCell>{log.gymOrganization?.name || '—'}</TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details || '—'}
                </Typography>
              </TableCell>
              <TableCell>{log.performedBy?.name || '—'}</TableCell>
              <TableCell>{log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}</TableCell>
            </TableRow>
          )}
        />
      </CardComponent>
    </Box>
  );
};

export default Logs;
