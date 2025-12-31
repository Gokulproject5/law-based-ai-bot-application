const axios = require('axios');
const NodeCache = require('node-cache');

// Cache for 24 hours (86400 seconds)
const cache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });

// India Code API Base URL (unofficial scraping endpoint - for demo purposes)
// Note: For production, you may need to use official API or web scraping
const INDIA_CODE_BASE = 'https://legislative.gov.in';

/**
 * Search for Indian Acts
 * @param {string} query - Search term (e.g., "IPC", "Indian Penal Code")
 * @returns {Promise<Array>} - List of matching acts
 */
async function searchActs(query) {
    try {
        const cacheKey = `search_${query}`;
        const cached = cache.get(cacheKey);
        if (cached) {
            console.log('Returning cached result for:', query);
            return cached;
        }

        // For demo: Return mock data based on common searches
        // In production, integrate with actual API
        const mockData = getMockActData(query);

        cache.set(cacheKey, mockData);
        return mockData;
    } catch (error) {
        console.error('Error searching acts:', error.message);
        return [];
    }
}

/**
 * Get details of a specific act by ID
 * @param {string} actId - Act identifier
 * @returns {Promise<Object>} - Act details
 */
async function getActDetails(actId) {
    try {
        const cacheKey = `act_${actId}`;
        const cached = cache.get(cacheKey);
        if (cached) return cached;

        const mockData = getMockActDetailsById(actId);
        cache.set(cacheKey, mockData);
        return mockData;
    } catch (error) {
        console.error('Error fetching act details:', error.message);
        return null;
    }
}

/**
 * Get specific section of an act
 * @param {string} actId - Act identifier
 * @param {string} section - Section number
 * @returns {Promise<Object>} - Section details
 */
async function getSection(actId, section) {
    try {
        const cacheKey = `section_${actId}_${section}`;
        const cached = cache.get(cacheKey);
        if (cached) return cached;

        const mockData = getMockSectionData(actId, section);
        cache.set(cacheKey, mockData);
        return mockData;
    } catch (error) {
        console.error('Error fetching section:', error.message);
        return null;
    }
}

// Mock data functions (replace with actual API calls in production)
function getMockActData(query) {
    const lowerQuery = query.toLowerCase();

    const acts = [
        {
            id: 'ipc-1860',
            title: 'Indian Penal Code, 1860',
            year: 1860,
            type: 'Central Act',
            description: 'The main criminal code of India',
            totalSections: 511
        },
        {
            id: 'crpc-1973',
            title: 'Code of Criminal Procedure, 1973',
            year: 1973,
            type: 'Central Act',
            description: 'Procedural law for criminal cases',
            totalSections: 484
        },
        {
            id: 'it-act-2000',
            title: 'Information Technology Act, 2000',
            year: 2000,
            type: 'Central Act',
            description: 'Cyber law and electronic governance',
            totalSections: 94
        },
        {
            id: 'dv-act-2005',
            title: 'Protection of Women from Domestic Violence Act, 2005',
            year: 2005,
            type: 'Central Act',
            description: 'Civil law to protect women from domestic violence',
            totalSections: 37
        },
        {
            id: 'consumer-act-2019',
            title: 'Consumer Protection Act, 2019',
            year: 2019,
            type: 'Central Act',
            description: 'Protection of consumer rights',
            totalSections: 107
        }
    ];

    // Check for section number patterns (e.g., "IPC 420", "Section 279", "IT Act 66D")
    const sectionMatch = lowerQuery.match(/(?:section\s+)?(\d+[a-z]?)/i);

    // Handle queries like "IPC", "IPC 420", "Section 279"
    if (lowerQuery.includes('ipc') || lowerQuery.includes('penal') ||
        (sectionMatch && !lowerQuery.includes('it') && !lowerQuery.includes('consumer'))) {
        return acts.filter(act => act.id === 'ipc-1860');
    }

    // Handle IT Act queries
    if (lowerQuery.includes('it act') || lowerQuery.includes('information technology') ||
        lowerQuery.match(/\b66[a-z]?\b/i)) {
        return acts.filter(act => act.id === 'it-act-2000');
    }

    // Handle CrPC queries
    if (lowerQuery.includes('crpc') || lowerQuery.includes('criminal procedure')) {
        return acts.filter(act => act.id === 'crpc-1973');
    }

    // Handle DV Act queries
    if (lowerQuery.includes('domestic violence') || lowerQuery.includes('dv act')) {
        return acts.filter(act => act.id === 'dv-act-2005');
    }

    // Handle Consumer Act queries
    if (lowerQuery.includes('consumer')) {
        return acts.filter(act => act.id === 'consumer-act-2019');
    }

    // Default: filter by title or ID
    return acts.filter(act =>
        act.title.toLowerCase().includes(lowerQuery) ||
        act.id.includes(lowerQuery)
    );
}

