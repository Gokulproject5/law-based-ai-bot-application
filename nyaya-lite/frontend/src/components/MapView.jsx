import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { ExternalLink, Locate, Loader, Shield, Scale, Users, AlertTriangle } from 'lucide-react';
import LawyerCard from './LawyerCard';
import axios from 'axios';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom lawyer marker icon (Purple)
const lawyerIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2NjdlZWEiLz4KPHRleHQgeD0iMTYiIHk9IjIyIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7imJY8L3RleHQ+Cjwvc3ZnPg==',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

// Police marker icon (Red)
const policeIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNlZjQ0NDQiLz4KPHRleHQgeD0iMTYiIHk9IjIyIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5🛡️PC90ZXh0Pgo8L3N2Zz4=', // Simplified base64, usually better to use real assets or better SVG
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyBzbWxsPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDMyIDMyIiB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjE2IiBmaWxsPSIjZWY0NDQ0IiAvPjx0ZXh0IHg9IjE2IiB5PSIyMSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtd2VpZ2h0PSJib2xkIj5QPC90ZXh0Pjwvc3ZnPg==',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

// Court marker icon (Amber)
const courtIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyBzbWxsPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDMyIDMyIiB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjE2IiBmaWxsPSIjZjU5ZTBiIiAvPjx0ZXh0IHg9IjE2IiB5PSIyMSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtd2VpZ2h0PSJib2xkIj5DPC90ZXh0Pjwvc3ZnPg==',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

// Component to recenter map
function RecenterMap({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, 13);
        }
    }, [center, map]);
    return null;
}

