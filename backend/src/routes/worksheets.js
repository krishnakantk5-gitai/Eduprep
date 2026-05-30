const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateWorksheet, getWorksheet, getMyWorksheets } = require('../controllers/worksheetController');

router.post('/generate', protect, generateWorksheet);
router.get('/my', protect, getMyWorksheets);
router.get('/:id', protect, getWorksheet);

module.exports = router;
