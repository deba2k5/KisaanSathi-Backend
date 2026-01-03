const mongoose = require('mongoose');

const KnowledgeBaseSchema = new mongoose.Schema({
    docId: { type: String, required: true, unique: true },
    text: { type: String, required: true },
    type: { type: String, enum: ['insurance_claim', 'chatbot_knowledge', 'general'], default: 'general' },
    metadata: { type: mongoose.Schema.Types.Mixed }, // Flexible field for JSON data
    vector: { type: [Number], index: false }, // 768-dim vector (Index created manually in Atlas)
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('KnowledgeBase', KnowledgeBaseSchema);
