import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const BOARDS = ['IGCSE', 'AS_A_LEVEL', 'IBDP', 'IIT_JEE'];
const SUBJECTS = ['Maths', 'CS'];

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', board: user?.board || '', subjects: user?.subjects || [] });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleSubject = (s) => setForm(f => ({
    ...f, subjects: f.subjects.includes(s) ? f.subjects.filter(x => x !== s) : [...f.subjects, s]
  }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>Profile</h1>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user?.name}</div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>{user?.email}</div>
            <span className="badge badge-purple" style={{ marginTop: 4 }}>{user?.role}</span>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Full Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Board</label>
            <select value={form.board} onChange={e => setForm({ ...form, board: e.target.value })}>
              <option value="">Select board</option>
              {BOARDS.map(b => <option key={b} value={b}>{b.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Subjects</label>
            <div style={{ display: 'flex', gap: 20 }}>
              {SUBJECTS.map(s => (
                <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.subjects.includes(s)} onChange={() => toggleSubject(s)} />
                  {s}
                </label>
              ))}
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
