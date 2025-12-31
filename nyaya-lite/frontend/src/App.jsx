import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Mic, BookOpen, FileText, MapPin, Home, Info, Moon, Sun, AlertTriangle } from 'lucide-react';
import VoiceInput from './components/VoiceInput';
import ResultCard from './components/ResultCard';
import DailyTip from './components/DailyTip';
import DisclaimerPopup from './components/DisclaimerPopup';
import EmergencyButton from './components/EmergencyButton';

// Lazy load route components
const CategoryView = lazy(() => import('./components/CategoryView'));
const TemplateGenerator = lazy(() => import('./components/TemplateGenerator'));
const MapView = lazy(() => import('./components/MapView'));
import axios from 'axios';

export default function App() {
    const [input, setInput] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const location = useLocation();

    // Initialize dark mode from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
        setDarkMode(isDark);
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // Toggle dark mode
    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    async function analyzeText(text) {
        setLoading(true);
        setResults(null);
        try {
            const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');
            const r = await axios.post(`${API_URL}/api/analyze`, { text });
            setResults(r.data);
        } catch (e) {
            console.error(e);
            setResults({ error: 'Server error. Is the backend running?' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col max-w-md mx-auto overflow-hidden relative">
            <DisclaimerPopup />
            <EmergencyButton />

            {/* Dark Mode Toggle */}
            <button
                onClick={toggleDarkMode}
                className="dark-mode-toggle transition-all"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
                {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-indigo-600" />}
            </button>

            {/* Header with Gradient */}
            <header className="glass relative p-4 flex justify-between items-center shadow-lg z-10" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <h1 className="text-xl font-bold flex items-center gap-3 text-white">
                    <img src="/logo.png" alt="NyayaLite Logo" className="w-7 h-7 object-contain flex-shrink-0" />
                    <span className="font-['Outfit']">NyayaLite</span>
                </h1>
                <DailyTip />
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 overflow-y-auto pb-24 relative z-0">
                <Suspense fallback={
                    <div className="flex flex-col items-center justify-center h-full py-20">
                        <div className="spinner mb-4"></div>
                        <p className="text-[var(--text-secondary)]">Loading resources...</p>
                    </div>
                }>
                    <Routes>
                        <Route path="/" element={
                            <div className="space-y-6 fade-in">
                                <div className="text-center space-y-2 mt-4">
                                    <h2 className="text-3xl font-bold gradient-text font-['Outfit']">How can we help?</h2>
                                    <p className="text-[var(--text-secondary)]">Speak or type your legal problem below.</p>
                                </div>

                                <VoiceInput value={input} onChange={setInput} onSubmit={() => analyzeText(input)} />

                                <div className="mt-6">
                                    {loading && (
                                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                            <div className="spinner"></div>
                                            <p className="text-[var(--text-secondary)] animate-pulse">Analyzing your query...</p>
                                        </div>
                                    )}
                                    {!loading && results && results.matches && results.matches.length > 0 && (
                                        <div className="space-y-4">
                                            {results.matches.map((m, idx) => (
                                                <div key={idx} className="slide-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                                                    <ResultCard match={m} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {!loading && results && results.matches && results.matches.length === 0 && (
                                        <div className="card-premium text-center p-6">
                                            <p className="text-[var(--text-secondary)]">{results.message || "No matches found."}</p>
                                            {results.suggestion && <p className="text-sm text-[#667eea] mt-2">{results.suggestion}</p>}
                                        </div>
                                    )}
                                    {!loading && results && results.error && (
                                        <div className="card-premium text-center p-6" style={{
                                            background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(238, 90, 111, 0.1) 100%)',
                                            border: '2px solid rgba(255, 107, 107, 0.3)'
                                        }}>
                                            <p className="text-red-500 font-medium">{results.error}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Quick Action Cards */}
                                <div className="grid grid-cols-2 gap-3 mt-8">
                                    <Link to="/categories" className="card-premium p-4 flex flex-col items-center gap-3 hover-lift transition-all group">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all" style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                        }}>
                                            <BookOpen className="text-white" size={24} />
                                        </div>
                                        <span className="font-semibold text-sm text-[var(--text-primary)]">Browse Laws</span>
                                    </Link>
                                    <Link to="/templates" className="card-premium p-4 flex flex-col items-center gap-3 hover-lift transition-all group">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all" style={{
                                            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                                        }}>
                                            <FileText className="text-white" size={24} />
                                        </div>
                                        <span className="font-semibold text-sm text-[var(--text-primary)]">Templates</span>
                                    </Link>
                                    <Link to="/map" className="card-premium p-4 flex flex-col items-center gap-3 hover-lift transition-all group">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all" style={{
                                            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
                                        }}>
                                            <MapPin className="text-white" size={24} />
                                        </div>
                                        <span className="font-semibold text-sm text-[var(--text-primary)]">Find Help</span>
                                    </Link>
                                    <div
                                        className="card-premium p-4 flex flex-col items-center gap-3 hover-lift transition-all cursor-pointer group"
                                        onClick={() => alert("Coming soon: AI Lawyer Chat powered by advanced legal knowledge!")}
                                    >
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all" style={{
                                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                                        }}>
                                            <Info className="text-white" size={24} />
                                        </div>
                                        <span className="font-semibold text-sm text-[var(--text-primary)]">AI Chat</span>
                                    </div>
                                </div>
                            </div>
                        } />
                        <Route path="/categories" element={<CategoryView />} />
                        <Route path="/templates" element={<TemplateGenerator />} />
                        <Route path="/map" element={<MapView />} />
                    </Routes>
                </Suspense>
            </main>

            {/* Bottom Nav - Floating Pill Design */}
            <nav className="fixed bottom-6 left-0 right-0 mx-auto w-[90%] max-w-[380px] z-50">
                <div className="glass-dark rounded-2xl p-2 flex justify-around items-center shadow-2xl border border-[rgba(255,255,255,0.1)] backdrop-blur-md">
                    <Link to="/" className={`flex flex-col items-center p-2 rounded-xl transition-all relative ${location.pathname === '/' ? 'text-[#667eea]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
                        {location.pathname === '/' && (
                            <div className="absolute -top-1 w-1 h-1 rounded-full bg-[#667eea] shadow-[0_0_10px_#667eea]" />
                        )}
                        <Home size={22} className={location.pathname === '/' ? 'scale-110' : ''} />
                    </Link>

                    <Link to="/categories" className={`flex flex-col items-center p-2 rounded-xl transition-all relative ${location.pathname === '/categories' ? 'text-[#667eea]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
                        {location.pathname === '/categories' && (
                            <div className="absolute -top-1 w-1 h-1 rounded-full bg-[#667eea] shadow-[0_0_10px_#667eea]" />
                        )}
                        <BookOpen size={22} className={location.pathname === '/categories' ? 'scale-110' : ''} />
                    </Link>

                    {/* Floating Action Button for Forms (Middle) */}
                    <Link to="/templates" className="relative -top-6">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${location.pathname === '/templates'
                            ? 'bg-gradient-to-tr from-[#667eea] to-[#764ba2] ring-4 ring-[var(--bg-primary)]'
                            : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)]'
                            }`}>
                            <FileText size={24} className={location.pathname === '/templates' ? 'text-white' : ''} />
                        </div>
                    </Link>

                    <Link to="/map" className={`flex flex-col items-center p-2 rounded-xl transition-all relative ${location.pathname === '/map' ? 'text-[#667eea]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
                        {location.pathname === '/map' && (
                            <div className="absolute -top-1 w-1 h-1 rounded-full bg-[#667eea] shadow-[0_0_10px_#667eea]" />
                        )}
                        <MapPin size={22} className={location.pathname === '/map' ? 'scale-110' : ''} />
                    </Link>

                    <button
                        onClick={() => alert("Coming soon: User Profile & Settings")}
                        className="flex flex-col items-center p-2 rounded-xl transition-all text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                        <AlertTriangle size={22} />
                    </button>
                </div>
            </nav>
        </div>
    );
}
