const mongoose = require('mongoose');

const LoanApplicationSchema = new mongoose.Schema({
    farmerUid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    farmerName: {
        type: String,
        required: true
    },
    farmLocation: {
        lat: Number,
        lng: Number
    },
    cropType: {
        type: String,
        required: true
    },
    acres: {
        type: Number,
        required: true
    },
    loanPurpose: {
        type: String,
        required: true
    },
    requestedAmount: {
        type: Number,
        required: true
    },
    tenureMonths: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'],
        default: 'PENDING'
    },
    aiAssessment: {
        type: Object, // To store the AI JSON response later
        default: null
    },
    fraudRiskScore: {
        type: Number,
        default: 0 // 0-100 (0 = Safe, 100 = Fraud)
    },
    blockchainTxHash: {
        type: String,
        default: null
    },
    smartContractAddress: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { collection: 'loanApplication' });

module.exports = mongoose.model('LoanApplication', LoanApplicationSchema);
