const axios = require('axios');

const getPlanetImagery = async (lat, lon, date) => {
    try {
        const API_KEY = process.env.PLANET_API_KEY;
        // Basic search endpoint example
        const response = await axios.post(
            'https://api.planet.com/data/v1/quick-search',
            {
                item_types: ['PSScene'],
                filter: {
                    type: 'AndFilter',
                    config: [
                        {
                            type: 'GeometryFilter',
                            field_name: 'geometry',
                            config: {
                                type: 'Point',
                                coordinates: [lon, lat]
                            }
                        },
                        {
                            type: 'DateRangeFilter',
                            field_name: 'acquired',
                            config: {
                                gte: date || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString()
                            }
                        }
                    ]
                }
            },
            {
                auth: {
                    username: API_KEY,
                    password: ''
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Planet API Error:', error.message);
        throw new Error('Failed to fetch satellite imagery');
    }
};

module.exports = { getPlanetImagery };
