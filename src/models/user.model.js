const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: String,
    phone: {
        type: String,
        required: true
    },
    language: {
        type: String,
        enum: ['hi', 'en', 'bn', 'ta', 'te', 'mr'],
        default: 'en'
    },
    location: {
        state: String,
        district: String,
        latitude: Number,
        longitude: Number
    },
    landSizeAcres: Number,
    primaryCrop: String,
    adharNumber: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);