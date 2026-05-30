import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => { logout(); navigate('/login'); };

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '⊞' },
    { to: '/worksheet/generate', label: 'New Worksheet', icon: '✎' },
    { to: '/attempts', label: 'My Attempts', icon: '📋' },
    { to: '/profile', label: 'Profile', icon: '👤' }
  ];

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: '⊞' },
    { to: '/admin/upload', label: 'Upload PDF', icon: '⬆' },
    { to: '/admin/questions', label: 'Questions', icon: '❓' },
    { to: '/admin/students', label: 'Students', icon: '👥' }
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <div className={`layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="logo">EduPrep</span>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
        </div>
        <nav className="sidebar-nav">
          {links.map(link => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end={link.to === '/dashboard' || link.to === '/admin'}>
              <span className="nav-icon">{link.icon}</span>
              <span className="nav-label">{link.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="user-details">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
