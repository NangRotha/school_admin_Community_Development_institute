// frontend-admin/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import AdminLayout from './components/Layout/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Teachers from './pages/Teachers';
import Students from './pages/Students';
import Courses from './pages/Courses';
import News from './pages/News';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import Results from './pages/Results';
import Classes from './pages/Classes';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import ContactMessages from './pages/ContactMessages'; // Add this import
import AboutManagement from './pages/AboutManagement';



const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppContent() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="students" element={<Students />} />
          <Route path="courses" element={<Courses />} />
          <Route path="classes" element={<Classes />} />
          <Route path="news" element={<News />} />
          <Route path="events" element={<Events />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="results" element={<Results />} />
          <Route path="contact-messages" element={<ContactMessages />} /> {/* Add this route */}
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
          // Add route
          <Route path="about-management" element={<AboutManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;