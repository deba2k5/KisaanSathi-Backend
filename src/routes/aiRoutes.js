const express = require('express');
const router = express.Router();
const { analyzeCrop } = require('../controllers/aiController');

router.post('/analyze', analyzeCrop);

module.exports = router;
