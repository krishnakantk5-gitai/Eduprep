import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './WorksheetPractice.css';

export default function WorksheetPractice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [worksheet, setWorksheet] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [startTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/worksheets/${id}`)
      .then(res => {
        setWorksheet(res.data.worksheet);
        setTimeLeft(res.data.worksheet.timeLimit * 60);
      })
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const formattedAnswers = worksheet.questions.map(q => ({
        questionId: q._id,
        selectedOption: answers[q._id]?.option || '',
        writtenAnswer: answers[q._id]?.text || ''
      }));
      const res = await api.post('/attempts/submit', {
        worksheetId: id,
        answers: formattedAnswers,
        timeTaken
      });
      navigate(`/attempt/${res.data.attempt._id}/result`);
    } catch (err) {
      alert('Submission failed. Please try again.');
      setSubmitting(false);
    }
  }, [submitting, worksheet, answers, startTime, id, navigate]);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, handleSubmit]);

  if (loading) return <div className="spinner">Loading worksheet...</div>;
  if (!worksheet) return null;

  const question = worksheet.questions[currentQ];
  const totalQ = worksheet.questions.length;
  const mins = Math.floor(timeLeft / 60);
  const secs = String(timeLeft % 60).padStart(2, '0');
  const answered = Object.keys(answers).length;
  const timerWarning = timeLeft < 120;

  return (
    <div className="practice-page">
      <div className="practice-header">
        <div className="practice-title">
          <h2>{worksheet.title}</h2>
          <span className="badge badge-blue">{worksheet.board.replace(/_/g, ' ')}</span>
          <span className="badge badge-purple">{worksheet.subject}</span>
        </div>
        <div className={`timer ${timerWarning ? 'warning' : ''}`}>
          ⏱ {mins}:{secs}
        </div>
      </div>

      <div className="practice-body">
        <div className="question-nav">
          {worksheet.questions.map((q, i) => (
            <button
              key={q._id}
              className={`q-nav-btn ${i === currentQ ? 'active' : ''} ${answers[q._id] ? 'answered' : ''}`}
              onClick={() => setCurrentQ(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="question-panel card">
          <div className="q-meta">
            <span>Question {currentQ + 1} of {totalQ}</span>
            <div>
              <span className="badge badge-yellow">{question.difficulty}</span>
              {question.type === 'STRUCTURED' && <span className="badge badge-green" style={{ marginLeft: 6 }}>{question.marks} marks</span>}
            </div>
          </div>

          <div className="q-text">{question.questionText}</div>
          {question.imageUrl && <img className="q-image" src={question.imageUrl} alt="question" />}

          {question.type === 'MCQ' ? (
            <div className="options">
              {question.options.map(opt => (
                <button
                  key={opt.label}
                  className={`option-btn ${answers[question._id]?.option === opt.label ? 'selected' : ''}`}
                  onClick={() => setAnswers(a => ({ ...a, [question._id]: { option: opt.label } }))}
                >
                  <span className="option-label">{opt.label}</span>
                  <span>{opt.text}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="form-group">
              <label>Your Answer</label>
              <textarea
                rows={5}
                placeholder="Write your answer here..."
                value={answers[question._id]?.text || ''}
                onChange={e => setAnswers(a => ({ ...a, [question._id]: { text: e.target.value } }))}
              />
            </div>
          )}

          <div className="q-nav-row">
            <button className="btn btn-outline btn-sm" onClick={() => setCurrentQ(q => Math.max(0, q - 1))} disabled={currentQ === 0}>← Prev</button>
            {currentQ < totalQ - 1
              ? <button className="btn btn-primary btn-sm" onClick={() => setCurrentQ(q => q + 1)}>Next →</button>
              : <button className="btn btn-success" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Submitting...' : '✓ Submit'}</button>
            }
          </div>
        </div>
      </div>

      <div className="practice-footer">
        <span>{answered}/{totalQ} answered</span>
        <button className="btn btn-success" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Submitting...' : '✓ Submit Worksheet'}
        </button>
      </div>
    </div>
  );
}
