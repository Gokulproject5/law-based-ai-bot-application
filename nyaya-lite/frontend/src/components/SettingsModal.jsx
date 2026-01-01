import React from 'react';
import { X, Globe, Moon, Sun, Shield, Info, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

export default function SettingsModal({ isOpen, onClose }) {
    const { t, i18n } = useTranslation();
    const { darkMode, toggleTheme } = useTheme();

    if (!isOpen) return null;

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'हिंदी (Hindi)' },
        { code: 'ta', name: 'தமிழ் (Tamil)' }
    ];

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-[var(--bg-secondary)] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-[var(--border-color)]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-tertiary)]/50">
                    <h2 className="text-xl font-bold font-['Outfit']">{t('settings')}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh]">
                    {/* Language Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-indigo-500">
                            <Globe size={18} />
                            <h3 className="text-sm font-bold uppercase tracking-wider">{t('language')}</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => changeLanguage(lang.code)}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${i18n.language === lang.code
                                            ? 'bg-indigo-500 border-indigo-500 text-white shadow-md'
                                            : 'bg-[var(--bg-tertiary)] border-[var(--border-color)] hover:border-indigo-500/50'
                                        }`}
                                >
                                    <span className="font-medium">{lang.name}</span>
                                    {i18n.language === lang.code && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Appearance Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-indigo-500">
                            {darkMode ? <Moon size={18} /> : <Sun size={18} />}
                            <h3 className="text-sm font-bold uppercase tracking-wider">Appearance</h3>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="w-full flex items-center justify-between px-4 py-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)] hover:border-indigo-500/50 transition-all font-medium"
                        >
                            <span>{darkMode ? 'Dark Mode Active' : 'Light Mode Active'}</span>
                            <div className={`w-12 h-6 rounded-full relative transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${darkMode ? 'left-7' : 'left-1'}`}></div>
                            </div>
                        </button>
                    </div>

                    {/* About Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-indigo-500">
                            <Info size={18} />
                            <h3 className="text-sm font-bold uppercase tracking-wider">About</h3>
                        </div>
                        <div className="bg-[var(--bg-tertiary)] rounded-2xl p-4 border border-[var(--border-color)] space-y-3">
                            <div className="flex justify-between items-center text-sm border-b border-[var(--border-color)] pb-2">
                                <span className="text-[var(--text-secondary)]">Version</span>
                                <span className="font-mono font-bold">1.2.0</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-[var(--border-color)] pb-2">
                                <span className="text-[var(--text-secondary)]">Legal Database</span>
                                <span className="font-bold text-green-500">Online</span>
                            </div>
                            <button className="w-full text-indigo-500 text-sm font-bold hover:underline flex items-center gap-2">
                                <Shield size={14} />
                                View Privacy Policy
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-[var(--bg-tertiary)]/30 border-t border-[var(--border-color)]">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition active:scale-95"
                    >
                        Save & Close
                    </button>
                </div>
            </div>
        </div>
    );
}
