const promptFn = require('../prompts/yield.prompt');

module.exports = {
    execute: async (data) => {
        return {
            prompt: promptFn({ data }),
            model: "llama3-70b-8192", // High reasoning model
            responseParams: {
                json: true // Hint to controller to enforce properties
            }
        };
    }
};
