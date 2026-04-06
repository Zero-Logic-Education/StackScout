'use client';
import { alpha, createTheme } from '@mui/material/styles';

const focusRing = {
  outline: '3px solid rgba(129, 199, 132, 0.9)',
  outlineOffset: '2px',
  boxShadow: 'none',
};

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4caf50', // Зелёный
      light: '#81c784',
      dark: '#388e3c',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#66bb6a', // Светло-зелёный
      light: '#98ee99',
      dark: '#338a3e',
      contrastText: '#ffffff',
    },
    background: {
      default: '#1a1a1a', // Тёмно-серый
      paper: '#242424', // Более светлый тёмно-серый
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#b0b0b0',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
    success: {
      main: '#4caf50',
    },
    info: {
      main: '#66bb6a',
    },
  },
  typography: {
    fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontFamily: 'var(--font-outfit), sans-serif',
      fontWeight: 700,
      fontSize: '3.5rem',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: 'var(--font-outfit), sans-serif',
      fontWeight: 700,
      fontSize: '2.75rem',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: 'var(--font-outfit), sans-serif',
      fontWeight: 600,
      fontSize: '2rem',
    },
    h4: {
      fontFamily: 'var(--font-outfit), sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontFamily: 'var(--font-outfit), sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontFamily: 'var(--font-outfit), sans-serif',
      fontWeight: 600,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '1rem',
          boxShadow: 'none',
          '&:focus-visible': focusRing,
          '&:hover': {
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:focus-visible': focusRing,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#242424',
          borderRadius: 12,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        },
        elevation2: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
        },
        elevation3: {
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.23)',
            },
            '&:hover fieldset': {
              borderColor: '#4caf50',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#4caf50',
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha('#81c784', 0.28)}`,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          '&:focus-visible': focusRing,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&:focus-visible': focusRing,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:focus-visible': focusRing,
        },
      },
    },
  },
});
