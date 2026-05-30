import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const BOARDS = ['IGCSE', 'AS_A_LEVEL', 'IBDP', 'IIT_JEE'];
const SUBJECTS = ['Maths', 'CS'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', board: '', subjects: [] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleSubject = (s) => {
    setForm(f => ({
      ...f,
      subjects: f.subjects.includes(s) ? f.subjects.filter(x => x !== s) : [...f.subjects, s]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">EduPrep</div>
        <h2>Create account</h2>
        <p className="auth-subtitle">Start practising today</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
          <div className="form-group">
            <label>Board</label>
            <select value={form.board} onChange={e => setForm({ ...form, board: e.target.value })}>
              <option value="">Select board</option>
              {BOARDS.map(b => <option key={b} value={b}>{b.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Subjects</label>
            <div className="checkbox-group">
              {SUBJECTS.map(s => (
                <label key={s} className="checkbox-label">
                  <input type="checkbox" checked={form.subjects.includes(s)} onChange={() => toggleSubject(s)} />
                  {s}
                </label>
              ))}
            </div>
          </div>
          <button className="btn btn-primary w-full" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-link">Already have an account? <Link to="/login">Sign In</Link></p>
      </div>
    </div>
  );
}
