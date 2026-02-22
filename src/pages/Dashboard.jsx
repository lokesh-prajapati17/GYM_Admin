import React, { useEffect, useState } from 'react';
import { Typography, Grid, Box, CircularProgress } from '@mui/material';
import { 
  Storefront, 
  Group, 
  Payment, 
  WarningAmber,
  CheckCircle,
  AccountBalanceWallet
} from '@mui/icons-material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTheme } from '@mui/material/styles';
import CardComponent from '../components/common/Card';
import api from '../services/apiService';

const KPICard = ({ title, value, subtitle, icon, color }) => (
  <CardComponent 
    icon={icon} 
    title={title} 
    subtitle={subtitle}
    hover
  >
    <Box sx={{ mt: 1 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ color: color }}>
        {value}
      </Typography>
    </Box>
  </CardComponent>
);

const Dashboard = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [planData, setPlanData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [kpiRes, revRes, planRes] = await Promise.all([
          api.get('/dashboard/kpis'),
          api.get('/dashboard/charts/revenue'),
          api.get('/dashboard/charts/plans')
        ]);
        
        setKpis(kpiRes.data.data);
        setRevenueData(revRes.data.data);
        setPlanData(planRes.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Pre-defined colors for Pie Chart
  const COLORS = [
    theme.palette.primary.main, 
    theme.palette.secondary.main, 
    theme.palette.warning.main, 
    theme.palette.success.main
  ];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Master Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Overview of all gym organizations and platform statistics.
          </Typography>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard 
            title="Total Gyms" 
            value={kpis?.totalGyms || 0} 
            subtitle={`${kpis?.activeGyms || 0} active, ${kpis?.suspendedGyms || 0} suspended`}
            icon={<Storefront />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard 
            title="Total Members" 
            value={kpis?.totalMembers || 0} 
            subtitle="Across all gym branches"
            icon={<Group />}
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard 
            title="Monthly Revenue" 
            value={`₹${(kpis?.monthlyRevenue || 0).toLocaleString()}`} 
            subtitle={`Total: ₹${(kpis?.totalRevenue || 0).toLocaleString()}`}
            icon={<AccountBalanceWallet />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard 
            title="Upcoming Expiries" 
            value={kpis?.upcomingExpiry || 0} 
            subtitle="Subscriptions expiring in next 7 days"
            icon={<WarningAmber />}
            color="warning.main"
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3}>
        {/* Revenue Chart */}
        <Grid item xs={12} lg={8}>
          <CardComponent title="Revenue Growth" subtitle="Monthly revenue for the past 12 months">
            <Box sx={{ height: 350, width: '100%', mt: 2 }}>
              <ResponsiveContainer>
                <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    stroke={theme.palette.text.secondary} 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke={theme.palette.text.secondary} 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: '8px',
                      border: `1px solid ${theme.palette.divider}`
                    }}
                    formatter={(value) => [`₹${value}`, "Revenue"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={theme.palette.primary.main} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardComponent>
        </Grid>

        {/* Plan Distribution Chart */}
        <Grid item xs={12} lg={4}>
          <CardComponent title="Plan Distribution" subtitle="Active subscriptions by plan">
            <Box sx={{ height: 350, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              {planData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={planData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {planData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: theme.palette.background.paper,
                          borderRadius: '8px',
                          border: `1px solid ${theme.palette.divider}`
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Custom Legend */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, mt: 2 }}>
                    {planData.map((entry, index) => (
                      <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS[index % COLORS.length] }} />
                        <Typography variant="body2">{entry.name} ({entry.value})</Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              ) : (
                <Typography color="text.secondary">No active plans found</Typography>
              )}
            </Box>
          </CardComponent>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
