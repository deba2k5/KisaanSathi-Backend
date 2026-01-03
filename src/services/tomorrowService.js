const axios = require('axios');

const getWeatherForecast = async (lat, lon) => {
    try {
        const TOMORROW_API_KEY = process.env.TOMORROW_API_KEY;
        if (!TOMORROW_API_KEY) throw new Error("No API Key");

        const response = await axios.get(
            `https://api.tomorrow.io/v4/weather/forecast?location=${lat},${lon}&apikey=${TOMORROW_API_KEY}`
        );
        return response.data;
    } catch (error) {
        console.warn('Tomorrow.io API Error (Falling back to Mock):', error.message);

        // Mock Data for Hackathon Resilience
        return {
            timelines: {
                daily: Array(7).fill({
                    values: {
                        temperatureAvg: 28,
                        humidityAvg: 65,
                        precipitationProbabilityAvg: 10,
                        weatherCode: 1000 // Clear
                    }
                })
            },
            location: { lat, lon }
        };
    }
};

module.exports = { getWeatherForecast };
