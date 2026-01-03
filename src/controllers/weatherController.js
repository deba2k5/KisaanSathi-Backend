const tomorrowService = require('../services/tomorrowService');

const getWeather = async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
        return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
    }

    try {
        const data = await tomorrowService.getWeatherForecast(lat, lon);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getWeather };
