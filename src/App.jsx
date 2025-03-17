import { useState } from 'react';
import './App.css';
import Dashboard from './dashboard'; // Update the path as needed
import Login from './login';
import Signup from './signup';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'login', 'signup', or 'dashboard'
  const [user, setUser] = useState(null);

  // Navigation handlers
  const handleNavigateToLogin = () => setCurrentPage('login');
  const handleNavigateToSignup = () => setCurrentPage('signup');
  const handleNavigateToDashboard = () => setCurrentPage('dashboard');

  // Auth handlers
  const handleLogin = (email) => {
    setUser({ email });
    handleNavigateToDashboard();
  };

  const handleSignup = (email) => {
    setUser({ email });
    handleNavigateToDashboard();
  };

  const handleLogout = () => {
    setUser(null);
    handleNavigateToLogin();
  };

  // Render the appropriate component based on current page
  return (
    <>
      {currentPage === 'login' && (
        <Login 
          onLogin={handleLogin} 
          onNavigateToSignup={handleNavigateToSignup} 
        />
      )}
      
      {currentPage === 'signup' && (
        <Signup 
          onSignup={handleSignup} 
          onNavigateToLogin={handleNavigateToLogin} 
        />
      )}
      
      {currentPage === 'dashboard' && (
        <Dashboard 
          onLogout={handleLogout}
        />
      )}
    </>
  );
}

export default App;