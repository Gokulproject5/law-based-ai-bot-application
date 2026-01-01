import React, { useState, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Components
import Navigation from './components/Navigation';
import AIChat from './components/AIChat';
import LanguageSelector from './components/LanguageSelector';
import DailyTip from './components/DailyTip';
import DisclaimerPopup from './components/DisclaimerPopup';
import EmergencyButton from './components/EmergencyButton';
import SkeletonLoader from './components/SkeletonLoader';

import { useTheme } from './context/ThemeContext';

// Lazy load route components
const CategoryView = lazy(() => import('./components/CategoryView'));
const TemplateGenerator = lazy(() => import('./components/TemplateGenerator'));
const MapView = lazy(() => import('./components/MapView'));

export default function App() {
    const { darkMode, toggleTheme } = useTheme();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 font-inter">
            <DisclaimerPopup />
            <EmergencyButton />

            {/* Navigation (Sidebar Desktop / Bottom Bar Mobile) */}
            <Navigation />

            {/* Main Content Area */}
            <div className="md:pl-64 flex flex-col min-h-screen">

                {/* Header */}
                <header className="sticky top-0 z-30 backdrop-blur-md bg-[var(--glass-bg)] border-b border-[var(--border-color)] px-6 py-4 flex justify-between items-center shadow-sm">
                    {/* Mobile Logo Only */}
                    <div className="md:hidden flex items-center gap-2">
                        <img src="/logo.png" alt="Logo" className="w-8 h-8" />
                        <span className="font-bold text-lg font-['Outfit']">NyayaLite</span>
                    </div>

                    {/* Desktop Spacer */}
                    <div className="hidden md:block">
                        <h2 className="text-xl font-semibold opacity-80">{t('greeting')}</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <DailyTip compact={true} />
                        <LanguageSelector />
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors border border-[var(--border-color)]"
                            title={darkMode ? t('switch_light') : t('switch_dark')}
                        >
                            {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-indigo-600" />}
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-hidden">
                    <Suspense fallback={
                        <div className="h-full flex items-center justify-center">
                            <SkeletonLoader />
                        </div>
                    }>
                        <Routes>
                            <Route path="/" element={
                                <div className="h-[calc(100vh-140px)]">
                                    <AIChat />
                                </div>
                            } />
                            <Route path="/categories" element={<CategoryView />} />
                            <Route path="/templates" element={<TemplateGenerator />} />
                            <Route path="/map" element={
                                <div className="h-[calc(100vh-140px)]">
                                    <MapView />
                                </div>
                            } />
                        </Routes>
                    </Suspense>
                </main>
            </div>
        </div>
    );
}
