const { Client } = require("@googlemaps/google-maps-services-js");
const NodeCache = require('node-cache');

// Cache for 1 hour (3600 seconds)
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

// Initialize Google Maps client
const client = new Client({});

/**
 * Search for nearby lawyers using Google Places API
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Search radius in meters (default: 5000m = 5km)
 * @returns {Promise<Array>} - List of nearby lawyers
 */
/**
 * Generic search for nearby places
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Search radius in meters
 * @param {string} keyword - Search keyword
 * @param {string} type - 'lawyer', 'police', 'court' (for cache key and mock data)
 * @returns {Promise<Array>}
 */
async function searchNearbyPlaces(lat, lng, radius, keyword, type) {
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            console.warn('Google Maps API key not found. Using mock data.');
            return getMockPlaceData(lat, lng, type);
        }

        const cacheKey = `${type}_${lat}_${lng}_${radius}`;
        const cached = cache.get(cacheKey);
        if (cached) {
            console.log(`Returning cached ${type} data`);
            return cached;
        }

        const response = await client.placesNearby({
            params: {
                location: { lat, lng },
                radius,
                keyword,
                key: apiKey
            }
        });

        if (!response.data || !response.data.results) {
            return [];
        }

        const places = response.data.results.map(place => ({
            id: place.place_id,
            name: place.name,
            address: place.vicinity,
            rating: place.rating || 0,
            totalRatings: place.user_ratings_total || 0,
            location: {
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng
            },
            isOpen: place.opening_hours?.open_now,
            placeId: place.place_id,
            type: type
        }));

        cache.set(cacheKey, places);
        return places;
    } catch (error) {
        console.error(`Error searching ${type}:`, error.message);
        return getMockPlaceData(lat, lng, type);
    }
}

async function searchNearbyLawyers(lat, lng, radius = 5000) {
    return searchNearbyPlaces(lat, lng, radius, 'lawyer advocate attorney legal', 'lawyer');
}

async function searchNearbyPolice(lat, lng, radius = 5000) {
    return searchNearbyPlaces(lat, lng, radius, 'police station thole', 'police');
}

async function searchNearbyCourts(lat, lng, radius = 5000) {
    return searchNearbyPlaces(lat, lng, radius, 'court district court high court tribunal', 'court');
}

/**
 * Get place details including phone number
 * @param {string} placeId - Google Place ID
 * @returns {Promise<Object>} - Place details with phone
 */
async function getLawyerDetails(placeId) {
    // ... existing implementation ...
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            return null;
        }

        const cacheKey = `place_details_${placeId}`;
        const cached = cache.get(cacheKey);
        if (cached) return cached;

        const response = await client.placeDetails({
            params: {
                place_id: placeId,
                fields: ['name', 'formatted_phone_number', 'international_phone_number', 'website', 'opening_hours'],
                key: apiKey
            }
        });

        if (!response.data || !response.data.result) {
            return null;
        }

        const details = {
            phone: response.data.result.formatted_phone_number || response.data.result.international_phone_number,
            website: response.data.result.website,
            hours: response.data.result.opening_hours?.weekday_text
        };

        cache.set(cacheKey, details);
        return details;
    } catch (error) {
        console.error('Error fetching place details:', error.message);
        return null;
    }
}

// Mock data for demo/fallback
function getMockPlaceData(lat, lng, type) {
    // User requested to remove fake details. Returns empty list if no API key.
    return [];
}

module.exports = {
    searchNearbyLawyers,
    searchNearbyPolice,
    searchNearbyCourts,
    getLawyerDetails
};
