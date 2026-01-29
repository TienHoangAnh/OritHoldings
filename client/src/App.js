import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Public pages
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';

// Applicant pages
import Applications from './pages/Applications';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';

// Employer pages
import Dashboard from './pages/Dashboard';
import CreateJob from './pages/CreateJob';
import EditJob from './pages/EditJob';
import JobApplicants from './pages/JobApplicants';

function App() {
  return (
    <AuthProvider>
      <Router>
        <NotificationProvider>
          <div className="App">
            <Navbar />
            <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />

            {/* Applicant routes */}
            <Route
              path="/my-applications"
              element={
                <ProtectedRoute requiredRole="applicant">
                  <Applications />
                </ProtectedRoute>
              }
            />
            {/* Backwards compatible route */}
            <Route path="/applications" element={<Navigate to="/my-applications" replace />} />
            <Route
              path="/profile/:id"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <ProtectedRoute requiredRole="applicant">
                  <EditProfile />
                </ProtectedRoute>
              }
            />

            {/* Employer routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="employer">
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/create"
              element={
                <ProtectedRoute requiredRole="employer">
                  <CreateJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/edit/:id"
              element={
                <ProtectedRoute requiredRole="employer">
                  <EditJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/:id/applicants"
              element={
                <ProtectedRoute requiredRole="employer">
                  <JobApplicants />
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Jobs />} />
            </Routes>
          </div>
        </NotificationProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;

