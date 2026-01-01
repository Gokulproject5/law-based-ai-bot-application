import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function DisclaimerPopup({ onAccept }) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const hasAccepted = localStorage.getItem('nyaya_disclaimer_accepted');
        if (!hasAccepted) {
            setIsOpen(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('nyaya_disclaimer_accepted', 'true');
        setIsOpen(false);
        if (onAccept) onAccept();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
                <div className="flex items-center gap-2 text-red-600 border-b pb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h2 className="text-xl font-bold">{t('legal_disclaimer_title')}</h2>
                </div>

                <div className="text-gray-700 space-y-3 text-sm">
                    <p><strong>{t('disclaimer_point1_title')}</strong> {t('disclaimer_point1_desc')}</p>
                    <p><strong>{t('disclaimer_point2_title')}</strong> {t('disclaimer_point2_desc')}</p>
                    <p><strong>{t('disclaimer_point3_title')}</strong> {t('disclaimer_point3_desc')}</p>
                    <p><strong>{t('disclaimer_point4_title')}</strong> {t('disclaimer_point4_desc')}</p>
                </div>

                <button
                    onClick={handleAccept}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                    {t('i_understand_agree')}
                </button>
            </div>
        </div>
    );
}

