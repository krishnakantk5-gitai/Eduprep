const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  label: { type: String, required: true }, // A, B, C, D
  text: { type: String, required: true },
  imageUrl: { type: String, default: '' }
});

const questionSchema = new mongoose.Schema({
  type: { type: String, enum: ['MCQ', 'STRUCTURED'], required: true },
  board: {
    type: String,
    enum: ['IGCSE', 'AS_A_LEVEL', 'IBDP', 'IIT_JEE'],
    required: true
  },
  subject: { type: String, enum: ['Maths', 'CS'], required: true },
  examType: {
    type: String,
    enum: ['MAIN', 'ADVANCED', ''],
    default: ''
  }, // only relevant when board === IIT_JEE
  topic: { type: String, required: true, trim: true },
  subtopic: { type: String, default: '', trim: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  year: { type: Number },
  paperNumber: { type: String, default: '' },
  questionText: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  // MCQ fields
  options: [optionSchema],
  correctAnswer: { type: String, default: '' }, // label: A/B/C/D
  // Structured fields
  marks: { type: Number, default: 0 },
  markscheme: { type: String, default: '' },
  markschemeImageUrl: { type: String, default: '' },
  // Meta
  source: { type: String, default: '' }, // e.g. "IGCSE Maths 2022 P1"
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

questionSchema.index({ board: 1, subject: 1, topic: 1, difficulty: 1 });

module.exports = mongoose.model('Question', questionSchema);
