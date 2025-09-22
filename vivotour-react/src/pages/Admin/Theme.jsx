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
      paper: 'rgba(255, 255, 255, 0.9)',
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
    fontFamily: '"comic", sans-serif',
    h3: {
      color: '#1A181B',
    },
    h4: {
      color: '#1A181B',
    },
    body1: {
      color: '#1A181B',
    },
    body2: {
      color: 'rgba(26, 24, 27, 0.7)',
    },
    subtitle1: { fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 40,
          color: '#4BAC35',
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: '#1A181B',
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
        },
      },
    },
  },
});