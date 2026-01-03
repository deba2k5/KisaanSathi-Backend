const promptFn = require('../prompts/chat.prompt');
const { searchSimilar } = require('../../services/ragService');

module.exports = {
    execute: async (data, userPrompt) => {
        // RAG: Chatbot knowledge base
        const chatContext = await searchSimilar(userPrompt || data?.message, 'chatbot_knowledge');
        const contextText = chatContext.map(c => `[Info: ${c.text}]`).join('\n');

        return {
            prompt: promptFn({ data, userPrompt, context: contextText }),
            model: "llama-3.2-11b-vision-preview", // Chat model
            responseParams: { json: false }
        };
    }
};
