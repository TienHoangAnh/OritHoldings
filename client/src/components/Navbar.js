import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, unseenCount } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/jobs');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/jobs" className="navbar-logo">
          Orit Holdings
        </Link>

        <div className="navbar-menu">
          {user ? (
            <>
              <Link to="/jobs" className="navbar-link">
                Home
              </Link>
              {user.role === 'applicant' ? (
                <>
                  <Link to={`/profile/${user.id}`} className="navbar-link">
                    My Profile
                  </Link>
                  <Link to="/my-applications" className="navbar-link navbar-link-with-dot">
                    My Applications
                    {unseenCount > 0 && <span className="notif-dot" aria-label="unseen" />}
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="navbar-link">
                    Dashboard
                  </Link>
                  <Link to="/jobs/create" className="navbar-link">
                    Post Job
                  </Link>
                </>
              )}
              <span className="navbar-user">Hello, {user.name}</span>
              <button onClick={handleLogout} className="navbar-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/jobs" className="navbar-link">
                Jobs
              </Link>
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/register" className="navbar-button">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

