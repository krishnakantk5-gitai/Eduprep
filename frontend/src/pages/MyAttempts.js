import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function MyAttempts() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/attempts/my').then(res => setAttempts(res.data.attempts)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner">Loading...</div>;

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>My Attempts</h1>
        <p style={{ color: '#6b7280', marginTop: 4 }}>{attempts.length} total attempts</p>
      </div>

      {attempts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ color: '#6b7280', marginBottom: 16 }}>No attempts yet.</p>
          <Link to="/worksheet/generate" className="btn btn-primary">Generate Worksheet</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {attempts.map(a => (
            <div key={a._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{a.worksheet?.title || 'Worksheet'}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span className="badge badge-blue">{a.worksheet?.board?.replace(/_/g, ' ')}</span>
                  <span className="badge badge-purple">{a.worksheet?.subject}</span>
                  <span className="badge badge-yellow">{a.worksheet?.topic}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 6 }}>
                  {new Date(a.createdAt).toLocaleDateString()} · {Math.floor(a.timeTaken / 60)}m {a.timeTaken % 60}s
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: a.percentage >= 60 ? '#10b981' : a.percentage >= 40 ? '#f59e0b' : '#ef4444' }}>
                  {a.percentage}%
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{a.score}/{a.totalMarks} marks</div>
                <Link to={`/attempt/${a._id}/result`} className="btn btn-outline btn-sm">Review</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
