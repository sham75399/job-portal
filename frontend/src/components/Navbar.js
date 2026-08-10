import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{
      backgroundColor: '#ffffff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '1rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <Link to="/" style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#1976d2',
          textDecoration: 'none'
        }}>
          JobBoard
        </Link>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <Link to="/jobs" style={{
            color: '#333',
            textDecoration: 'none',
            fontWeight: '500'
          }}>Jobs</Link>
          {isAuthenticated && user?.role === 'employer' && (
            <>
              <Link to="/employer-dashboard" style={{
                color: '#333',
                textDecoration: 'none',
                fontWeight: '500'
              }}>Dashboard</Link>
              <Link to="/post-job" style={{
                color: '#333',
                textDecoration: 'none',
                fontWeight: '500'
              }}>Post Job</Link>
            </>
          )}
          {isAuthenticated && user?.role === 'candidate' && (
            <Link to="/candidate-dashboard" style={{
              color: '#333',
              textDecoration: 'none',
              fontWeight: '500'
            }}>Dashboard</Link>
          )}
          {!isAuthenticated ? (
            <>
              <Link to="/login" style={{
                color: '#333',
                textDecoration: 'none',
                fontWeight: '500'
              }}>Login</Link>
              <Link to="/register" style={{
                padding: '8px 16px',
                backgroundColor: '#1976d2',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '5px'
              }}>Register</Link>
            </>
          ) : (
            <>
              <span style={{ color: '#333', fontWeight: '500' }}>Welcome, {user?.name}</span>
              <button onClick={handleLogout} style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}>Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;