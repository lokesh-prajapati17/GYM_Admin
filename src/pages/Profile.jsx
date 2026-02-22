import React, { useEffect, useState } from 'react';
import {
  Typography, Box, Grid, TextField, Divider, TableRow, TableCell, Avatar, Chip
} from '@mui/material';
import { Person, Lock, History } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import { CardComponent, ButtonComponent, DataTable } from '../components/common';
import { updateUser } from '../store/authSlice';
import api from '../services/apiService';

const Profile = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState({ name: '', phone: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loginHistory, setLoginHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchLoginHistory();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/auth/profile');
      setProfile({ name: data.data.name || '', phone: data.data.phone || '' });
    } catch (err) { console.error(err); }
  };

  const fetchLoginHistory = async () => {
    try {
      const { data } = await api.get('/auth/login-history');
      setLoginHistory(data.data || []);
    } catch (err) { console.error(err); }
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', profile);
      dispatch(updateUser({ name: data.data.name }));
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) return;
    setChangingPw(true);
    try {
      await api.put('/auth/change-password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { console.error(err); }
    setChangingPw(false);
  };

  const historyColumns = [
    { label: 'Action' }, { label: 'IP Address' }, { label: 'Date & Time' },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>Profile</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <CardComponent title="Profile Information" icon={<Person />}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: theme.palette.primary.main, fontSize: 28 }}>
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>{user?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
                  <Chip label="Super Admin" size="small" color="primary" sx={{ mt: 0.5, fontWeight: 600 }} />
                </Box>
              </Box>
              <TextField label="Full Name" fullWidth value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              <TextField label="Phone" fullWidth value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              <ButtonComponent onClick={handleUpdateProfile} loading={saving}>Update Profile</ButtonComponent>
            </Box>
          </CardComponent>
        </Grid>

        <Grid item xs={12} md={6}>
          <CardComponent title="Change Password" icon={<Lock />}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
              <TextField label="Current Password" type="password" fullWidth value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
              <TextField label="New Password" type="password" fullWidth value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
              <TextField label="Confirm New Password" type="password" fullWidth value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                error={passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword}
                helperText={passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword ? 'Passwords do not match' : ''}
              />
              <ButtonComponent onClick={handleChangePassword} loading={changingPw}
                disabled={!passwords.currentPassword || !passwords.newPassword || passwords.newPassword !== passwords.confirmPassword}
              >
                Change Password
              </ButtonComponent>
            </Box>
          </CardComponent>
        </Grid>

        <Grid item xs={12}>
          <CardComponent title="Login History" icon={<History />} noPadding>
            <DataTable
              columns={historyColumns}
              rows={loginHistory}
              total={loginHistory.length}
              emptyMessage="No login history found"
              renderRow={(log, index) => (
                <TableRow key={log._id || index} hover>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.details?.ip || '—'}</TableCell>
                  <TableCell>{log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}</TableCell>
                </TableRow>
              )}
            />
          </CardComponent>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
