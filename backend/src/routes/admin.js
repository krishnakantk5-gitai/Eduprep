const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Question = require('../models/Question');
const Attempt = require('../models/Attempt');

// Dashboard stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [totalStudents, totalQuestions, totalAttempts, pendingQuestions] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Question.countDocuments({ verified: true }),
      Attempt.countDocuments({ completed: true }),
      Question.countDocuments({ verified: false })
    ]);
    res.json({ totalStudents, totalQuestions, totalAttempts, pendingQuestions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// All students
router.get('/students', protect, adminOnly, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
    res.json({ students });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Unverified questions
router.get('/questions/pending', protect, adminOnly, async (req, res) => {
  try {
    const questions = await Question.find({ verified: false }).sort({ createdAt: -1 });
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
