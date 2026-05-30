import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(res => setStats(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner">Loading...</div>;

  const cards = [
    { label: 'Total Students', value: stats?.totalStudents, color: '#4f46e5', link: '/admin/students' },
    { label: 'Verified Questions', value: stats?.totalQuestions, color: '#10b981', link: '/admin/questions' },
    { label: 'Total Attempts', value: stats?.totalAttempts, color: '#f59e0b', link: null },
    { label: 'Pending Review', value: stats?.pendingQuestions, color: '#ef4444', link: '/admin/questions' }
  ];

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Admin Dashboard</h1>
        <p style={{ color: '#6b7280', marginTop: 4 }}>Manage your coaching platform</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {cards.map(c => (
          <div key={c.label} className="card" style={{ textAlign: 'center', borderTop: `3px solid ${c.color}` }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: c.color }}>{c.value ?? '—'}</div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: 4 }}>{c.label}</div>
            {c.link && <Link to={c.link} style={{ fontSize: '0.8rem', color: '#4f46e5', marginTop: 8, display: 'block' }}>View →</Link>}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Link to="/admin/upload" className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', transition: 'box-shadow 0.15s' }}>
          <div style={{ width: 48, height: 48, borderRadius: 10, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>⬆</div>
          <div>
            <div style={{ fontWeight: 600 }}>Upload PDF</div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Extract questions from past papers</div>
          </div>
        </Link>
        <Link to="/admin/questions" className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none' }}>
          <div style={{ width: 48, height: 48, borderRadius: 10, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>❓</div>
          <div>
            <div style={{ fontWeight: 600 }}>Question Bank</div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Review, edit and verify questions</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
