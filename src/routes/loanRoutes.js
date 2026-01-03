const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');

router.post('/apply', loanController.submitLoan);
router.post('/submit/:cropId', loanController.submitLoan); // Legacy/Fallback
router.post('/submitCropSelection', loanController.submitCropSelection);

router.get('/getAll', loanController.getAllLoans);
router.get('/user/:uid', loanController.getUserLoans);
router.put('/updateStatus/:id', loanController.updateLoanStatus);
router.delete('/delete/:id', loanController.deleteLoan);

module.exports = router;
