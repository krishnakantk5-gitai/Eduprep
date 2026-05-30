import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/attempts/progress')
      .then(res => setProgress(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner">Loading...</div>;

  const recentChart = progress?.recentAttempts?.slice(0, 8).reverse().map((a, i) => ({
    name: `#${i + 1}`,
    score: a.percentage
  })) || [];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="subtitle">{user?.board?.replace('_', ' ')} · {user?.subjects?.join(', ')}</p>
        </div>
        <Link to="/worksheet/generate" className="btn btn-primary">+ New Worksheet</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{progress?.totalAttempts || 0}</div>
          <div className="stat-label">Total Attempts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {progress?.recentAttempts?.length > 0
              ? Math.round(progress.recentAttempts.reduce((s, a) => s + a.percentage, 0) / progress.recentAttempts.length)
              : 0}%
          </div>
          <div className="stat-label">Avg Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{progress?.stats?.length || 0}</div>
          <div className="stat-label">Topics Covered</div>
        </div>
        <div className="stat-card weak">
          <div className="stat-value">{progress?.weakTopics?.length || 0}</div>
          <div className="stat-label">Weak Topics</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {recentChart.length > 0 && (
          <div className="card chart-card">
            <h3>Recent Performance</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={recentChart}>
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {progress?.weakTopics?.length > 0 && (
          <div className="card">
            <h3>Weak Topics</h3>
            <div className="weak-topics">
              {progress.weakTopics.slice(0, 5).map((t, i) => (
                <div key={i} className="weak-topic-item">
                  <div className="topic-info">
                    <span className="topic-name">{t.topic}</span>
                    <span className="badge badge-blue">{t.subject}</span>
                  </div>
                  <div className="topic-bar">
                    <div className="topic-fill" style={{ width: `${t.avgPercentage}%`, background: t.avgPercentage < 30 ? '#ef4444' : '#f59e0b' }} />
                  </div>
                  <span className="topic-pct">{t.avgPercentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {progress?.totalAttempts === 0 && (
        <div className="empty-state card">
          <div className="empty-icon">📝</div>
          <h3>No attempts yet</h3>
          <p>Generate your first worksheet and start practising!</p>
          <Link to="/worksheet/generate" className="btn btn-primary">Generate Worksheet</Link>
        </div>
      )}
    </div>
  );
}
