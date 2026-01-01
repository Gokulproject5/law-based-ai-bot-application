import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
    { code: 'en-IN', name: 'English', flag: '🇮🇳' },
    { code: 'hi-IN', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'ta-IN', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te-IN', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'ml-IN', name: 'മലയാളം', flag: '🇮🇳' },
    { code: 'kn-IN', name: 'ಕನ್ನಡ', flag: '🇮🇳' }
];

export default function VoiceInput({ value = '', onChange, onSubmit, onTranscript, compact = false }) {
    const { t, i18n } = useTranslation();
    const [listening, setListening] = useState(false);

    // Sync internal lang with i18n.language
    const currentLang = i18n.language === 'en' ? 'en-IN' :
        i18n.language === 'hi' ? 'hi-IN' :
            i18n.language === 'ta' ? 'ta-IN' : 'en-IN';
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        const rec = new SpeechRecognition();
        rec.lang = currentLang;
        rec.interimResults = false;
        rec.maxAlternatives = 1;

        rec.onresult = (e) => {
            const text = e.results[0][0].transcript;
            if (onTranscript) onTranscript(text);
            if (onChange) onChange(text);
        };
        rec.onend = () => setListening(false);
        recognitionRef.current = rec;
    }, [onChange, currentLang, onTranscript]);

    function toggleListen() {
        if (!recognitionRef.current) return alert(t('browser_not_supported'));
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
            <div className="flex justify-start">
                <div className="relative inline-block">
                    <div className="flex items-center gap-2 glass px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-500/5 border border-indigo-500/10">
                        <Globe size={12} />
                        <span>{LANGUAGES.find(l => l.code === currentLang)?.name}</span>
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
                            placeholder={t('voice_placeholder')}
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
                            title={listening ? t('stop_recording') : t('start_voice_input')}
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
                            title={t('analyze_query')}
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
                    title={listening ? t('stop_recording') : t('start_voice_input')}
                >
                    {listening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
            )}

            {/* Status Text (Hidden on small mobile when info is already cramped) */}
            <div className={`hidden sm:flex items-center justify-center gap-2 text-xs text-[var(--text-muted)] ${compact ? 'mt-1' : ''}`}>
                {listening ? (
                    <span className="flex items-center gap-2 text-red-500 font-medium">
                        <span className="w-2 h-2 bg-red-500 rounded-full pulse"></span>
                        {t('listening_speak_now')}
                    </span>
                ) : (
                    <span>{t('powered_by_api')}</span>
                )}
            </div>
        </div>
    );
}
