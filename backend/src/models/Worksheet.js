const mongoose = require('mongoose');

const worksheetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  board: { type: String, enum: ['IGCSE', 'AS_A_LEVEL', 'IBDP', 'IIT_JEE'], required: true },
  subject: { type: String, enum: ['Maths', 'CS'], required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Mixed'], default: 'Mixed' },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  totalMarks: { type: Number, default: 0 },
  timeLimit: { type: Number, default: 30 }, // in minutes
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Worksheet', worksheetSchema);
