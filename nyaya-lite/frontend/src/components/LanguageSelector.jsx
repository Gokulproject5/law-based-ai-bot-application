import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="relative group z-50">
            <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors text-white">
                <Globe size={20} />
                <span className="text-sm font-medium uppercase">{i18n.language.split('-')[0]}</span>
            </button>

            <div className="absolute right-0 mt-2 w-32 bg-[var(--bg-secondary)] rounded-xl shadow-xl border border-[var(--border-color)] overflow-hidden hidden group-hover:block animate-in fade-in slide-in-from-top-2">
                <button
                    onClick={() => changeLanguage('en')}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                >
                    English
                </button>
                <button
                    onClick={() => changeLanguage('hi')}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                >
                    हिंदी (Hindi)
                </button>
                <button
                    onClick={() => changeLanguage('ta')}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                >
                    தமிழ் (Tamil)
                </button>
            </div>
        </div>
    );
}
