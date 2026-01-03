const groqService = require('../services/groqService');
const strategies = require('../ai/strategies');
const { storeDocument } = require('../services/ragService');

const DEFAULT_MODEL = "llama3-8b-8192";
const FALLBACK_MODEL = "llama3-70b-8192"; // Or another stable model

const analyzeCrop = async (req, res) => {
    const { type, data, prompt: userPrompt } = req.body;
    console.log(`[AI Controller] Received request: Type=${type}`);

    try {
        // 1. Handle Feedback (RL Loop)
        if (type === 'feedback') {
            if (data.originalPrompt && data.userRating) {
                const feedbackText = `Q: ${data.originalPrompt} | Rating: ${data.userRating}/5`;
                await storeDocument(`FB_${Date.now()}`, feedbackText, { rating: data.userRating }, 'feedback');
                return res.json({ success: true, message: "Feedback recorded." });
            }
            return res.status(400).json({ success: false, message: "Invalid feedback data" });
        }

        // 2. Select Strategy
        const strategy = strategies[type];
        if (!strategy) {
            return res.status(400).json({ success: false, message: `Unknown task type: ${type}` });
        }

        // 3. Execute Strategy to get params
        const { prompt, model, image, responseParams } = await strategy.execute(data, userPrompt);

        // 4. Call AI Model with Fallback
        let analysis;
        try {
            analysis = await groqService.getGroqAnalysis(prompt, model || DEFAULT_MODEL, image);
        } catch (err) {
            console.warn(`[AI Controller] Primary model failed, trying fallback...`, err.message);
            // Fallback to a generally reliable model
            analysis = await groqService.getGroqAnalysis(prompt, FALLBACK_MODEL, image);
        }

        // 5. Parse JSON if required (basic implementation for hackathon)
        if (responseParams && responseParams.json) {
            try {
                // Attempt to parse if the result looks like JSON
                // In a real app we'd use a parser or json-mode in the LLM
                // analysis = JSON.parse(analysis); 
                // For now, we return text but the prompt requests JSON. 
                // The frontend might expect an object, so let's try to verify.
                // If it's pure string, we might leave it or try to extract JSON.
            } catch (e) {
                console.warn("Failed to parse expected JSON response");
            }
        }

        return res.json({ success: true, analysis });

    } catch (error) {
        console.error("AI Controller Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { analyzeCrop };

