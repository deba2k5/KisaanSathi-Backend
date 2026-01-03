const express = require('express');
const router = express.Router();
const insuranceController = require('../controllers/insuranceController');
const multer = require('multer');
const upload = multer(); // Basic memory storage

router.post('/create', upload.any(), insuranceController.createClaim);
router.get('/user/:uid', insuranceController.getClaimsByUser);
router.get('/all', insuranceController.getAllClaims);
router.put('/update/:id', insuranceController.updateClaimStatus);
router.delete('/delete/:id', insuranceController.deleteClaim);

module.exports = router;
