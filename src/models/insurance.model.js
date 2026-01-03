const mongoose = require('mongoose');
const insuranceClaimSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    provider: {
        type: String,
        required: true
    },
    diseaseReportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DiseaseReport'
    },
    documents: [{
        type: {
            type: String,
            enum: ['aadhaar', 'land_record', 'photo', 'other'],
            required: true
        },
        url: {
            type: String,
            required: true
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    uin: String,
    policyNumber: String,
    authenticityScore: Number,
    damageConfidence: Number,
    damagePrediction: String,
    claimAmount: String,
    status: {
        type: String,
        enum: ['draft', 'ready', 'submitted'],
        default: 'draft'
    },
    completenessCheck: {
        hasAadhaar: { type: Boolean, default: false },
        hasLandRecord: { type: Boolean, default: false },
        hasPhoto: { type: Boolean, default: false }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('InsuranceClaim', insuranceClaimSchema);