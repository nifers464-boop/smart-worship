import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';

import { theme } from './theme';
import Layout from './components/Layout';

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import LiturgyManagement from './pages/LiturgyManagement';
import SongLibrary from './pages/SongLibrary';
import PPTGenerator from './pages/PPTGenerator';
import MultimediaSchedule from './pages/MultimediaSchedule';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// PROTECTED ROUTE
function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem('gmim_logged_in') === 'true';
  return isLoggedIn ? children : <Navigate to="/auth" />;
}

// PUBLIC ROUTE
function PublicRoute({ children }) {
  return children;
}


function AppRoutes() {
  const location = useLocation();
  const publicPaths = ['/', '/auth'];
  const isPublicPage = publicPaths.includes(location.pathname);

  if (isPublicPage) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/liturgy" element={<ProtectedRoute><LiturgyManagement /></ProtectedRoute>} />
        <Route path="/songs" element={<ProtectedRoute><SongLibrary /></ProtectedRoute>} />
        <Route path="/ppt-generator" element={<ProtectedRoute><PPTGenerator /></ProtectedRoute>} />
        <Route path="/multimedia-schedule" element={<ProtectedRoute><MultimediaSchedule /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster position="top-right" />
        <Router>
          <AppRoutes />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;