import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { ExternalLink, Locate, Loader, Shield, Scale, Users } from 'lucide-react';
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

// Custom lawyer marker icon
const lawyerIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2NjdlZWEiLz4KPHRleHQgeD0iMTYiIHk9IjIyIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7imJY8L3RleHQ+Cjwvc3ZnPg==',
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
    const [lawyers, setLawyers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // India center

    const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');


    const getUserLocation = () => {
        setLoading(true);
        setLocationError(null);

        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const location = { lat: latitude, lng: longitude };

                setUserLocation(location);
                setMapCenter([latitude, longitude]);

                // Fetch nearby lawyers
                try {
                    const response = await axios.get(`${API_URL}/api/lawyers/nearby`, {
                        params: {
                            lat: latitude,
                            lng: longitude,
                            radius: 5000 // 5km radius
                        }
                    });

                    // Calculate distances
                    const lawyersWithDistance = response.data.map(lawyer => ({
                        ...lawyer,
                        distance: calculateDistance(
                            latitude,
                            longitude,
                            lawyer.location.lat,
                            lawyer.location.lng
                        )
                    }));

                    setLawyers(lawyersWithDistance);
                } catch (error) {
                    console.error('Error fetching lawyers:', error);
                }

                setLoading(false);
            },
            (error) => {
                setLocationError('Unable to get your location. Please enable location services.');
                console.error('Geolocation error:', error);
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

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
            court: {
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
        const query = queries[type][currentLang] || queries[type]['en'];
        window.open(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, '_blank');
    };

    const getDirections = (lawyer) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lawyer.location.lat},${lawyer.location.lng}`;
        window.open(url, '_blank');
    };

    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className="flex justify-between items-center px-2">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">{t('find_help_nearby')}</h2>
                <button
                    onClick={getUserLocation}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90 shadow-md"
                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                    {loading ? <Loader size={16} className="animate-spin" /> : <Locate size={16} />}
                    {loading ? t('locating') : t('search_here')}
                </button>
            </div>

            {/* Quick Redirect Buttons */}
            <div className="grid grid-cols-3 gap-3 px-2">
                <button
                    onClick={() => openGoogleMaps('police')}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 hover:bg-red-500/20 transition-all gap-1"
                >
                    <Shield size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{t('police_station')}</span>
                </button>
                <button
                    onClick={() => openGoogleMaps('court')}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 hover:bg-amber-500/20 transition-all gap-1"
                >
                    <Scale size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{t('court')}</span>
                </button>
                <button
                    onClick={() => openGoogleMaps('lawyers')}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 hover:bg-indigo-500/20 transition-all gap-1"
                >
                    <Users size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{t('lawyers')}</span>
                </button>
            </div>

            {locationError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm mx-2">
                    {locationError}
                </div>
            )}

            {/* Map */}
            <div className="flex-1 rounded-xl overflow-hidden border border-[var(--border-color)] relative z-0 shadow-inner">
                <MapContainer center={mapCenter} zoom={userLocation ? 13 : 5} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <RecenterMap center={userLocation ? [userLocation.lat, userLocation.lng] : null} />

                    {/* User location marker */}
                    {userLocation && (
                        <Marker position={[userLocation.lat, userLocation.lng]}>
                            <Popup>
                                <strong>{t('your_location')}</strong>
                            </Popup>
                        </Marker>
                    )}

                    {/* Lawyer markers */}
                    {lawyers.map((lawyer, idx) => (
                        <Marker
                            key={lawyer.id || idx}
                            position={[lawyer.location.lat, lawyer.location.lng]}
                            icon={lawyerIcon}
                        >
                            <Popup minWidth={250}>
                                <div className="p-2">
                                    <h4 className="font-bold text-sm mb-1">{lawyer.name}</h4>
                                    {lawyer.address && <p className="text-xs text-gray-600 mb-2">{lawyer.address}</p>}
                                    {lawyer.phone && (
                                        <a href={`tel:${lawyer.phone}`} className="text-xs text-blue-600 hover:underline block mb-2">
                                            📞 {lawyer.phone}
                                        </a>
                                    )}
                                    <button
                                        onClick={() => getDirections(lawyer)}
                                        className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 w-full"
                                    >
                                        {t('get_directions')}
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Lawyer List */}
            {lawyers.length > 0 && (
                <div className="space-y-3 max-h-[400px] overflow-y-auto px-2">
                    <h3 className="font-semibold text-[var(--text-primary)]">
                        {t('nearby_lawyers')} ({lawyers.length})
                    </h3>
                    {lawyers.map((lawyer, idx) => (
                        <LawyerCard
                            key={lawyer.id || idx}
                            lawyer={lawyer}
                            onGetDirections={() => getDirections(lawyer)}
                        />
                    ))}
                </div>
            )}

            <p className="text-xs text-[var(--text-muted)] text-center px-4">
                {t('click_to_find')}
            </p>
        </div>
    );
}

