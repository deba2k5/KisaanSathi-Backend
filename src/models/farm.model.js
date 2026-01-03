const mongoose = require('mongoose');

const FarmSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    owner: {
        type: String, // Can be user ID
        required: true
    },
    location: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point', 'Polygon'], // 'location.type' must be 'Point' or 'Polygon'
            required: true
        },
        coordinates: {
            type: [],
            required: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create a geospatial index on the location field
FarmSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Farm', FarmSchema);
const mongoose = require('mongoose');

FarmSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    owner: {
        type: String, // Can be user ID
        required: true
    },
    location: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point', 'Polygon'], // 'location.type' must be 'Point' or 'Polygon'
            required: true
        },
        coordinates: {
            type: [],
            required: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create a geospatial index on the location field
FarmSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Farm', FarmSchema);
