const axios = require('axios');

const getWeatherForecast = async (lat, lon) => {
    try {
        const API_KEY = process.env.TOMORROW_API_KEY;
        const response = await axios.get(
            `https://api.tomorrow.io/v4/weather/forecast?location=${lat},${lon}&apikey=${API_KEY}`
        );
        return response.data;
    } catch (error) {
        console.error('Tomorrow.io API Error:', error.message);
        throw new Error('Failed to fetch weather data');
    }
};

module.exports = { getWeatherForecast };
