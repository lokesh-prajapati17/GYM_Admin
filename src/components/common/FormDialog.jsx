import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box } from '@mui/material';
import ButtonComponent from './Button';

const FormDialog = ({ open, onClose, title, onSubmit, submitLabel = 'Save', children, maxWidth = 'sm' }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {children}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 1 }}>
        <ButtonComponent variant="outlined" onClick={onClose}>Cancel</ButtonComponent>
        <ButtonComponent onClick={onSubmit}>{submitLabel}</ButtonComponent>
      </DialogActions>
    </Dialog>
  );
};

export default FormDialog;
