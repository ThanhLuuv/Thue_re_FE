import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import { publicRoutes, privateRoutes, authRoutes } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { EditPostProvider } from './contexts/EditPostContext';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#6699CC',
    },
    secondary: {
      main: '#FF6700',
    },
  },
  typography: {
    fontFamily: "'Noto Sans Display', sans-serif",
  },
});

const appStyles = {
  app: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh'
  },
  content: {
    flex: 1
  }
};

function App() {
  const isAuthPage = window.location.pathname.includes('/login') || 
                    window.location.pathname.includes('/register') || 
                    window.location.pathname.includes('/forgot-password');

  return (
    <AuthProvider>
      <EditPostProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <div style={appStyles.app}>
              <Routes>
                {/* Public Routes */}
                {publicRoutes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={
                      <PublicRoute>
                        <route.component />
                      </PublicRoute>
                    }
                  />
                ))}

                {/* Private Routes */}
                {privateRoutes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={
                      <PrivateRoute>
                        <route.component />
                      </PrivateRoute>
                    }
                  />
                ))}

                {/* Auth Routes */}
                {authRoutes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={
                      <PublicRoute>
                        <route.component />
                      </PublicRoute>
                    }
                  />
                ))}
              </Routes>
            </div>
          </Router>
        </ThemeProvider>
      </EditPostProvider>
    </AuthProvider>
  );
}

export default App;