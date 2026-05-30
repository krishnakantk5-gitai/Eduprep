const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  selectedOption: { type: String, default: '' }, // for MCQ
  writtenAnswer: { type: String, default: '' },  // for structured
  isCorrect: { type: Boolean, default: false },
  marksAwarded: { type: Number, default: 0 }
});

const attemptSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  worksheet: { type: mongoose.Schema.Types.ObjectId, ref: 'Worksheet', required: true },
  answers: [answerSchema],
  score: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 }, // seconds
  completed: { type: Boolean, default: false },
  submittedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attempt', attemptSchema);
