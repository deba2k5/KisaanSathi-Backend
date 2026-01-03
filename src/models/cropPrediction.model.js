const mongoose = require('mongoose');

const CropPredictionSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    cropName: {
        type: String,
        required: true
    },
    acresOfLand: {
        type: Number,
        default: 0
    },
    location: {
        lat: Number,
        long: Number
    },
    season: {
        type: String,
        enum: ['kharif', 'rabi', 'zaid'],
    },
    sowingDate: Date,
    advisory: String,
    weatherRisk: {
        type: String,
        enum: ['low', 'medium', 'high']
    },
    soilType: String,
    irrigationMethod: String,
    predictedYieldKgPerAcre: Number,
    yieldCategory: String,
    climateScore: Number,
    soilHealthScore: Number,
    status: {
        type: String,
        default: 'Predicted'
    },
    predictionDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('CropPrediction', CropPredictionSchema);
