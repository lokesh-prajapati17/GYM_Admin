import React from 'react';
import { Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const StatusChip = ({ label, variant = 'filled', size = 'small', sx = {} }) => {
  const theme = useTheme();

  const colorMap = {
    active: 'success',
    trial: 'info',
    grace: 'warning',
    expired: 'error',
    suspended: 'default',
    cancelled: 'default',
    deleted: 'error',
    paid: 'success',
    pending: 'warning',
    cash: 'success',
    bank: 'info',
    upi: 'secondary',
    cheque: 'warning',
    monthly: 'primary',
    yearly: 'secondary',
  };

  const chipColor = colorMap[label?.toLowerCase()] || 'default';

  return (
    <Chip
      label={label}
      color={chipColor}
      variant={variant}
      size={size}
      sx={{
        fontWeight: 600,
        borderRadius: 1.5,
        ...(variant === 'outlined' && chipColor !== 'default' && {
          borderColor: theme.palette[chipColor]?.main,
          color: theme.palette[chipColor]?.main,
        }),
        ...sx,
      }}
    />
  );
};

export default StatusChip;
