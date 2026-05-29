import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#4F46E5', // Premium Indigo (Indigo 600)
      light: '#818CF8',
      dark: '#3730A3',
      contrastText: '#fff',
    },
    secondary: {
      main: '#06B6D4', // Modern Cyan
      light: '#67E8F9',
      dark: '#0E7490',
      contrastText: '#fff',
    },
    background: {
      default: '#F8FAFC', // Slate 50
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
    },
    accent: {
      purple: '#8B5CF6',
      pink: '#EC4899',
      amber: '#F59E0B',
    }
  },
  typography: {
    fontFamily: '"Inter", "Outfit", "system-ui", sans-serif',
    h1: { fontWeight: 900, fontFamily: 'Outfit' },
    h2: { fontWeight: 800, fontFamily: 'Outfit' },
    h3: { fontWeight: 800, fontFamily: 'Outfit' },
    h4: { fontWeight: 700, fontFamily: 'Outfit' },
    h5: { fontWeight: 600, fontFamily: 'Outfit' },
    h6: { fontWeight: 600, fontFamily: 'Outfit' },
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: '0.02em' },
    subtitle1: { fontWeight: 500 },
  },
  shape: {
    borderRadius: 12, // More modern rounded corners
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.02)',
    '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.01)',
    '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
    '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
    ...Array(20).fill('none') // Fill rest to avoid errors
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '10px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.2)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease-in-out',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.01)',
          border: '1px solid #F1F5F9',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #F1F5F9',
          '&:hover': {
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)',
          },
          transition: 'all 0.3s ease-in-out',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E2E8F0',
        },
      },
    },
  },
});