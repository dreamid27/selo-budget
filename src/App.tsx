import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import Onboarding from './components/onboarding';
import Dashboard from './components/dashboard';
import TransactionsPage from './components/transactions-page';
import { useEffect, useState } from 'react';
import { isOnboardingComplete } from './db/db';
import { ThemeProvider } from './components/theme-provider';
import SettingsPage from './components/settings-page';
import { Toaster } from 'sonner';

// Update ProtectedRoute to use the database check
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isComplete = await isOnboardingComplete();
        setIsAuthenticated(isComplete);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }

  if (!isAuthenticated) {
    // Redirect to the onboarding page, but save the attempted location
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const isComplete = await isOnboardingComplete();
        setHasCompletedOnboarding(isComplete);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboarding();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              hasCompletedOnboarding ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Onboarding />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <TransactionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              hasCompletedOnboarding ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </Router>
      <Toaster richColors closeButton position="top-right" />
    </ThemeProvider>
  );
};

export default App;
