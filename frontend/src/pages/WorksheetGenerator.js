import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './WorksheetGenerator.css';

const BOARDS = ['IGCSE', 'AS_A_LEVEL', 'IBDP', 'IIT_JEE'];
const SUBJECTS = { IGCSE: ['Maths', 'CS'], AS_A_LEVEL: ['Maths', 'CS'], IBDP: ['Maths', 'CS'], IIT_JEE: ['Maths'] };
const DIFFICULTIES = ['Mixed', 'Easy', 'Medium', 'Hard'];

// Fallback topics shown before any questions are uploaded to the database
const FALLBACK_TOPICS = {
  IIT_JEE_Maths: [
    'Algebra', 'Quadratic Equations', 'Sequences and Series', 'Binomial Theorem',
    'Permutations and Combinations', 'Probability', 'Matrices', 'Determinants',
    'Complex Numbers', 'Trigonometry', 'Inverse Trigonometry',
    'Coordinate Geometry', 'Straight Lines', 'Circles', 'Parabola',
    'Ellipse', 'Hyperbola', 'Vectors', '3D Geometry',
    'Limits and Continuity', 'Differentiation', 'Applications of Derivatives',
    'Integration', 'Definite Integrals', 'Differential Equations',
    'Sets and Relations', 'Functions', 'Mathematical Reasoning', 'Statistics'
  ]
};
const JEE_EXAM_TYPES = [
  { value: 'BOTH',     label: 'Both (Main + Advanced)', desc: 'Questions from both exams' },
  { value: 'MAIN',     label: 'JEE Main only',           desc: 'Only JEE Main questions' },
  { value: 'ADVANCED', label: 'JEE Advanced only',       desc: 'Only JEE Advanced questions' },
];

// All years for which JEE Advanced papers were downloaded
const JEE_YEARS = Array.from({ length: 2026 - 2007 + 1 }, (_, i) => 2026 - i); // 2026 down to 2007

// Year ranges for quick selection
const YEAR_RANGES = [
  { label: 'Last 3 years',  years: [2024, 2025, 2026] },
  { label: 'Last 5 years',  years: [2022, 2023, 2024, 2025, 2026] },
  { label: 'Last 10 years', years: Array.from({ length: 10 }, (_, i) => 2026 - i) },
  { label: 'All years',     years: [] },
];