export default function MapView() {
    const { t, i18n } = useTranslation();
    const [userLocation, setUserLocation] = useState(null);
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // India center
    const [searchType, setSearchType] = useState('lawyers'); // 'lawyers', 'police', 'courts'
    const [searchRadius, setSearchRadius] = useState(20000); // Default 20km

    const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

    // Fetch places based on current location, type, and radius
    const fetchPlaces = async (lat, lng, type, radius) => {
        setLoading(true);
        try {
            const endpoint = type === 'police' ? '/api/police/nearby' :
                type === 'courts' ? '/api/courts/nearby' :
                    '/api/lawyers/nearby';

            const response = await axios.get(`${API_URL}${endpoint}`, {
                params: {
                    lat,
                    lng,
                    radius
                }
            });

            const placesWithDistance = response.data.map(place => ({
                ...place,
                distance: calculateDistance(
                    lat,
                    lng,
                    place.location.lat,
                    place.location.lng
                )
            }));

            setPlaces(placesWithDistance);
        } catch (error) {
            console.error(`Error fetching ${type}:`, error);
        } finally {
            setLoading(false);
        }
    };

    const getUserLocation = () => {
        setLoading(true);
        setLocationError(null);

        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const location = { lat: latitude, lng: longitude };

                setUserLocation(location);
                setMapCenter([latitude, longitude]);

                // Initial fetch
                fetchPlaces(latitude, longitude, searchType, searchRadius);
            },
            (error) => {
                setLocationError('Unable to get your location. Please enable location services.');
                console.error('Geolocation error:', error);
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // Effect to refetch when type or radius changes, if location is known
    useEffect(() => {
        if (userLocation) {
            fetchPlaces(userLocation.lat, userLocation.lng, searchType, searchRadius);
        }
    }, [searchType, searchRadius]);

    // Calculate distance between two coordinates in km
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of Earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
    };

    const openGoogleMaps = (type) => {
        const queries = {
            police: {
                en: 'Police Station near me',
                hi: 'मेरे पास पुलिस स्टेशन',
                ta: 'எனக்கு அருகில் உள்ள காவல் நிலையம்'
            },
            courts: {
                en: 'Court near me',
                hi: 'मेरे पास न्यायालय',
                ta: 'எனக்கு அருகில் உள்ள நீதிமன்றம்'
            },
            court: { // Fallback
                en: 'Court near me',
                hi: 'मेरे पास न्यायालय',
                ta: 'எனக்கு அருகில் உள்ள நீதிமன்றம்'
            },
            lawyers: {
                en: 'Lawyers near me',
                hi: 'मेरे पास वकील',
                ta: 'எனக்கு அருகில் உள்ள வழக்கறிஞர்கள்'
            }
        };

        const currentLang = i18n.language.split('-')[0];
        const query = queries[type]?.[currentLang] || queries[type]?.['en'] || `nearby ${type}`;
        window.open(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, '_blank');
    };

    const getDirections = (place) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}`;
        window.open(url, '_blank');
    };

    const handleTypeChange = (type) => {
        setSearchType(type);
        if (!userLocation) {
            getUserLocation();
        }
    };

    return (
        <div className="space-y-4 h-full flex flex-col relative">
            <div className="absolute top-0 left-0 right-0 z-10 p-2 bg-gradient-to-b from-white/90 to-white/0 dark:from-gray-900/90 dark:to-gray-900/0 pointer-events-none transition-all">
                {/* Controls container - pointer events enabled */}
                <div className="pointer-events-auto flex flex-col gap-2 bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] p-3 rounded-2xl shadow-lg mx-2 mt-2">

                    {/* Top Row: Search Title & Location Button */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold text-[var(--text-primary)] leading-tight">{t('find_help_nearby')}</h2>
                            <p className="text-xs text-[var(--text-secondary)]">
                                {loading ? t('locating') : userLocation ? t('showing_results_nearby') : t('click_to_find')}
                            </p>
                        </div>
                        <button
                            onClick={getUserLocation}
                            disabled={loading}
                            className="p-2 rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-all active:scale-95"
                            title={t('refresh_location')}
                        >
                            {loading ? <Loader size={18} className="animate-spin" /> : <Locate size={18} />}
                        </button>
                    </div>

                    {/* Middle Row: Type Toggles */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                        {['police', 'courts', 'lawyers'].map((type) => (
                            <button
                                key={type}
                                onClick={() => handleTypeChange(type)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${searchType === type
                                    ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                {type === 'police' && <Shield size={14} />}
                                {type === 'courts' && <Scale size={14} />}
                                {type === 'lawyers' && <Users size={14} />}
                                <span className="hidden sm:inline">{t(type === 'police' ? 'police_station' : type === 'courts' ? 'court' : 'lawyers')}</span>
                                <span className="sm:hidden">{type === 'police' ? 'Police' : type === 'courts' ? 'Court' : 'Lawyer'}</span>
                            </button>
                        ))}
                    </div>

                    {/* Bottom Row: Specs & Radius */}
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                            <span>Radius:</span>
                            <select
                                value={searchRadius}
                                onChange={(e) => setSearchRadius(Number(e.target.value))}
                                className="bg-transparent font-bold text-[var(--text-primary)] outline-none cursor-pointer"
                            >
                                <option value={5000}>5 km</option>
                                <option value={10000}>10 km</option>
                                <option value={20000}>20 km</option>
                                <option value={50000}>50 km</option>
                            </select>
                        </div>
                        <button
                            onClick={() => openGoogleMaps(searchType)}
                            className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                            <span>Open Maps</span>
                            <ExternalLink size={12} />
                        </button>
                    </div>
                </div>
            </div>

            {locationError && (
                <div className="mx-4 mt-2 p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-100 relative z-20">
                    <AlertTriangle size={14} />
                    {locationError}
                </div>
            )}

            {/* Map Area */}
            <div className="flex-1 w-full h-full relative z-0">
                <MapContainer center={mapCenter} zoom={userLocation ? 13 : 5} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap'
                    />
                    <RecenterMap center={userLocation ? [userLocation.lat, userLocation.lng] : null} />

                    {/* User Marker */}
                    {userLocation && (
                        <Marker position={[userLocation.lat, userLocation.lng]}>
                            <Popup className="custom-popup">
                                <div className="text-center">
                                    <div className="font-bold text-indigo-600">You are here</div>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* Place Markers */}
                    {places.map((place, idx) => (
                        <Marker
                            key={place.id || idx}
                            position={[place.location.lat, place.location.lng]}
                            icon={searchType === 'police' ? policeIcon : searchType === 'courts' ? courtIcon : lawyerIcon}
                        >
                            <Popup minWidth={200}>
                                <div className="p-1">
                                    <h4 className="font-bold text-sm">{place.name}</h4>
                                    <p className="text-xs text-gray-600 line-clamp-2 my-1">{place.address}</p>
                                    <button
                                        onClick={() => getDirections(place)}
                                        className="text-xs bg-indigo-600 text-white px-2 py-1 rounded w-full mt-1"
                                    >
                                        Get Directions
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Bottom Sheet List (Mobile friendly) */}
            <div className="bg-[var(--bg-primary)] border-t border-[var(--border-color)] max-h-[40vh] overflow-y-auto z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] rounded-t-2xl">
                <div className="p-4 space-y-3">
                    <div className="flex justify-center mb-2">
                        <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    </div>
                    {places.length > 0 ? (
                        places.map((place, idx) => (
                            <LawyerCard
                                key={place.id || idx}
                                lawyer={place}
                                onGetDirections={() => getDirections(place)}
                            />
                        ))
                    ) : (
                        <div className="text-center py-8 text-[var(--text-muted)]">
                            {loading ? (
                                <div className="flex flex-col items-center gap-2">
                                    <Loader className="animate-spin text-indigo-500" />
                                    <p>Searching nearby...</p>
                                </div>
                            ) : (
                                <p>No places found nearby. Try increasing the radius.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
