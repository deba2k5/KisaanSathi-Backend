const promptFn = require('../prompts/farmSummary.prompt');

module.exports = {
    execute: async (data) => {
        return {
            prompt: promptFn({ data }),
            model: "llama3-8b-8192", // Fast/Standard model
            responseParams: { json: false }
        };
    }
};
