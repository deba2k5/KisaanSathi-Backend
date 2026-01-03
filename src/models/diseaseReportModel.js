const mongoose = require('mongoose');

const diseaseReportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    crop: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    detectedDisease: {
        type: String,
        required: true
    },
    confidence: Number,
    severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: true
    },
    remedy: {
        type: String,
        required: true
    },
    insuranceSuggested: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});