const promptFn = require('../prompts/farmSummary.prompt');

module.exports = {
    execute: async (data) => {
        return {
            prompt: promptFn({ data }),
            model: "llama-3.1-8b-instant", // Fast/Standard model
            responseParams: { json: false }
        };
    }
};
