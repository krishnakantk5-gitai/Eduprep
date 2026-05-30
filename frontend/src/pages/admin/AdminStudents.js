import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/students').then(res => setStudents(res.data.students)).finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="spinner">Loading...</div>;

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Students</h1>
          <p style={{ color: '#6b7280', marginTop: 4 }}>{students.length} registered</p>
        </div>
        <input
          placeholder="Search students..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, width: 220 }}
        />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              {['Student', 'Board', 'Subjects', 'Joined'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#4f46e5', fontSize: '0.9rem' }}>
                      {s.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{s.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span className="badge badge-blue">{s.board?.replace(/_/g, ' ') || '—'}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {s.subjects?.length > 0 ? s.subjects.map(sub => (
                    <span key={sub} className="badge badge-purple" style={{ marginRight: 4 }}>{sub}</span>
                  )) : '—'}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#6b7280' }}>
                  {new Date(s.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>No students found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
