const promptFn = require('../prompts/loan.prompt');

module.exports = {
    execute: async (data) => {
        return {
            prompt: promptFn({ data }),
            model: "llama3-8b-8192", // Standard model
            responseParams: {
                json: true
            }
        };
    }
};
