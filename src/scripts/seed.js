const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/user.model');
const Farm = require('../models/farm.model');
const CropPrediction = require('../models/cropPrediction.model');
const DiseaseReport = require('../models/diseaseReport.model');
const InsuranceClaim = require('../models/insurance.model');
const LoanApplication = require('../models/loan.model');
const Document = require('../models/document.model');
const KnowledgeBase = require('../models/knowledgebase.model');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding');

        // Sample User
        const user = await User.create({
            firebaseUid: 'sample_uid_' + Date.now(),
            name: 'Kishan Kumar',
            phone: '9876543210',
            location: {
                state: 'Maharashtra',
                district: 'Pune',
                latitude: 18.5204,
                longitude: 73.8567
            },
            landSizeAcres: 5,
            primaryCrop: 'Wheat'
        });
        console.log('User Collection Created');

        // Sample Farm
        await Farm.create({
            name: 'Kumar Farms',
            owner: user.firebaseUid,
            location: {
                type: 'Point',
                coordinates: [73.8567, 18.5204]
            }
        });
        console.log('Farm Collection Created');

        // Sample Crop Prediction
        await CropPrediction.create({
            userId: user.firebaseUid,
            cropName: 'Wheat',
            predictedYieldKgPerAcre: 1200,
            yieldCategory: 'High'
        });
        console.log('CropPrediction Collection Created');

        console.log('--- All Collections Generated Successfully ---');
        process.exit();
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedData();
