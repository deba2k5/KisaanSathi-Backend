const Groq = require('groq-sdk');

const getGroqAnalysis = async (prompt, modelName = "llama-3.1-8b-instant", image = null) => {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        console.log(`[GroqService] API Key Loaded: ${apiKey ? 'Yes' : 'No'} (${apiKey ? apiKey.substring(0, 5) + '...' : ''})`);
        const groq = new Groq({
            apiKey: apiKey
        });

        // User requested "meta-llama/llama-4-maverick-17b-128e-instruct" for Vision/Insurance
        // and "gpt-oss" (mapping to high performance Llama 3 70b) for Yield.
        // We will default to a stable model if the specific one fails or is not provided.
        const modelToUse = modelName;

        let messages;
        if (image) {
            messages = [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        { type: "image_url", image_url: { url: image } }
                    ]
                }
            ];
        } else {
            messages = [
                {
                    role: "user",
                    content: prompt
                }
            ];
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: modelToUse,
            temperature: 1,
            max_completion_tokens: 1024,
            top_p: 1,
            stream: false,
            stop: null
        });

        return chatCompletion.choices[0]?.message?.content || "";

    } catch (error) {
        const fs = require('fs');
        fs.writeFileSync('groq_error.log', `timestamp: ${new Date().toISOString()}\nError: ${error.message}\nStack: ${error.stack}\n`);
        console.error('Groq SDK Error:', error);
        throw new Error('Failed to fetch Groq analysis');
    }
};

module.exports = { getGroqAnalysis };
