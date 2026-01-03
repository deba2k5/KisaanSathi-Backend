const promptFn = require('../prompts/disease.prompt');

module.exports = {
    execute: async (data, userPrompt) => {
        return {
            prompt: promptFn({ data, userPrompt }),
            model: "llama-3.2-11b-vision-preview", // Vision model
            image: data.image, // Pass image for vision model
            responseParams: { json: true }
        };
    }
};
