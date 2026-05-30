import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import './AttemptResult.css';

export default function AttemptResult() {
  const { id } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    api.get(`/attempts/${id}`)
      .then(res => setAttempt(res.data.attempt))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner">Loading results...</div>;
  if (!attempt) return null;

  const { score, totalMarks, percentage } = attempt;
  const grade = percentage >= 80 ? 'Excellent' : percentage >= 60 ? 'Good' : percentage >= 40 ? 'Average' : 'Needs Work';
  const gradeColor = percentage >= 80 ? 'green' : percentage >= 60 ? 'blue' : percentage >= 40 ? 'yellow' : 'red';

  return (
    <div className="result-page">
      <div className="result-summary card">
        <div className="score-circle" style={{ '--pct': percentage }}>
          <div className="score-inner">
            <div className="score-num">{percentage}%</div>
            <div className="score-label">{score}/{totalMarks}</div>
          </div>
        </div>
        <div className="result-info">
          <h2>{attempt.worksheet?.title}</h2>
          <span className={`badge badge-${gradeColor}`}>{grade}</span>
          <div className="result-meta">
            <span>⏱ {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s</span>
            <span>✓ {attempt.answers.filter(a => a.isCorrect).length} correct</span>
            <span>✗ {attempt.answers.filter(a => !a.isCorrect).length} incorrect</span>
          </div>
        </div>
      </div>

      <div className="result-actions">
        <Link to="/worksheet/generate" className="btn btn-primary">Practice Again</Link>
        <Link to="/attempts" className="btn btn-outline">All Attempts</Link>
        <Link to="/dashboard" className="btn btn-outline">Dashboard</Link>
      </div>

      <div className="answers-section">
        <h3>Review Answers & Markscheme</h3>
        {attempt.answers.map((ans, i) => {
          const q = ans.question;
          if (!q) return null;
          const open = expanded[i];
          return (
            <div key={i} className={`answer-card card ${ans.isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="answer-header" onClick={() => setExpanded(e => ({ ...e, [i]: !e[i] }))}>
                <div className="answer-title">
                  <span className={`result-icon ${ans.isCorrect ? 'correct' : 'incorrect'}`}>{ans.isCorrect ? '✓' : '✗'}</span>
                  <span className="q-num">Q{i + 1}</span>
                  <span className="q-preview">{q.questionText?.substring(0, 80)}...</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {q.type === 'MCQ' && (
                    <span className="badge badge-blue">
                      {ans.isCorrect ? `✓ ${ans.selectedOption}` : `✗ ${ans.selectedOption || '—'} → ${q.correctAnswer}`}
                    </span>
                  )}
                  <span className="expand-btn">{open ? '▲' : '▼'}</span>
                </div>
              </div>

              {open && (
                <div className="answer-body">
                  <p className="full-question">{q.questionText}</p>
                  {q.imageUrl && <img src={q.imageUrl} alt="question" className="q-image" />}

                  {q.type === 'MCQ' && (
                    <div className="options-review">
                      {q.options?.map(opt => (
                        <div key={opt.label} className={`opt-review ${opt.label === q.correctAnswer ? 'correct-opt' : ''} ${opt.label === ans.selectedOption && !ans.isCorrect ? 'wrong-opt' : ''}`}>
                          <span className="option-label">{opt.label}</span>
                          {opt.text}
                          {opt.label === q.correctAnswer && <span className="tick"> ✓ Correct</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === 'STRUCTURED' && ans.writtenAnswer && (
                    <div className="written-answer">
                      <strong>Your Answer:</strong>
                      <p>{ans.writtenAnswer}</p>
                    </div>
                  )}

                  {q.markscheme && (
                    <div className="markscheme-box">
                      <strong>📋 Markscheme</strong>
                      <p>{q.markscheme}</p>
                      {q.markschemeImageUrl && <img src={q.markschemeImageUrl} alt="markscheme" />}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
