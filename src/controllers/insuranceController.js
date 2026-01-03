const groqService = require('../services/groqService');
const InsuranceClaim = require('../models/insuranceModel');

const createClaim = async (req, res) => {
    try {
        const data = req.body; // In multipart, fields are in req.body, files in req.files

        // Simulating AI Validation (or real one if you had the logic)
        // For now, keeping the mock values but SAVING them to DB
        const simpleValidation = {
            authenticity_score: 85,
            damage_confidence: 92,
            damage_prediction: "damage detected",
            status_damage_detection: "success"
        };

        const newClaim = new InsuranceClaim({
            userId: data.uid, // Sent from frontend FormData
            provider: data.provider,
            uin: data.uin,
            policyNumber: data.policyNumber,
            authenticityScore: simpleValidation.authenticity_score,
            damageConfidence: simpleValidation.damage_confidence,
            damagePrediction: simpleValidation.damage_prediction,
            status: 'Under Review' // Default status
        });

        const savedClaim = await newClaim.save();

        res.json({
            success: true,
            result: simpleValidation,
            claimRecord: savedClaim,
            message: "Claim processed and saved"
        });
    } catch (error) {
        console.error("Insurance Controller Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getClaimsByUser = async (req, res) => {
    try {
        const { uid } = req.params;
        const claims = await InsuranceClaim.find({ userId: uid }).sort({ submissionDate: -1 });
        res.json({ success: true, claims });
    } catch (error) {
        console.error("Fetch Claims Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteClaim = async (req, res) => {
    try {
        const { id } = req.params;
        await InsuranceClaim.findByIdAndDelete(id);
        res.json({ success: true, message: "Claim deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllClaims = async (req, res) => {
    try {
        const claims = await InsuranceClaim.find().sort({ submissionDate: -1 });
        res.json({ success: true, claims });
    } catch (error) {
        console.error("Fetch All Claims Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateClaimStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedClaim = await InsuranceClaim.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedClaim) {
            return res.status(404).json({ success: false, message: "Claim not found" });
        }

        res.json({ success: true, result: updatedClaim });
    } catch (error) {
        console.error("Update Claim Status Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createClaim, getClaimsByUser, deleteClaim, getAllClaims, updateClaimStatus };
