const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getQuestions, getTopics, getQuestionById,
  createQuestion, updateQuestion, deleteQuestion, verifyQuestion
} = require('../controllers/questionController');

router.get('/', protect, getQuestions);
router.get('/topics', protect, getTopics);
router.get('/:id', protect, getQuestionById);

router.post('/', protect, adminOnly, createQuestion);
router.put('/:id', protect, adminOnly, updateQuestion);
router.delete('/:id', protect, adminOnly, deleteQuestion);
router.patch('/:id/verify', protect, adminOnly, verifyQuestion);

module.exports = router;
