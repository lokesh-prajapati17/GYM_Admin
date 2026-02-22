import React, { useEffect, useState } from 'react';
import {
  Typography, Box, TableRow, TableCell,
  TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { CardComponent, ButtonComponent, DataTable, StatusChip, FormDialog } from '../components/common';
import api from '../services/apiService';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [gyms, setGyms] = useState([]);
  const [form, setForm] = useState({
    gymOrganization: '', subscriptionId: '', amount: '',
    billingCycle: 'monthly', paymentMode: 'cash', transactionReference: '', notes: ''
  });

  const fetchPayments = async () => {
    try {
      const { data } = await api.get('/payments', { params: { page: page + 1, limit: rowsPerPage } });
      setPayments(data.data.payments || []);
      setTotal(data.data.total || 0);
    } catch (err) { console.error(err); }
  };

  const fetchGyms = async () => {
    try {
      const { data } = await api.get('/organizations');
      setGyms(data.data.gyms || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchPayments(); }, [page, rowsPerPage]);
  useEffect(() => { fetchGyms(); }, []);

  const handleGymSelect = (gymId) => {
    const gym = gyms.find((g) => g._id === gymId);
    setForm({ ...form, gymOrganization: gymId, subscriptionId: gym?.subscription?._id || '' });
  };

  const handleRecordPayment = async () => {
    try {
      await api.post('/payments', form);
      setOpenDialog(false);
      setForm({ gymOrganization: '', subscriptionId: '', amount: '', billingCycle: 'monthly', paymentMode: 'cash', transactionReference: '', notes: '' });
      fetchPayments();
    } catch (err) { console.error(err); }
  };

  const columns = [
    { label: 'Gym' }, { label: 'Amount' }, { label: 'Mode' },
    { label: 'Cycle' }, { label: 'Reference' }, { label: 'Date' }, { label: 'Entered By' },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">Payments</Typography>
        <ButtonComponent startIcon={<Add />} onClick={() => setOpenDialog(true)}>Record Payment</ButtonComponent>
      </Box>

      <CardComponent noPadding>
        <DataTable
          columns={columns}
          rows={payments}
          total={total}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(val) => { setRowsPerPage(val); setPage(0); }}
          emptyMessage="No payments recorded yet"
          renderRow={(p) => (
            <TableRow key={p._id} hover>
              <TableCell><Typography fontWeight={600}>{p.gymOrganization?.name || '—'}</Typography></TableCell>
              <TableCell><Typography fontWeight={600} color="success.main">₹{p.amount?.toLocaleString()}</Typography></TableCell>
              <TableCell><StatusChip label={p.paymentMode} /></TableCell>
              <TableCell>{p.billingCycle}</TableCell>
              <TableCell>{p.transactionReference || '—'}</TableCell>
              <TableCell>{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '—'}</TableCell>
              <TableCell>{p.enteredBy?.name || '—'}</TableCell>
            </TableRow>
          )}
        />
      </CardComponent>

      <FormDialog open={openDialog} onClose={() => setOpenDialog(false)} title="Record Payment" onSubmit={handleRecordPayment} submitLabel="Record Payment">
        <FormControl fullWidth>
          <InputLabel>Gym Organization</InputLabel>
          <Select value={form.gymOrganization} label="Gym Organization" onChange={(e) => handleGymSelect(e.target.value)}>
            {gyms.map((g) => <MenuItem key={g._id} value={g._id}>{g.name}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField label="Amount (₹)" type="number" fullWidth value={form.amount} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || '' })} />
        <FormControl fullWidth>
          <InputLabel>Billing Cycle</InputLabel>
          <Select value={form.billingCycle} label="Billing Cycle" onChange={(e) => setForm({ ...form, billingCycle: e.target.value })}>
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="yearly">Yearly</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Payment Mode</InputLabel>
          <Select value={form.paymentMode} label="Payment Mode" onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}>
            <MenuItem value="cash">Cash</MenuItem>
            <MenuItem value="bank">Bank Transfer</MenuItem>
            <MenuItem value="upi">UPI</MenuItem>
            <MenuItem value="cheque">Cheque</MenuItem>
          </Select>
        </FormControl>
        <TextField label="Transaction Reference" fullWidth value={form.transactionReference} onChange={(e) => setForm({ ...form, transactionReference: e.target.value })} />
        <TextField label="Notes" fullWidth multiline rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </FormDialog>
    </Box>
  );
};

export default Payments;
