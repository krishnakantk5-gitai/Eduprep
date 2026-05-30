import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import WorksheetGenerator from './pages/WorksheetGenerator';
import WorksheetPractice from './pages/WorksheetPractice';
import AttemptResult from './pages/AttemptResult';
import MyAttempts from './pages/MyAttempts';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminUpload from './pages/admin/AdminUpload';
import AdminStudents from './pages/admin/AdminStudents';
import Layout from './components/Layout';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="worksheet/generate" element={<WorksheetGenerator />} />
            <Route path="worksheet/:id/practice" element={<WorksheetPractice />} />
            <Route path="attempt/:id/result" element={<AttemptResult />} />
            <Route path="attempts" element={<MyAttempts />} />
            <Route path="profile" element={<Profile />} />
            <Route path="admin" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
            <Route path="admin/questions" element={<PrivateRoute adminOnly><AdminQuestions /></PrivateRoute>} />
            <Route path="admin/upload" element={<PrivateRoute adminOnly><AdminUpload /></PrivateRoute>} />
            <Route path="admin/students" element={<PrivateRoute adminOnly><AdminStudents /></PrivateRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
