import { createTheme } from '@mui/material/styles';

export const Theme = createTheme({
  palette: {
    primary: {
      main: '#4BAC35',
      light: '#FFC914',
      dark: '#3d9129',
      contrastText: '#F0F8FF',
    },
    secondary: {
      main: '#1A181B',
      light: 'rgba(26, 24, 27, 0.7)',
      contrastText: '#F0F8FF',
    },
    text: {
      primary: '#1A181B',
      secondary: 'rgba(26, 24, 27, 0.6)',
    },
    background: {
      default: '#F0F8FF',
      paper: 'rgba(255, 255, 255, 0.95)',
    },
    success: {
      main: '#4BAC35',
    },
    error: {
      main: '#dc3545',
    },
    warning: {
      main: '#FFC914',
    },
    info: {
      main: '#F0F8FF',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h1: {
      color: '#1A181B',
      fontWeight: 600,
    },
    h2: {
      color: '#1A181B',
      fontWeight: 600,
    },
    h3: {
      color: '#1A181B',
      fontWeight: 600,
    },
    h4: {
      color: '#1A181B',
      fontWeight: 600,
    },
    body1: {
      color: '#1A181B',
    },
    body2: {
      color: 'rgba(26, 24, 27, 0.7)',
    },
    subtitle1: { 
      fontWeight: 500 
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 600,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 15px rgba(75, 172, 53, 0.3)',
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 40,
          color: '#4BAC35',
          transition: 'all 0.3s ease',
          '&:hover': {
            color: '#FFC914',
            transform: 'scale(1.1)',
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: '#1A181B',
          fontWeight: 500,
        },
        secondary: {
          color: 'rgba(26, 24, 27, 0.7)',
        },
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: {
          color: '#1A181B',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, rgba(240, 248, 255, 0.8), rgba(75, 172, 53, 0.05))',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          margin: '2px 8px',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'rgba(75, 172, 53, 0.1)',
            transform: 'translateX(4px)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(75, 172, 53, 0.15)',
            borderLeft: '3px solid #4BAC35',
            '&:hover': {
              backgroundColor: 'rgba(75, 172, 53, 0.2)',
            },
          },
        },
      },
    },
  },
});