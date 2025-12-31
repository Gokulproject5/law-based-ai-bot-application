import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Globe } from 'lucide-react';

const LANGUAGES = [
    { code: 'en-IN', name: 'English', flag: '🇮🇳' },
    { code: 'hi-IN', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'ta-IN', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te-IN', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'ml-IN', name: 'മലയാളം', flag: '🇮🇳' },
    { code: 'kn-IN', name: 'ಕನ್ನಡ', flag: '🇮🇳' }
];

export default function VoiceInput({ value = '', onChange, onSubmit, onTranscript, compact = false }) {
    const [listening, setListening] = useState(false);
    const [lang, setLang] = useState('en-IN');
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        const rec = new SpeechRecognition();
        rec.lang = lang;
        rec.interimResults = false;
        rec.maxAlternatives = 1;

        rec.onresult = (e) => {
            const text = e.results[0][0].transcript;
            if (onTranscript) onTranscript(text);
            if (onChange) onChange(text);
        };
        rec.onend = () => setListening(false);
        recognitionRef.current = rec;
    }, [onChange, lang]);

    function toggleListen() {
        if (!recognitionRef.current) return alert('Your browser does not support voice input (use Chrome/Edge/Safari).');
        if (listening) {
            recognitionRef.current.stop();
            setListening(false);
        } else {
            recognitionRef.current.start();
            setListening(true);
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
        }
    };

    return (
        <div className="relative space-y-3 fade-in">
            {/* Language Selector */}
            <div className="flex justify-end">
                <div className="relative inline-block">
                    <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full text-xs shadow-sm">
                        <Globe size={14} className="text-[#667eea]" />
                        <select
                            value={lang}
                            onChange={(e) => setLang(e.target.value)}
                            className="bg-transparent border-none outline-none cursor-pointer font-medium text-[var(--text-primary)]"
                            style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                        >
                            {LANGUAGES.map(l => (
                                <option key={l.code} value={l.code}>
                                    {l.flag} {l.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Input Area with Glassmorphism */}
            {!compact && (
                <div className="relative">
                    <div className="gradient-border rounded-2xl overflow-hidden">
                        <textarea
                            value={value}
                            onChange={e => onChange?.(e.target.value)}
                            onKeyPress={handleKeyPress}
                            rows={4}
                            className="w-full p-4 pr-24 resize-none transition-all"
                            style={{
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                border: 'none',
                                outline: 'none'
                            }}
                            placeholder={`Type your legal query or tap the mic to speak...`}
                        />
                    </div>

                    {/* Voice Wave Animation when listening */}
                    {listening && (
                        <div className="absolute top-2 left-4 flex items-center gap-1">
                            <div className="voice-wave"></div>
                            <div className="voice-wave"></div>
                            <div className="voice-wave"></div>
                            <div className="voice-wave"></div>
                            <div className="voice-wave"></div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="absolute bottom-3 right-3 flex gap-2">
                        <button
                            onClick={toggleListen}
                            className={`p-3 rounded-full transition-all ripple-container ${listening
                                    ? 'pulse glow-strong'
                                    : 'glass hover-lift'
                                }`}
                            style={{
                                background: listening
                                    ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)'
                                    : 'var(--glass-bg)',
                                boxShadow: listening ? 'var(--shadow-lg)' : 'var(--shadow-sm)'
                            }}
                            title={listening ? "Stop Recording" : "Start Voice Input"}
                        >
                            {listening ? (
                                <MicOff size={20} className="text-white" />
                            ) : (
                                <Mic size={20} style={{ color: '#667eea' }} />
                            )}
                        </button>
                        <button
                            onClick={onSubmit}
                            disabled={!value?.trim()}
                            className="btn-gradient p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Analyze Query"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            )}

            {compact && (
                <button
                    onClick={toggleListen}
                    className={`p-2 rounded-full transition-all ${listening
                            ? 'bg-red-500 text-white pulse'
                            : 'bg-[var(--bg-tertiary)] text-indigo-500 hover:bg-indigo-50 transition-colors'
                        }`}
                    title={listening ? "Stop Recording" : "Start Voice Input"}
                >
                    {listening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
            )}

            {/* Status Text */}
            <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
                {listening ? (
                    <span className="flex items-center gap-2 text-red-500 font-medium">
                        <span className="w-2 h-2 bg-red-500 rounded-full pulse"></span>
                        Listening... Speak now
                    </span>
                ) : (
                    <span>Powered by Web Speech API • Press Enter to submit</span>
                )}
            </div>
        </div>
    );
}
