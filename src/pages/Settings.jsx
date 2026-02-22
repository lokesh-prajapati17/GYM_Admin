import React from 'react';
import {
  Typography, Box, Grid, Switch, FormControlLabel, Divider, Chip
} from '@mui/material';
import {
  Palette, DarkMode, Tune, Timer, GppGood
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import { toggleMode, setColor } from '../store/themeSlice';
import { CardComponent } from '../components/common';

const colorOptions = [
  { key: 'ocean', label: 'Ocean Blue', hex: '#0ea5e9' },
  { key: 'forest', label: 'Forest Green', hex: '#22c55e' },
  { key: 'sunset', label: 'Sunset Orange', hex: '#f97316' },
  { key: 'midnight', label: 'Midnight Purple', hex: '#8b5cf6' },
];

const Settings = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { mode, color } = useSelector((state) => state.theme);

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>Settings</Typography>

      <Grid container spacing={3}>
        {/* Theme Mode */}
        <Grid item xs={12} md={6}>
          <CardComponent title="Appearance" icon={<DarkMode />}>
            <Box sx={{ mt: 1 }}>
              <FormControlLabel
                control={<Switch checked={mode === 'dark'} onChange={() => dispatch(toggleMode())} color="primary" />}
                label={mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                Toggle between dark and light mode for the admin panel.
              </Typography>
            </Box>
          </CardComponent>
        </Grid>

        {/* Color Theme */}
        <Grid item xs={12} md={6}>
          <CardComponent title="Color Theme" icon={<Palette />}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1 }}>
              {colorOptions.map((opt) => (
                <Chip
                  key={opt.key}
                  label={opt.label}
                  onClick={() => dispatch(setColor(opt.key))}
                  variant={color === opt.key ? 'filled' : 'outlined'}
                  sx={{
                    fontWeight: 600,
                    borderColor: opt.hex,
                    color: color === opt.key ? '#fff' : opt.hex,
                    bgcolor: color === opt.key ? opt.hex : 'transparent',
                    '&:hover': { bgcolor: `${opt.hex}20` },
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Box>
          </CardComponent>
        </Grid>

        {/* Default Configuration */}
        <Grid item xs={12} md={6}>
          <CardComponent title="Subscription Defaults" icon={<Timer />}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight={500}>Default Trial Days</Typography>
                <Chip label="14 days" color="info" size="small" />
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight={500}>Grace Period Days</Typography>
                <Chip label="7 days" color="warning" size="small" />
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight={500}>Auto-Suspend After Grace</Typography>
                <Chip label="Enabled" color="success" size="small" />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                These defaults are applied when creating new organizations. They can be overridden per-organization.
              </Typography>
            </Box>
          </CardComponent>
        </Grid>

        {/* Feature Flags */}
        <Grid item xs={12} md={6}>
          <CardComponent title="Global Feature Flags" icon={<Tune />}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
              {[
                { label: 'VR Module', enabled: true },
                { label: 'Advanced Analytics', enabled: true },
                { label: 'QR Check-In', enabled: true },
                { label: 'Multi-City Support', enabled: true },
                { label: 'Public Website', enabled: true },
                { label: 'Marketing Tools', enabled: false },
              ].map((f) => (
                <FormControlLabel
                  key={f.label}
                  control={<Switch checked={f.enabled} color="primary" />}
                  label={f.label}
                  sx={{ mx: 0 }}
                />
              ))}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Global toggles override plan-level feature flags. Use carefully.
              </Typography>
            </Box>
          </CardComponent>
        </Grid>

        {/* Security */}
        <Grid item xs={12}>
          <CardComponent title="Security" icon={<GppGood />}>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              {[
                { label: 'JWT Authentication', status: 'Active' },
                { label: 'Refresh Tokens', status: 'Active' },
                { label: 'Rate Limiting', status: '1000 req / 15min' },
                { label: 'Helmet Protection', status: 'Active' },
                { label: 'Password Hashing', status: 'bcrypt (12 rounds)' },
                { label: 'Account Lock', status: '5 attempts → 30min' },
                { label: '2FA', status: 'Coming Soon' },
              ].map((s) => (
                <Grid item xs={12} sm={6} md={4} key={s.label}>
                  <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: theme.palette.divider, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight={500}>{s.label}</Typography>
                    <Chip label={s.status} size="small" color={s.status === 'Coming Soon' ? 'default' : 'success'} variant="outlined" />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardComponent>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
