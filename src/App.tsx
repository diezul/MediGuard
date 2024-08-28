import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthWrapper from './components/AuthWrapper';
import Register from './components/Register';
import Login from './components/Login';
import VerifyEmail from './components/VerifyEmail';
import ProfileSetup from './components/ProfileSetup';
import Treatments from './components/Treatments';
import AddTreatment from './components/AddTreatment';
import Settings from './components/Settings';
import Layout from './components/Layout';
import NotificationComponent from './components/NotificationComponent';
import { useNotifications } from './hooks/useNotifications';

const NotificationHandler: React.FC = () => {
  useNotifications();
  return null;
};

const App: React.FC = () => {
  useEffect(() => {
    const requestNotificationPermission = async () => {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
      }
    };

    requestNotificationPermission();
  }, []);

  return (
    <Router>
      <NotificationComponent />
      <NotificationHandler />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Protected routes */}
        <Route
          path="*"
          element={
            <AuthWrapper>
              <Routes>
                <Route path="/" element={<Navigate to="/treatments" replace />} />
                <Route path="/profile-setup" element={<ProfileSetup />} />
                <Route path="/treatments" element={<Layout><Treatments /></Layout>} />
                <Route path="/add-treatment" element={<Layout><AddTreatment /></Layout>} />
                <Route path="/settings" element={<Layout><Settings /></Layout>} />
              </Routes>
            </AuthWrapper>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;