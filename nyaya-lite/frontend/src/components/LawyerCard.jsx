import React from 'react';
import { Phone, MapPin, Star, ExternalLink, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LawyerCard({ lawyer, onGetDirections }) {
    const { t } = useTranslation();
    const callLawyer = () => {
        if (lawyer.phone) {
            window.location.href = `tel:${lawyer.phone}`;
        }
    };

    const openInGoogleMaps = () => {
        const url = `https://www.google.com/maps/search/?api=1&query=${lawyer.location.lat},${lawyer.location.lng}`;
        window.open(url, '_blank');
    };

    return (
        <div className="card-premium p-4 space-y-3 hover-lift">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="font-bold text-[var(--text-primary)] text-lg">{lawyer.name}</h3>
                    {lawyer.specialization && (
                        <p className="text-sm text-[#667eea] font-medium">{lawyer.specialization}</p>
                    )}
                </div>
                {lawyer.rating > 0 && (
                    <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold text-gray-700">{lawyer.rating}</span>
                        {lawyer.totalRatings > 0 && (
                            <span className="text-xs text-gray-500">({lawyer.totalRatings})</span>
                        )}
                    </div>
                )}
            </div>

            {/* Address */}
            <div className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-[#667eea]" />
                <span>{lawyer.address}</span>
            </div>

            {/* Phone */}
            {lawyer.phone && (
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Phone size={16} className="flex-shrink-0 text-[#667eea]" />
                    <span>{lawyer.phone}</span>
                </div>
            )}

            {/* Distance */}
            {lawyer.distance && (
                <div className="text-xs text-[var(--text-muted)] font-medium">
                    📍 {lawyer.distance} {t('away')}
                </div>
            )}

            {/* Status */}
            {lawyer.isOpen !== undefined && (
                <div className="text-xs font-medium">
                    {lawyer.isOpen ? (
                        <span className="text-green-600">🟢 {t('open_now')}</span>
                    ) : (
                        <span className="text-red-600">🔴 {t('closed')}</span>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
                {lawyer.phone && (
                    <button
                        onClick={callLawyer}
                        className="flex-1 py-2 px-4 rounded-lg font-medium text-white transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                    >
                        <Phone size={16} className="inline mr-2" />
                        {t('call')}
                    </button>
                )}
                <button
                    onClick={onGetDirections || openInGoogleMaps}
                    className="flex-1 py-2 px-4 rounded-lg font-medium border-2 transition-all hover:bg-gray-50"
                    style={{ borderColor: '#667eea', color: '#667eea' }}
                >
                    <Navigation size={16} className="inline mr-2" />
                    {t('directions')}
                </button>
            </div>

            {/* Additional Link */}
            {lawyer.placeId && (
                <div className="text-center">
                    <button
                        onClick={openInGoogleMaps}
                        className="text-sm text-[#667eea] hover:underline inline-flex items-center gap-1"
                    >
                        {t('view_on_google_maps')}
                        <ExternalLink size={12} />
                    </button>
                </div>
            )}
        </div>
    );
}

