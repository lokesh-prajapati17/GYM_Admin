import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const SearchBar = ({ value, onChange, placeholder = 'Search...', sx = {} }) => {
  const theme = useTheme();

  return (
    <TextField
      placeholder={placeholder}
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search sx={{ color: theme.palette.primary.main }} />
          </InputAdornment>
        ),
      }}
      sx={{
        minWidth: 250,
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          bgcolor: theme.palette.mode === 'dark'
            ? `${theme.palette.primary.main}08`
            : `${theme.palette.primary.main}05`,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
            borderWidth: 2,
          },
        },
        ...sx,
      }}
    />
  );
};

export default SearchBar;
