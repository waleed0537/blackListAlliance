import { useContext, useEffect, useState } from 'react';
import './App.css';
import Dashboard from './dashboard';
import Login from './login';
import Signup from './signup';
import { AuthProvider, AuthContext } from './AuthContext';
import { BlacklistProvider } from './BlacklistContext'; // Updated import path

// App wrapper with AuthProvider and BlacklistProvider
function AppWrapper() {
  return (
    <AuthProvider>
      <BlacklistProvider>
        <App />
      </BlacklistProvider>
    </AuthProvider>
  );
}

function App() {
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState(isAuthenticated ? 'dashboard' : 'login');

  // Update current page based on authentication status
  useEffect(() => {
    if (isAuthenticated) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('login');
    }
  }, [isAuthenticated]);

  // Navigation handlers
  const handleNavigateToLogin = () => setCurrentPage('login');
  const handleNavigateToSignup = () => setCurrentPage('signup');
  const handleNavigateToDashboard = () => setCurrentPage('dashboard');

  // Show loading state while checking authentication
  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  // Render the appropriate component based on current page
  return (
    <>
      {currentPage === 'login' && (
        <Login 
          onNavigateToSignup={handleNavigateToSignup} 
        />
      )}
      
      {currentPage === 'signup' && (
        <Signup 
          onNavigateToLogin={handleNavigateToLogin} 
        />
      )}
      
      {currentPage === 'dashboard' && isAuthenticated && (
        <Dashboard />
      )}
    </>
  );
}

export default AppWrapper;