function getMockActDetailsById(actId) {
    const actDetails = {
        'ipc-1860': {
            id: 'ipc-1860',
            title: 'Indian Penal Code, 1860',
            year: 1860,
            enacted: '6 October 1860',
            commenced: '1 January 1862',
            type: 'Central Act',
            ministry: 'Ministry of Home Affairs',
            description: 'The Indian Penal Code is the official criminal code of India drafted in 1860.',
            totalSections: 511,
            chapters: 23,
            popularSections: [
                { section: '302', title: 'Punishment for murder' },
                { section: '376', title: 'Punishment for rape' },
                { section: '420', title: 'Cheating and dishonestly inducing delivery of property' },
                { section: '498A', title: 'Husband or relative of husband subjecting woman to cruelty' }
            ],
            officialLink: 'https://legislative.gov.in/sites/default/files/A1860-45.pdf'
        },
        'it-act-2000': {
            id: 'it-act-2000',
            title: 'Information Technology Act, 2000',
            year: 2000,
            enacted: '9 June 2000',
            type: 'Central Act',
            ministry: 'Ministry of Electronics and Information Technology',
            description: 'An Act to provide legal recognition for transactions via electronic data interchange and other means of electronic communication.',
            totalSections: 94,
            chapters: 13,
            popularSections: [
                { section: '66', title: 'Computer related offences' },
                { section: '66C', title: 'Punishment for identity theft' },
                { section: '66D', title: 'Punishment for cheating by personation using computer resource' },
                { section: '67', title: 'Punishment for publishing obscene material in electronic form' }
            ],
            officialLink: 'https://www.meity.gov.in/writereaddata/files/itbill2000.pdf'
        }
    };

    return actDetails[actId] || null;
}

function getMockSectionData(actId, section) {
    const sections = {
        'ipc-1860': {
            '420': {
                section: '420',
                title: 'Cheating and dishonestly inducing delivery of property',
                content: 'Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, or anything which is signed or sealed, and which is capable of being converted into a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.',
                punishment: 'Imprisonment up to 7 years + Fine',
                cognizable: true,
                bailable: false,
                compoundable: false
            },
            '379': {
                section: '379',
                title: 'Punishment for theft',
                content: 'Whoever commits theft shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.',
                punishment: 'Imprisonment up to 3 years or Fine or both',
                cognizable: true,
                bailable: false,
                compoundable: false
            }
        },
        'it-act-2000': {
            '66D': {
                section: '66D',
                title: 'Punishment for cheating by personation using computer resource',
                content: 'Whoever, by means of any communication device or computer resource cheats by personation, shall be punished with imprisonment of either description for a term which may extend to three years and shall also be liable to fine which may extend to one lakh rupees.',
                punishment: 'Imprisonment up to 3 years + Fine up to Rs. 1 lakh',
                cognizable: true,
                bailable: true,
                compoundable: false
            }
        }
    };

    return sections[actId]?.[section] || null;
}

module.exports = {
    searchActs,
    getActDetails,
    getSection
};
