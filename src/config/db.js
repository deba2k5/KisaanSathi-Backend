const mongoose = require('mongoose');
const axios = require('axios');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);

        try {
            const res = await axios.get('https://api.ipify.org?format=json');
            console.error('\n\x1b[33m%s\x1b[0m', '----------------------------------------------------------------');
            console.error('\x1b[33m%s\x1b[0m', `YOUR CURRENT IP ADDRESS: ${res.data.ip}`);
            console.error('\x1b[33m%s\x1b[0m', 'Please add this IP to your MongoDB Atlas Network Access Whitelist:');
            console.error('\x1b[33m%s\x1b[0m', 'https://cloud.mongodb.com/v2#/security/network/accessList');
            console.error('\x1b[33m%s\x1b[0m', '----------------------------------------------------------------\n');
        } catch (ipError) {
            console.error('Failed to retrieve public IP automatically.');
        }

        // process.exit(1); 
        console.warn("Backend starting without MongoDB (Limited functionality).");
    }
};

module.exports = connectDB;
