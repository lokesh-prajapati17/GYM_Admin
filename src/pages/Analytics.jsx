import React, { useEffect, useState } from 'react';
import { Typography, Box, Grid, CircularProgress } from '@mui/material';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import CardComponent from '../components/common/Card';
import api from '../services/apiService';

const Analytics = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState([]);
  const [plans, setPlans] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [growth, setGrowth] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [revRes, planRes, statusRes, growthRes] = await Promise.all([
          api.get('/dashboard/charts/revenue'),
          api.get('/dashboard/charts/plans'),
          api.get('/dashboard/charts/statuses'),
          api.get('/dashboard/charts/growth'),
        ]);
        setRevenue(revRes.data.data || []);
        setPlans(planRes.data.data || []);
        setStatuses(statusRes.data.data || []);
        setGrowth(growthRes.data.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const COLORS = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.warning.main, theme.palette.success.main, theme.palette.error.main, theme.palette.info.main];

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>Analytics</Typography>

      <Grid container spacing={3}>
        {/* Revenue Chart */}
        <Grid item xs={12} lg={6}>
          <CardComponent title="Monthly Revenue" subtitle="Last 12 months">
            <Box sx={{ height: 320, mt: 2 }}>
              <ResponsiveContainer>
                <AreaChart data={revenue}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke={theme.palette.text.secondary} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke={theme.palette.text.secondary} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                  <Tooltip contentStyle={{ backgroundColor: theme.palette.background.paper, borderRadius: 8, border: `1px solid ${theme.palette.divider}` }} formatter={(v) => [`₹${v}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke={theme.palette.primary.main} strokeWidth={3} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardComponent>
        </Grid>

        {/* Gym Growth */}
        <Grid item xs={12} lg={6}>
          <CardComponent title="Gym Growth" subtitle="New gyms per month">
            <Box sx={{ height: 320, mt: 2 }}>
              <ResponsiveContainer>
                <BarChart data={growth}>
                  <XAxis dataKey="month" stroke={theme.palette.text.secondary} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke={theme.palette.text.secondary} fontSize={12} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                  <Tooltip contentStyle={{ backgroundColor: theme.palette.background.paper, borderRadius: 8, border: `1px solid ${theme.palette.divider}` }} />
                  <Bar dataKey="gyms" fill={theme.palette.secondary.main} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardComponent>
        </Grid>

        {/* Plan Distribution */}
        <Grid item xs={12} sm={6}>
          <CardComponent title="Plan Distribution" subtitle="Active subscriptions by plan">
            <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={plans} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none">
                    {plans.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: theme.palette.background.paper, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
                {plans.map((e, i) => (
                  <Box key={e.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS[i % COLORS.length] }} />
                    <Typography variant="caption">{e.name} ({e.value})</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </CardComponent>
        </Grid>

        {/* Status Distribution */}
        <Grid item xs={12} sm={6}>
          <CardComponent title="Subscription Status" subtitle="Current status breakdown">
            <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statuses} cx="50%" cy="50%" outerRadius={85} dataKey="value" stroke="none">
                    {statuses.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: theme.palette.background.paper, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
                {statuses.map((e, i) => (
                  <Box key={e.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS[i % COLORS.length] }} />
                    <Typography variant="caption">{e.name} ({e.value})</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </CardComponent>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;
