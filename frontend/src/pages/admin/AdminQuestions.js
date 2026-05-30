import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const BOARDS = ['', 'IGCSE', 'AS_A_LEVEL', 'IBDP', 'IIT_JEE'];
const SUBJECTS = ['', 'Maths', 'CS'];

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ board: '', subject: '', verified: 'all', page: 1 });
  const [total, setTotal] = useState(0);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: filters.page, limit: 20 });
      if (filters.board) params.append('board', filters.board);
      if (filters.subject) params.append('subject', filters.subject);

      let url = `/questions?${params}`;
      if (filters.verified === 'pending') url = '/admin/questions/pending';

      const res = await api.get(url);
      setQuestions(res.data.questions);
      setTotal(res.data.total || res.data.questions?.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuestions(); }, [filters]);

  const handleVerify = async (id) => {
    await api.patch(`/questions/${id}/verify`);
    fetchQuestions();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    await api.delete(`/questions/${id}`);
    fetchQuestions();
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Question Bank</h1>
          <p style={{ color: '#6b7280', marginTop: 4 }}>{total} questions</p>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap', padding: '14px 16px' }}>
        <select value={filters.board} onChange={e => setFilters({ ...filters, board: e.target.value, page: 1 })} style={{ padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: 6 }}>
          {BOARDS.map(b => <option key={b} value={b}>{b || 'All Boards'}</option>)}
        </select>
        <select value={filters.subject} onChange={e => setFilters({ ...filters, subject: e.target.value, page: 1 })} style={{ padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: 6 }}>
          {SUBJECTS.map(s => <option key={s} value={s}>{s || 'All Subjects'}</option>)}
        </select>
        <select value={filters.verified} onChange={e => setFilters({ ...filters, verified: e.target.value, page: 1 })} style={{ padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: 6 }}>
          <option value="all">All Questions</option>
          <option value="pending">Pending Review</option>
        </select>
      </div>

      {loading ? <div className="spinner">Loading...</div> : (
        <div>
          {questions.map(q => (
            <div key={q._id} className="card" style={{ marginBottom: 10, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span className="badge badge-blue">{q.board?.replace(/_/g, ' ')}</span>
                    <span className="badge badge-purple">{q.subject}</span>
                    <span className="badge badge-yellow">{q.topic}</span>
                    <span className="badge badge-green">{q.type}</span>
                    <span className={`badge ${q.verified ? 'badge-green' : 'badge-red'}`}>{q.verified ? 'Verified' : 'Pending'}</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {q.questionText?.substring(0, 120)}...
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {!q.verified && (
                    <button className="btn btn-success btn-sm" onClick={() => handleVerify(q._id)}>Verify</button>
                  )}
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(q._id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}

          {questions.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>No questions found</div>
          )}
        </div>
      )}
    </div>
  );
}
