const express = require('express');
const router = express.Router();
const cropController = require('../controllers/cropController');

router.post('/addNewCrop', cropController.addNewCrop);
router.get('/getPredictions/:id', cropController.getPredictions);
router.get('/getAllCrops/:uid', cropController.getAllCrops);
router.delete('/delete/:id', cropController.deleteCrop);

module.exports = router;
