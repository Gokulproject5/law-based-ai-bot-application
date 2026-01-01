import React, { useState } from 'react';
import { Phone, AlertCircle, X, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function EmergencyButton() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-40 right-6 z-40 flex flex-col items-end gap-2 pointer-events-none">
            {isOpen && (
                <div className="bg-white rounded-2xl shadow-2xl p-4 border border-red-100 flex flex-col gap-3 animate-in slide-in-from-bottom-5 fade-in duration-200 mb-4 w-64 pointer-events-auto">
                    <a href="tel:112" className="flex items-center gap-3 bg-red-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-lg w-full">
                        <AlertCircle size={20} />
                        <span>{t('call_all')}</span>
                    </a>
                    <a href="tel:181" className="flex items-center gap-3 bg-pink-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-pink-700 transition shadow-lg w-full">
                        <Phone size={20} />
                        <span>{t('call_women')}</span>
                    </a>
                    <a href="tel:1930" className="flex items-center gap-3 bg-blue-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg w-full">
                        <Shield size={20} />
                        <span>{t('call_cyber')}</span>
                    </a>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-3 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center pointer-events-auto ${isOpen ? 'bg-gray-800 rotate-45 scale-90' : 'bg-red-600 hover:bg-red-700 hover:scale-110'}`}
            >
                {isOpen ? <X className="text-white" size={20} /> : <AlertCircle className="text-white animate-pulse" size={24} />}
            </button>
        </div>
    );
}

