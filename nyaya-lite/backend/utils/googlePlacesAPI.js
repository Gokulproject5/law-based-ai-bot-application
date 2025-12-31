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
async function searchNearbyLawyers(lat, lng, radius = 5000) {
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            console.warn('Google Maps API key not found. Using mock data.');
            return getMockLawyerData(lat, lng);
        }

        const cacheKey = `lawyers_${lat}_${lng}_${radius}`;
        const cached = cache.get(cacheKey);
        if (cached) {
            console.log('Returning cached lawyer data');
            return cached;
        }

        // Search for lawyers using Google Places API
        const response = await client.placesNearby({
            params: {
                location: { lat, lng },
                radius,
                keyword: 'lawyer advocate attorney legal',
                key: apiKey
            }
        });

        if (!response.data || !response.data.results) {
            return [];
        }

        // Transform results to our format
        const lawyers = response.data.results.map(place => ({
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
            placeId: place.place_id
        }));

        cache.set(cacheKey, lawyers);
        return lawyers;
    } catch (error) {
        console.error('Error searching lawyers:', error.message);
        // Fallback to mock data on error
        return getMockLawyerData(lat, lng);
    }
}

/**
 * Get lawyer details including phone number
 * @param {string} placeId - Google Place ID
 * @returns {Promise<Object>} - Lawyer details with phone
 */
async function getLawyerDetails(placeId) {
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            return null;
        }

        const cacheKey = `lawyer_details_${placeId}`;
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
        console.error('Error fetching lawyer details:', error.message);
        return null;
    }
}

// Mock data for demo/fallback
function getMockLawyerData(lat, lng) {
    // Sample lawyers for major Indian cities
    const mockLawyers = [
        {
            id: 'mock-1',
            name: 'Adv. Rajesh Kumar & Associates',
            address: 'MG Road, Bangalore',
            phone: '+91 80 2555 1234',
            specialization: 'Criminal & Civil Law',
            rating: 4.5,
            totalRatings: 120,
            location: { lat: 12.9716, lng: 77.5946 },
            isOpen: true
        },
        {
            id: 'mock-2',
            name: 'Singh Legal Consultants',
            address: 'Connaught Place, New Delhi',
            phone: '+91 11 4567 8901',
            specialization: 'Corporate & Family Law',
            rating: 4.7,
            totalRatings: 85,
            location: { lat: 28.6139, lng: 77.2090 },
            isOpen: true
        },
        {
            id: 'mock-3',
            name: 'Adv. Priya Sharma',
            address: 'Andheri West, Mumbai',
            phone: '+91 22 2634 5678',
            specialization: 'Women Rights & Domestic Violence',
            rating: 4.8,
            totalRatings: 95,
            location: { lat: 19.1136, lng: 72.8697 },
            isOpen: true
        },
        {
            id: 'mock-4',
            name: 'Legal Aid Society',
            address: 'Park Street, Kolkata',
            phone: '+91 33 2229 0123',
            specialization: 'Consumer Rights & Property',
            rating: 4.3,
            totalRatings: 67,
            location: { lat: 22.5726, lng: 88.3639 },
            isOpen: true
        },
        {
            id: 'mock-5',
            name: 'Adv. Mohammed Ali',
            address: 'Banjara Hills, Hyderabad',
            phone: '+91 40 2335 6789',
            specialization: 'Cyber Crime & IT Act',
            rating: 4.6,
            totalRatings: 78,
            location: { lat: 17.3850, lng: 78.4867 },
            isOpen: true
        }
    ];

    // Filter lawyers within reasonable proximity (for demo)
    // In real implementation, actual distance calculation would be done
    return mockLawyers.slice(0, 3);
}

module.exports = {
    searchNearbyLawyers,
    getLawyerDetails
};
