import React, { useState } from 'react';
import { Phone, AlertCircle, X } from 'lucide-react';

export default function EmergencyButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2">
            {isOpen && (
                <div className="bg-white rounded-lg shadow-xl p-3 border border-red-100 flex flex-col gap-2 animate-in slide-in-from-bottom-5 fade-in duration-200 mb-2">
                    <a href="tel:112" className="flex items-center gap-3 bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition shadow-sm w-full">
                        <AlertCircle size={18} />
                        <span>Call 112 (All)</span>
                    </a>
                    <a href="tel:181" className="flex items-center gap-3 bg-pink-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-pink-700 transition shadow-sm w-full">
                        <Phone size={18} />
                        <span>Call 181 (Women)</span>
                    </a>
                    <a href="tel:1930" className="flex items-center gap-3 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-sm w-full">
                        <Shield size={18} />
                        <span>Call 1930 (Cyber)</span>
                    </a>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${isOpen ? 'bg-gray-800 rotate-45' : 'bg-red-600 hover:bg-red-700 animate-bounce-slow'}`}
            >
                {isOpen ? <X className="text-white" /> : <AlertCircle className="text-white" size={28} />}
            </button>
        </div>
    );
}

function Shield({ size }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
    )
}
