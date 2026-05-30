import React, { useState } from 'react';
import api from '../../utils/api';
import './AdminUpload.css';

const BOARDS = ['IGCSE', 'AS_A_LEVEL', 'IBDP', 'IIT_JEE'];
const SUBJECTS = { IGCSE: ['Maths', 'CS'], AS_A_LEVEL: ['Maths', 'CS'], IBDP: ['Maths', 'CS'], IIT_JEE: ['Maths'] };

export default function AdminUpload() {
  const [meta, setMeta] = useState({ board: '', subject: '', year: new Date().getFullYear(), paper: '1', examType: '' });
  const [file, setFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleExtract = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select a PDF file');
    setExtracting(true); setError(''); setQuestions([]);
    try {
      const fd = new FormData();
      fd.append('pdf', file);
      Object.entries(meta).forEach(([k, v]) => fd.append(k, v));
      const res = await api.post('/upload/pdf', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setQuestions(res.data.questions);
    } catch (err) {
      setError(err.response?.data?.message || 'Extraction failed');
    } finally {
      setExtracting(false);
    }
  };

  const updateQuestion = (i, field, value) => {
    setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, [field]: value } : q));
  };

  const removeQuestion = (i) => setQuestions(qs => qs.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/upload/save', { questions });
      setSaved(true);
      setQuestions([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="upload-page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Upload Past Paper PDF</h1>
        <p style={{ color: '#6b7280', marginTop: 4 }}>AI will extract and auto-tag questions. Review before saving.</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
        {saved && <div style={{ color: '#10b981', background: '#d1fae5', padding: '10px 14px', borderRadius: 6, marginBottom: 16 }}>✓ Questions saved successfully!</div>}

        <form onSubmit={handleExtract}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${meta.board === 'IIT_JEE' ? 5 : 4}, 1fr)`, gap: 14, marginBottom: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Board *</label>
              <select value={meta.board} onChange={e => setMeta({ ...meta, board: e.target.value, subject: '', examType: '' })} required>
                <option value="">Select</option>
                {BOARDS.map(b => <option key={b} value={b}>{b.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Subject *</label>
              <select value={meta.subject} onChange={e => setMeta({ ...meta, subject: e.target.value })} required disabled={!meta.board}>
                <option value="">Select</option>
                {(SUBJECTS[meta.board] || []).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {meta.board === 'IIT_JEE' && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Exam Type *</label>
                <select value={meta.examType} onChange={e => setMeta({ ...meta, examType: e.target.value })} required>
                  <option value="">Select</option>
                  <option value="MAIN">JEE Main</option>
                  <option value="ADVANCED">JEE Advanced</option>
                </select>
              </div>
            )}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Year</label>
              <input type="number" value={meta.year} onChange={e => setMeta({ ...meta, year: e.target.value })} min={2000} max={2030} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Paper No.</label>
              <input value={meta.paper} onChange={e => setMeta({ ...meta, paper: e.target.value })} placeholder="1" />
            </div>
          </div>

          <div className="form-group">
            <label>PDF File *</label>
            <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} required />
          </div>

          <button className="btn btn-primary" type="submit" disabled={extracting}>
            {extracting ? '⏳ Extracting questions...' : '⬆ Extract Questions'}
          </button>
        </form>
      </div>

      {questions.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 600 }}>{questions.length} questions extracted — review and edit before saving</h3>
            <button className="btn btn-success" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : `✓ Save All (${questions.length})`}
            </button>
          </div>

          {questions.map((q, i) => (
            <div key={i} className="card q-review-card">
              <div className="q-review-header">
                <span style={{ fontWeight: 600, color: '#4f46e5' }}>Q{i + 1}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="badge badge-blue">{q.type}</span>
                  <span className="badge badge-yellow">{q.difficulty}</span>
                  <button className="btn btn-danger btn-sm" onClick={() => removeQuestion(i)}>Remove</button>
                </div>
              </div>

              <div className="form-group">
                <label>Question Text</label>
                <textarea rows={3} value={q.questionText} onChange={e => updateQuestion(i, 'questionText', e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Topic</label>
                  <input value={q.topic || ''} onChange={e => updateQuestion(i, 'topic', e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Difficulty</label>
                  <select value={q.difficulty || 'Medium'} onChange={e => updateQuestion(i, 'difficulty', e.target.value)}>
                    <option>Easy</option><option>Medium</option><option>Hard</option>
                  </select>
                </div>
                {q.type === 'MCQ' && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Correct Answer</label>
                    <select value={q.correctAnswer || ''} onChange={e => updateQuestion(i, 'correctAnswer', e.target.value)}>
                      <option value="">Select</option>
                      {['A', 'B', 'C', 'D'].map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {q.type === 'MCQ' && q.options?.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: 8 }}>Options</label>
                  {q.options.map((opt, oi) => (
                    <div key={oi} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                      <span style={{ width: 28, height: 36, background: '#e0e7ff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>{opt.label}</span>
                      <input value={opt.text} onChange={e => {
                        const opts = [...q.options];
                        opts[oi] = { ...opts[oi], text: e.target.value };
                        updateQuestion(i, 'options', opts);
                      }} style={{ flex: 1, padding: '6px 10px', border: '1.5px solid #e5e7eb', borderRadius: 6 }} />
                    </div>
                  ))}
                </div>
              )}

              <div className="form-group" style={{ marginTop: 12 }}>
                <label>Markscheme</label>
                <textarea rows={2} value={q.markscheme || ''} onChange={e => updateQuestion(i, 'markscheme', e.target.value)} placeholder="Enter marking guidelines..." />
              </div>
            </div>
          ))}

          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <button className="btn btn-success" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : `✓ Save All (${questions.length})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
