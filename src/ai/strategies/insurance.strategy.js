const promptFn = require('../prompts/insurance.prompt');
const { searchSimilar } = require('../../services/ragService');

module.exports = {
    execute: async (data) => {
        // RAG Step: Filter top 3 related claims
        const claimContext = await searchSimilar(
            `crop:${data.crop} cause:${data.cause}`,
            'insurance_claim',
            { topK: 3 }
        );

        const contextText = claimContext.map((c, i) => `Case ${i + 1}: ${c.text}`).join('\n');

        return {
            prompt: promptFn({ data, context: contextText }),
            model: "llama-3.2-11b-vision-preview", // Vision/Complex model
            responseParams: { json: true }
        };
    }
};