export default function WorksheetGenerator() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ board: '', subject: '', topic: '', difficulty: 'Mixed', examType: 'BOTH', years: [], count: 10, timeLimit: 30 });
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (form.board && form.subject) {
      api.get(`/questions/topics?board=${form.board}&subject=${form.subject}`)
        .then(res => {
          const apiTopics = res.data.topics;
          if (apiTopics.length > 0) {
            setTopics(apiTopics);
          } else {
            // No questions uploaded yet — use fallback list
            const key = `${form.board}_${form.subject}`;
            setTopics(FALLBACK_TOPICS[key] || []);
          }
        })
        .catch(() => {
          const key = `${form.board}_${form.subject}`;
          setTopics(FALLBACK_TOPICS[key] || []);
        });
    } else {
      setTopics([]);
    }
  }, [form.board, form.subject]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.board || !form.subject) return setError('Please select board and subject');
    setLoading(true); setError('');
    try {
      const res = await api.post('/worksheets/generate', form);
      navigate(`/worksheet/${res.data.worksheet._id}/practice`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate worksheet');
    } finally {
      setLoading(false);
    }
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const toggleYear = (yr) => {
    setForm(f => ({
      ...f,
      years: f.years.includes(yr) ? f.years.filter(y => y !== yr) : [...f.years, yr]
    }));
  };

  const applyYearRange = (rangeYears) => set('years', rangeYears);

  const examTypeLabel = form.board === 'IIT_JEE'
    ? JEE_EXAM_TYPES.find(e => e.value === form.examType)?.label || '—'
    : null;

  const yearsLabel = form.years.length === 0
    ? 'All years'
    : form.years.length === 1
    ? String(form.years[0])
    : `${Math.min(...form.years)}–${Math.max(...form.years)} (${form.years.length} years)`;

  return (
    <div className="generator-page">
      <div className="page-header">
        <h1>Generate Worksheet</h1>
        <p>Choose your filters and we'll pick questions from the question bank</p>
      </div>

      <div className="card generator-card">
        {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
        <form onSubmit={handleGenerate}>
          <div className="generator-grid">
            <div className="form-group">
              <label>Board *</label>
              <select value={form.board} onChange={e => { set('board', e.target.value); set('subject', ''); set('topic', ''); set('examType', 'BOTH'); }} required>
                <option value="">Select board</option>
                {BOARDS.map(b => <option key={b} value={b}>{b.replace(/_/g, ' ')}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Subject *</label>
              <select value={form.subject} onChange={e => { set('subject', e.target.value); set('topic', ''); }} required disabled={!form.board}>
                <option value="">Select subject</option>
                {(SUBJECTS[form.board] || []).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Topic</label>
              <select value={form.topic} onChange={e => set('topic', e.target.value)} disabled={!form.subject}>
                <option value="">All topics (mixed)</option>
                {topics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Difficulty</label>
              <select value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Number of Questions</label>
              <input type="number" min={1} max={50} value={form.count} onChange={e => set('count', Number(e.target.value))} />
            </div>

            <div className="form-group">
              <label>Time Limit (minutes)</label>
              <input type="number" min={5} max={180} value={form.timeLimit} onChange={e => set('timeLimit', Number(e.target.value))} />
            </div>
          </div>

          {/* JEE Exam Type — only shown for IIT JEE board */}
          {form.board === 'IIT_JEE' && (
            <div className="jee-exam-selector">
              <label className="jee-exam-label">Exam Type</label>
              <div className="jee-exam-options">
                {JEE_EXAM_TYPES.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`jee-exam-btn ${form.examType === opt.value ? 'active' : ''}`}
                    onClick={() => set('examType', opt.value)}
                  >
                    <span className="jee-exam-name">{opt.label}</span>
                    <span className="jee-exam-desc">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Year Selector — only shown for IIT JEE board */}
          {form.board === 'IIT_JEE' && (
            <div className="year-selector">
              <div className="year-selector-header">
                <label className="jee-exam-label" style={{ margin: 0 }}>
                  Year Selection
                  <span className="year-count-badge">
                    {form.years.length === 0 ? 'All years' : `${form.years.length} selected`}
                  </span>
                </label>
                <div className="year-range-btns">
                  {YEAR_RANGES.map(r => (
                    <button
                      key={r.label}
                      type="button"
                      className="year-range-btn"
                      onClick={() => applyYearRange(r.years)}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="year-grid">
                {JEE_YEARS.map(yr => (
                  <button
                    key={yr}
                    type="button"
                    className={`year-btn ${form.years.includes(yr) ? 'active' : ''}`}
                    onClick={() => toggleYear(yr)}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="preview-box">
            <div className="preview-item"><span>Board</span><strong>{form.board?.replace(/_/g, ' ') || '—'}</strong></div>
            {form.board === 'IIT_JEE' && (
              <>
                <div className="preview-item"><span>Exam</span><strong>{examTypeLabel}</strong></div>
                <div className="preview-item"><span>Years</span><strong>{yearsLabel}</strong></div>
              </>
            )}
            <div className="preview-item"><span>Subject</span><strong>{form.subject || '—'}</strong></div>
            <div className="preview-item"><span>Topic</span><strong>{form.topic || 'Mixed'}</strong></div>
            <div className="preview-item"><span>Questions</span><strong>{form.count}</strong></div>
            <div className="preview-item"><span>Time</span><strong>{form.timeLimit} min</strong></div>
          </div>

          <button className="btn btn-primary generate-btn" type="submit" disabled={loading}>
            {loading ? 'Generating...' : '⚡ Generate Worksheet'}
          </button>
        </form>
      </div>
    </div>
  );
}
