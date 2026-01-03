const documents = [];

// Mock RAG service for Hackathon
// In a real app, this would query a vector DB like Pinecone/Weaviate
const searchSimilar = async (query, namespace, options = {}) => {
    // console.log(`[RAG] Searching for: "${query}" in ${namespace}`);

    // Simple keyword matching for demo purposes
    // Returns dummy context if no matches found to ensure the AI has something to work with
    const results = documents
        .filter(doc => doc.namespace === namespace)
        .filter(doc => doc.content.toLowerCase().includes(query.toLowerCase()))
        .slice(0, options.topK || 3);

    if (results.length === 0) {
        // Return some generic "past cases" for insurance if empty, to show off RAG capability in demo
        if (namespace === 'insurance_claim') {
            return [
                { text: "Approved claim for cotton bollworm damage (High severity) in Maharashtra. Payout: 100%." },
                { text: "Rejected claim for wheat due to delayed reporting (>72hrs)." },
                { text: "Approved drought claim in fluctuating weather conditions." }
            ];
        }
        if (namespace === 'chatbot_knowledge') {
            return [
                { text: "PM-KISAN provides 6000 INR/year to farmers." },
                { text: "Sowing time for Wheat is Nov-Dec in colder regions." }
            ];
        }
    }

    return results;
};

const storeDocument = async (id, content, metadata, namespace) => {
    // console.log(`[RAG] Storing document: ${id}`);
    documents.push({ id, content, metadata, namespace, timestamp: new Date() });
    return true;
};

const seedKnowledgeBase = async () => {
    try {
        // const count = await KnowledgeBase.countDocuments();
        // if (count > 0) return; // Already seeded

        console.log("Seeding Knowledge Base from synthetic datasets...");
        const fs = require('fs');
        const path = require('path');

        // Load Insurance Claims
        const claimsPath = path.join(__dirname, '../../ml/datasets/insurance_claims_synthetic.json');
        if (fs.existsSync(claimsPath)) {
            const claims = JSON.parse(fs.readFileSync(claimsPath, 'utf8'));
            for (const claim of claims) {
                const text = `Claim ${claim.id}: ${claim.crop} in ${claim.location} affected by ${claim.cause} (${claim.damage_percentage}% damage). Status: ${claim.status}. Rationale: ${claim.decision_rationale}`;
                const success = await storeDocument(claim.id, text, claim, 'insurance_claim');
                if (!success) {
                    console.error("Aborting RAG seeding: Embedding generation failed (API Key likely blocked).");
                    return;
                }
            }
        }

        // Load Chatbot QA
        const chatPath = path.join(__dirname, '../../ml/datasets/chatbot_rl_dataset.json');
        if (fs.existsSync(chatPath)) {
            const chats = JSON.parse(fs.readFileSync(chatPath, 'utf8'));
            for (const chat of chats) {
                const text = `Q: ${chat.prompt} A: ${chat.response}`;
                await storeDocument(chat.id, text, { reward: chat.reward_score }, 'chatbot_knowledge');
            }
        }
        console.log("Seeding complete.");

    } catch (error) {
        console.error("Seeding error:", error);
    }
};

module.exports = { searchSimilar, storeDocument, seedKnowledgeBase };
