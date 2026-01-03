const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database

connectDB();

// Initialize RAG Knowledge Base
const { seedKnowledgeBase } = require('./services/ragService');
//Run seeding asynchronously to not block startup
seedKnowledgeBase().catch(err => console.error("RAG Seeding Failed:", err));

const app = express();

// Debug Logging Middleware (MUST BE FIRST)
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

// Middleware
app.use(express.json());
app.use(cors());


// Route files
const weatherRoutes = require('./routes/weatherRoutes');
const aiRoutes = require('./routes/aiRoutes');
const mapRoutes = require('./routes/mapRoutes');
const cropRoutes = require('./routes/cropRoutes');
const loanRoutes = require('./routes/loanRoutes');
const insuranceRoutes = require('./routes/insuranceRoutes');

// Mount routers
app.use('/api/weather', weatherRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/maps', mapRoutes);
app.use('/crop', cropRoutes); // Keeping paths consistent with frontend usage
app.use('/loan', loanRoutes);
app.use('/insurance', insuranceRoutes);
app.use('/api/news', require('./routes/newsRoutes'));

// Basic route
app.get('/', (req, res) => {
    res.send('KisaanSathi Backend API is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
