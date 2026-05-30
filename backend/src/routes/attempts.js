const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { submitAttempt, getAttemptResult, getMyAttempts, getProgress } = require('../controllers/attemptController');

router.post('/submit', protect, submitAttempt);
router.get('/my', protect, getMyAttempts);
router.get('/progress', protect, getProgress);
router.get('/:id', protect, getAttemptResult);

module.exports = router;
