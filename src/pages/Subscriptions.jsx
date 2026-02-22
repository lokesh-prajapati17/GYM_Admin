import React, { useEffect, useState } from 'react';
import {
  Typography, Box, TableRow, TableCell, IconButton, Tooltip, Menu, MenuItem,
  FormControl, InputLabel, Select, TextField, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Download, Refresh, MoreVert, Pause, PlayArrow, Cancel, Extension, Schedule } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { CardComponent, ButtonComponent, DataTable, StatusChip } from '../components/common';
import api from '../services/apiService';

const Subscriptions = () => {
  const theme = useTheme();
  const [subs, setSubs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const [extendDialog, setExtendDialog] = useState(false);
  const [extendDays, setExtendDays] = useState(30);

  const fetchSubs = async () => {
    try {
      const { data } = await api.get('/subscriptions', {
        params: { status: statusFilter, page: page + 1, limit: rowsPerPage }
      });
      setSubs(data.data.subscriptions || []);
      setTotal(data.data.total || 0);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchSubs(); }, [statusFilter, page, rowsPerPage]);

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/subscriptions/export-csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'subscriptions.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) { console.error(err); }
  };

  const handleAction = async (action) => {
    if (!selectedSub) return;
    setAnchorEl(null);
    try {
      if (action === 'renew') await api.patch(`/subscriptions/${selectedSub._id}/renew`, { billingCycle: selectedSub.billingCycle });
      else if (action === 'suspend') await api.patch(`/subscriptions/${selectedSub._id}/suspend`);
      else if (action === 'cancel') await api.patch(`/subscriptions/${selectedSub._id}/cancel`);
      else if (action === 'extend') { setExtendDialog(true); return; }
      fetchSubs();
    } catch (err) { console.error(err); }
  };

  const handleExtendSubmit = async () => {
    try {
      await api.patch(`/subscriptions/${selectedSub._id}/extend`, { days: extendDays });
      setExtendDialog(false);
      setExtendDays(30);
      fetchSubs();
    } catch (err) { console.error(err); }
  };

  const columns = [
    { label: 'Gym' }, { label: 'Plan' }, { label: 'Billing' },
    { label: 'Status' }, { label: 'Grace' }, { label: 'Start' }, { label: 'Expiry' },
    { label: 'Actions', align: 'right' },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight="bold">Subscriptions</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <ButtonComponent variant="outlined" startIcon={<Download />} onClick={handleExportCSV}>Export CSV</ButtonComponent>
          <ButtonComponent variant="outlined" startIcon={<Refresh />} onClick={fetchSubs}>Refresh</ButtonComponent>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select value={statusFilter} label="Filter by Status" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="grace">Grace</MenuItem>
            <MenuItem value="expired">Expired</MenuItem>
            <MenuItem value="suspended">Suspended</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <CardComponent noPadding>
        <DataTable
          columns={columns}
          rows={subs}
          total={total}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(val) => { setRowsPerPage(val); setPage(0); }}
          emptyMessage="No subscriptions found"
          renderRow={(sub) => (
            <TableRow key={sub._id} hover>
              <TableCell>
                <Typography fontWeight={600}>{sub.gymOrganization?.name || '—'}</Typography>
                <Typography variant="caption" color="text.secondary">{sub.gymOrganization?.ownerEmail}</Typography>
              </TableCell>
              <TableCell>{sub.plan?.name || '—'}</TableCell>
              <TableCell><StatusChip label={sub.billingCycle} variant="outlined" /></TableCell>
              <TableCell><StatusChip label={sub.status} /></TableCell>
              <TableCell>{sub.gracePeriodDays || 0} days</TableCell>
              <TableCell>{sub.startDate ? new Date(sub.startDate).toLocaleDateString() : '—'}</TableCell>
              <TableCell>{sub.expiryDate ? new Date(sub.expiryDate).toLocaleDateString() : '—'}</TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={(e) => { setAnchorEl(e.currentTarget); setSelectedSub(sub); }}>
                  <MoreVert />
                </IconButton>
              </TableCell>
            </TableRow>
          )}
        />
      </CardComponent>

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => handleAction('renew')}><PlayArrow sx={{ mr: 1 }} /> Renew</MenuItem>
        <MenuItem onClick={() => handleAction('extend')}><Extension sx={{ mr: 1 }} /> Extend</MenuItem>
        <MenuItem onClick={() => handleAction('suspend')}><Pause sx={{ mr: 1 }} /> Suspend</MenuItem>
        <MenuItem onClick={() => handleAction('cancel')}><Cancel sx={{ mr: 1 }} /> Cancel</MenuItem>
      </Menu>

      {/* Extend Dialog */}
      <Dialog open={extendDialog} onClose={() => setExtendDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Extend Subscription</DialogTitle>
        <DialogContent>
          <TextField label="Days to Extend" type="number" fullWidth value={extendDays}
            onChange={(e) => setExtendDays(parseInt(e.target.value) || 0)} sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <ButtonComponent variant="outlined" onClick={() => setExtendDialog(false)}>Cancel</ButtonComponent>
          <ButtonComponent onClick={handleExtendSubmit}>Extend</ButtonComponent>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Subscriptions;
