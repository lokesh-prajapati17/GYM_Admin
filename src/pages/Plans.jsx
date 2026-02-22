import React, { useEffect, useState } from 'react';
import {
  Typography, Box, Grid, Chip, Switch, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControlLabel, Checkbox
} from '@mui/material';
import { Add, CheckCircle, Cancel } from '@mui/icons-material';
import { motion } from 'framer-motion';
import CardComponent from '../components/common/Card';
import ButtonComponent from '../components/common/Button';
import api from '../services/apiService';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', branchLimit: 1, memberLimitPerBranch: 300,
    priceMonthly: 0, priceYearly: 0,
    features: { vrEnabled: false, analyticsAdvanced: false, qrCheckIn: false, multiCitySupport: false, publicWebsite: false }
  });

  const fetchPlans = async () => {
    try {
      const { data } = await api.get('/plans');
      setPlans(data.data.plans || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleOpen = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setForm({
        name: plan.name, description: plan.description || '', branchLimit: plan.branchLimit,
        memberLimitPerBranch: plan.memberLimitPerBranch, priceMonthly: plan.priceMonthly,
        priceYearly: plan.priceYearly || 0,
        features: plan.features || {}
      });
    } else {
      setEditingPlan(null);
      setForm({ name: '', description: '', branchLimit: 1, memberLimitPerBranch: 300, priceMonthly: 0, priceYearly: 0, features: { vrEnabled: false, analyticsAdvanced: false, qrCheckIn: false, multiCitySupport: false, publicWebsite: false } });
    }
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editingPlan) {
        await api.put(`/plans/${editingPlan._id}`, form);
      } else {
        await api.post('/plans', form);
      }
      setOpenDialog(false);
      fetchPlans();
    } catch (err) { console.error(err); }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/plans/${id}/toggle`);
      fetchPlans();
    } catch (err) { console.error(err); }
  };

  const featureLabels = {
    vrEnabled: 'VR Module',
    analyticsAdvanced: 'Advanced Analytics',
    qrCheckIn: 'QR Check-In',
    multiCitySupport: 'Multi-City Support',
    publicWebsite: 'Public Website',
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">Subscription Plans</Typography>
        <ButtonComponent startIcon={<Add />} onClick={() => handleOpen()}>Create Plan</ButtonComponent>
      </Box>

      <Grid container spacing={3}>
        {plans.map((plan, index) => (
          <Grid item xs={12} sm={6} lg={3} key={plan._id}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <CardComponent hover>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Chip label={plan.isActive ? 'Active' : 'Inactive'} color={plan.isActive ? 'success' : 'default'} size="small" sx={{ mb: 1 }} />
                  <Typography variant="h5" fontWeight="bold">{plan.name}</Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary.main" sx={{ mt: 1 }}>
                    ₹{plan.priceMonthly.toLocaleString()}
                    <Typography component="span" variant="body2" color="text.secondary">/mo</Typography>
                  </Typography>
                  {plan.priceYearly > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      ₹{plan.priceYearly.toLocaleString()}/year
                    </Typography>
                  )}
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary">Branches</Typography>
                    <Typography variant="body2" fontWeight={600}>{plan.branchLimit === 0 ? 'Unlimited' : plan.branchLimit}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary">Members/Branch</Typography>
                    <Typography variant="body2" fontWeight={600}>{plan.memberLimitPerBranch === 0 ? 'Unlimited' : plan.memberLimitPerBranch}</Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  {Object.entries(featureLabels).map(([key, label]) => (
                    <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                      {plan.features?.[key] ? <CheckCircle fontSize="small" color="success" /> : <Cancel fontSize="small" color="error" />}
                      <Typography variant="body2">{label}</Typography>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <ButtonComponent variant="outlined" size="small" fullWidth onClick={() => handleOpen(plan)}>Edit</ButtonComponent>
                  <ButtonComponent variant="outlined" size="small" fullWidth color={plan.isActive ? 'warning' : 'success'} onClick={() => handleToggle(plan._id)}>
                    {plan.isActive ? 'Deactivate' : 'Activate'}
                  </ButtonComponent>
                </Box>
              </CardComponent>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Plan Name" fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Description" fullWidth multiline rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Grid container spacing={2}>
              <Grid item xs={6}><TextField label="Branch Limit (0=unlimited)" type="number" fullWidth value={form.branchLimit} onChange={(e) => setForm({ ...form, branchLimit: parseInt(e.target.value) || 0 })} /></Grid>
              <Grid item xs={6}><TextField label="Members/Branch (0=unlimited)" type="number" fullWidth value={form.memberLimitPerBranch} onChange={(e) => setForm({ ...form, memberLimitPerBranch: parseInt(e.target.value) || 0 })} /></Grid>
              <Grid item xs={6}><TextField label="Price Monthly (₹)" type="number" fullWidth value={form.priceMonthly} onChange={(e) => setForm({ ...form, priceMonthly: parseFloat(e.target.value) || 0 })} /></Grid>
              <Grid item xs={6}><TextField label="Price Yearly (₹)" type="number" fullWidth value={form.priceYearly} onChange={(e) => setForm({ ...form, priceYearly: parseFloat(e.target.value) || 0 })} /></Grid>
            </Grid>
            <Typography variant="subtitle2" sx={{ mt: 1 }}>Features</Typography>
            {Object.entries(featureLabels).map(([key, label]) => (
              <FormControlLabel key={key} control={<Checkbox checked={form.features[key] || false} onChange={(e) => setForm({ ...form, features: { ...form.features, [key]: e.target.checked } })} />} label={label} />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <ButtonComponent variant="outlined" onClick={() => setOpenDialog(false)}>Cancel</ButtonComponent>
          <ButtonComponent onClick={handleSave}>{editingPlan ? 'Update' : 'Create'}</ButtonComponent>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Plans;
