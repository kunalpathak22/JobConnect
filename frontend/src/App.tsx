import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

// Seeker Pages
import SearchJobs from './pages/seeker/SearchJobs';
import JobDetails from './pages/seeker/JobDetails';
import SeekerProfile from './pages/seeker/SeekerProfile';
import SavedJobs from './pages/seeker/SavedJobs';
import AppliedJobs from './pages/seeker/AppliedJobs';

// Employer Pages
import EmployerDashboard from './pages/employer/EmployerDashboard';
import PostJob from './pages/employer/PostJob';
import JobApplicants from './pages/employer/JobApplicants';
import EmployerProfile from './pages/employer/EmployerProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          {/* Header */}
          <Navbar />

          {/* Main Area */}
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              
              <Route path="/jobs" element={<SearchJobs />} />
              <Route path="/jobs/:id" element={<JobDetails />} />

              {/* Seeker Secured Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
                    <SeekerProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/saved-jobs"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
                    <SavedJobs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applications"
                element={
                  <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
                    <AppliedJobs />
                  </ProtectedRoute>
                }
              />

              {/* Employer Secured Routes */}
              <Route
                path="/employer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['EMPLOYER']}>
                    <EmployerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/post-job"
                element={
                  <ProtectedRoute allowedRoles={['EMPLOYER']}>
                    <PostJob />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/jobs/:jobId/applicants"
                element={
                  <ProtectedRoute allowedRoles={['EMPLOYER']}>
                    <JobApplicants />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/profile"
                element={
                  <ProtectedRoute allowedRoles={['EMPLOYER']}>
                    <EmployerProfile />
                  </ProtectedRoute>
                }
              />

              {/* Admin Secured Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback Route */}
              <Route path="*" element={<LandingPage />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
