import React from 'react';
import { Button, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const ButtonComponent = ({
  children,
  variant = "contained",
  color = "primary",
  onClick,
  loading = false,
  disabled = false,
  startIcon,
  endIcon,
  fullWidth = false,
  size = "medium",
  type,
  sx = {},
  ...props
}) => {
  const theme = useTheme();
  const paletteColor = theme.palette[color] || theme.palette.primary;

  return (
    <Button
      variant={variant}
      color={color}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      size={size}
      startIcon={loading ? <CircularProgress size={18} color="inherit" /> : startIcon}
      endIcon={!loading && endIcon}
      sx={{
        borderRadius: '10px',
        fontWeight: 600,
        textTransform: 'none',
        transition: 'all 0.2s ease',
        boxShadow: variant === 'contained'
          ? `0 4px 14px ${paletteColor.main}30`
          : 'none',
        '&:hover': {
          transform: disabled || loading ? 'none' : 'translateY(-1px)',
          boxShadow: variant === 'contained'
            ? `0 6px 20px ${paletteColor.main}40`
            : 'none',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
        ...sx,
      }}
      {...props}
    >
      {loading ? "Please wait..." : children}
    </Button>
  );
};

export default ButtonComponent;
