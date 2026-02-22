import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const CardComponent = ({ title, subtitle, children, icon, action, noPadding = false, hover = false }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        border: '1px solid',
        borderColor: theme.palette.divider,
        backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(30, 41, 59, 0.85)'
          : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        boxShadow: theme.palette.mode === 'dark'
          ? `0 4px 24px rgba(0,0,0,0.3)`
          : `0 1px 4px rgba(0,0,0,0.06)`,
        transition: 'all 0.25s ease',
        ...(hover && {
          '&:hover': {
            transform: 'translateY(-4px)',
            borderColor: `${theme.palette.primary.main}50`,
            boxShadow: `0 12px 32px ${theme.palette.primary.main}15`,
          },
        }),
      }}
    >
      {(title || action) && (
        <Box
          sx={{
            px: 2.5,
            pt: 2.5,
            pb: noPadding ? 2 : 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            ...(noPadding && {
              borderBottom: '1px solid',
              borderColor: theme.palette.divider,
            }),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {icon && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: `${theme.palette.primary.main}15`,
                  color: theme.palette.primary.main,
                  borderRadius: 2,
                  p: 1,
                }}
              >
                {icon}
              </Box>
            )}
            <Box>
              {title && (
                <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: '1.05rem' }}>
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.25 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          {action && <Box>{action}</Box>}
        </Box>
      )}
      <CardContent sx={{ p: noPadding ? 0 : 2.5, flexGrow: 1, '&:last-child': { pb: noPadding ? 0 : 2.5 } }}>
        {children}
      </CardContent>
    </Card>
  );
};

export default CardComponent;
