const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, adminOnly } = require('../middleware/auth');
const { extractQuestionsFromPDF } = require('../services/pdfParser');
const Question = require('../models/Question');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB

router.post('/pdf', protect, adminOnly, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No PDF uploaded' });

    const { board, subject, year, paper, examType } = req.body;
    if (!board || !subject) return res.status(400).json({ message: 'board and subject are required' });

    const questions = await extractQuestionsFromPDF(req.file.buffer, {
      board, subject,
      year: year || new Date().getFullYear(),
      paper: paper || '1',
      examType: board === 'IIT_JEE' ? (examType || '') : ''
    });

    res.json({ questions, count: questions.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Save extracted questions (after admin review)
router.post('/save', protect, adminOnly, async (req, res) => {
  try {
    const { questions } = req.body;
    const saved = await Question.insertMany(
      questions.map(q => ({ ...q, uploadedBy: req.user._id }))
    );
    res.status(201).json({ saved, count: saved.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
