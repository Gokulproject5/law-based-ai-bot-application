import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';

export default function LanguageSelector() {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setIsOpen(false);
    };

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'hi', label: 'हिंदी (Hindi)' },
        { code: 'ta', label: 'தமிழ் (Tamil)' }
    ];

    return (
        <div className="relative z-50" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all border ${isOpen ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500' : 'bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)] hover:border-indigo-500/30'}`}
            >
                <Globe size={16} className={isOpen ? 'animate-pulse' : ''} />
                <span className="text-xs font-bold uppercase tracking-wider">{i18n.language.split('-')[0]}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-[var(--bg-secondary)] rounded-2xl shadow-2xl border border-[var(--border-color)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]">
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-2">Select Language</p>
                    </div>
                    <div className="p-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => changeLanguage(lang.code)}
                                className={`w-full text-left px-4 py-2.5 text-sm rounded-xl transition-all flex items-center justify-between group ${i18n.language.startsWith(lang.code) ? 'bg-indigo-500/10 text-indigo-500 font-bold' : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]'}`}
                            >
                                <span>{lang.label}</span>
                                {i18n.language.startsWith(lang.code) && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
