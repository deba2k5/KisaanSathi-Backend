const Farm = require('../models/farmModel');
const planetService = require('../services/planetService');

// Get all farms - optionally filter by location if lat/lon provided
const getFarms = async (req, res) => {
    try {
        const { lat, lon, maxDistance = 10000 } = req.query; // maxDistance in meters

        let query = {};
        if (lat && lon) {
            query = {
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [parseFloat(lon), parseFloat(lat)]
                        },
                        $maxDistance: parseInt(maxDistance)
                    }
                }
            };
        }

        const farms = await Farm.find(query);
        res.json({ success: true, count: farms.length, data: farms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createFarm = async (req, res) => {
    try {
        const farm = await Farm.create(req.body);
        res.status(201).json({ success: true, data: farm });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getSatelliteImagery = async (req, res) => {
    const { lat, lon, date } = req.query;
    try {
        const imagery = await planetService.getPlanetImagery(lat, lon, date);
        res.json({ success: true, data: imagery });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getFarms, createFarm, getSatelliteImagery };
