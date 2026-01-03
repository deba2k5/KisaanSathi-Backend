const groqService = require('../services/groqService');
const CropPrediction = require('../models/cropPredictionModel');

const addNewCrop = async (req, res) => {
    try {
        const data = req.body;
        // AI Yield Prediction
        const systemPrompt = `You are an expert agronomist. Predict the crop yield based on: ${JSON.stringify(data)}. Return ONLY a JSON object with: { predictedYieldKgPerAcre: number, yieldCategory: string, soilHealthScore: number, climateScore: number, suggestedCrops: [{cropName: string, predictedYieldKgPerHa: number}] }`;

        const aiResponse = await groqService.getGroqAnalysis(systemPrompt);
        // Clean JSON
        const jsonStr = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const predictions = JSON.parse(jsonStr);

        // Save to MongoDB
        const newRecord = new CropPrediction({
            userId: data.userId || data.uid, // Ensure frontend sends this
            cropName: data.cropName || data.crop,
            acresOfLand: data.acres || data.acresOfLand,
            location: data.location || { lat: 0, long: 0 },
            soilType: data.soilType,
            irrigationMethod: data.irrigationMethod,
            predictedYieldKgPerAcre: predictions.predictedYieldKgPerAcre,
            yieldCategory: predictions.yieldCategory,
            climateScore: predictions.climateScore,
            soilHealthScore: predictions.soilHealthScore
        });

        const savedRecord = await newRecord.save();

        res.json({
            success: true,
            newCrop: savedRecord,
            message: "Crop added and yield predicted successfully"
        });
    } catch (error) {
        console.error("Crop Controller Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getPredictions = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await CropPrediction.findById(id);
        if (!record) return res.status(404).json({ success: false, message: "Record not found" });

        res.json({
            success: true,
            updatedCropRecord: record
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllCrops = async (req, res) => {
    try {
        const { uid } = req.params;
        const records = await CropPrediction.find({ userId: uid }).sort({ createdAt: -1 });

        res.json({
            success: true,
            cropRecord: records
        });
    } catch (error) {
        console.error("Fetch Crops Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteCrop = async (req, res) => {
    try {
        const { id } = req.params;
        await CropPrediction.findByIdAndDelete(id);
        res.json({ success: true, message: "Record deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { addNewCrop, getPredictions, getAllCrops, deleteCrop };
