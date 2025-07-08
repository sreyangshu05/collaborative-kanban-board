import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import KanbanBoard from './components/KanbanBoard';
import './styles/globals.css';

const AuthWrapper = () => {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return isLogin ? (
      <Login onToggleAuth={() => setIsLogin(false)} />
    ) : (
      <Register onToggleAuth={() => setIsLogin(true)} />
    );
  }

  return <KanbanBoard />;
};

function App() {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  );
}

export default App;