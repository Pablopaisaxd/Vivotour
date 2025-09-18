import { createTheme } from '@mui/material/styles'; // Importa createTheme de MUI v5

export const Theme = createTheme({
  palette: {
    primary: {
      // Los valores de color se mantienen, pero la estructura es la de MUI v5
      main: '#1f6ed7', // Color principal
      light: '#535457', // Color claro
      dark: '#1a5199', // Puedes añadir un color oscuro si lo necesitas
      contrastText: '#ffffff', // Texto que contrasta con el color principal
    },
    secondary: {
      main: '#5f5b66', // Color secundario
      contrastText: '#ffffff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 1)',
      secondary: 'rgba(0, 0, 0, 0.6)', // Usar secondary para medium emphasis
    },
    // Puedes definir más colores si es necesario
    success: {
      main: '#4BAC35', // Para el verde de éxito
    },
    error: {
      main: '#dc3545', // Para el rojo de error
    },
    warning: {
      main: '#FFC914', // Para el amarillo/dorado
    },
    info: {
      main: '#F0F8FF', // Para el azul claro
    },
  },
  typography: {
    subtitle1: { fontWeight: 500 },
    // Puedes definir más estilos de tipografía aquí
  },
  components: {
    // Aquí puedes personalizar componentes de MUI globalmente si es necesario
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Ejemplo: botones sin mayúsculas por defecto
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 40, // Ajusta el espacio de los iconos en las listas
        },
      },
    },
  },
});