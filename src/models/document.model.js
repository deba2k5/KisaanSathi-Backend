const mongoose = require('mongoose');


const documentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['aadhaar', 'land_record', 'photo', 'other'],
        required: true
    },
    url: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Document', documentSchema);