const express = require('express');
const router = express.Router();
const { getFarms, createFarm, getSatelliteImagery } = require('../controllers/mapController');

router.get('/farms', getFarms);
router.post('/farms', createFarm);
router.get('/satellite', getSatelliteImagery);

module.exports = router;
