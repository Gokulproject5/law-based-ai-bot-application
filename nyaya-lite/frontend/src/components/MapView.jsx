import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ExternalLink } from 'lucide-react';

export default function MapView() {
    const center = [20.5937, 78.9629]; // India center

    const openGoogleMaps = (query) => {
        window.open(`https://www.google.com/maps/search/${query}`, '_blank');
    };

    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Find Help Nearby</h2>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={() => openGoogleMaps('Police Station near me')}
                    className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-100"
                >
                    <ExternalLink size={16} /> Police Stations
                </button>
                <button
                    onClick={() => openGoogleMaps('District Court near me')}
                    className="p-3 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-orange-100"
                >
                    <ExternalLink size={16} /> Courts
                </button>
            </div>

            <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 relative z-0 min-h-[300px]">
                <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={center}>
                        <Popup>
                            India <br /> Zoom in to find local spots.
                        </Popup>
                    </Marker>
                </MapContainer>
            </div>
            <p className="text-xs text-gray-500 text-center">
                Map view is for reference. Use the buttons above for live navigation via Google Maps.
            </p>
        </div>
    );
}
