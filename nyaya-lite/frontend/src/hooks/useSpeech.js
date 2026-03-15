import { useState, useCallback, useRef, useEffect } from 'react';
import i18n from '../i18n';

/**
 * useSpeech – Text-to-Speech hook.
 *
 * Strategy:
 *  1. Tamil (ta) → Backend proxy → Google Translate TTS (CORS-free, native Tamil voice)
 *  2. Hindi / English → Web Speech API browser voices (widely available on Windows)
 *  3. Fallback → Backend proxy for any language if browser voices fail
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Build the backend TTS proxy URL.
 * We split long text upstream, so each chunk is ≤ 200 chars.
 */
function buildProxyUrl(text, lang, speed = 0.9) {
    const params = new URLSearchParams({ text, lang, speed: String(speed) });
    return `${API_BASE}/api/tts?${params.toString()}`;
}

/**
 * Strip markdown and emoji noise so TTS gets clean plain text.
 */
function cleanForTTS(raw) {
    return raw
        .replace(/[1-4]\uFE0F\u20E3/g, '')           // 1️⃣ 2️⃣ 3️⃣ 4️⃣
        .replace(/#{1,6}\s/g, '')                      // Headings
        .replace(/\*\*(.*?)\*\*/g, '$1')               // **bold**
        .replace(/\*(.*?)\*/g, '$1')                   // *italic*
        .replace(/`[^`]*`/g, '')                       // `code`
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')      // [link](url)
        .replace(/>\s?/g, '')                          // > blockquote
        .replace(/[-•*]\s/g, '')                       // bullets
        .replace(/[\u{1F300}-\u{1FFFF}]/gu, '')       // emoji block 1
        .replace(/[\u{2600}-\u{27BF}]/gu, '')          // emoji block 2
        .replace(/\n+/g, ' ')
        .replace(/\.{2,}/g, '.')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

/**
 * Split text into sentence chunks of up to maxLen chars.
 */
function chunkText(text, maxLen = 190) {
    const sentences = text.match(/[^.!?।\n]+[.!?।]*/g) || [text];
    const chunks = [];
    let cur = '';
    for (const s of sentences) {
        if ((cur + s).length > maxLen) {
            if (cur.trim()) chunks.push(cur.trim());
            cur = s;
        } else {
            cur += s;
        }
    }
    if (cur.trim()) chunks.push(cur.trim());
    return chunks.length ? chunks : [text.slice(0, maxLen)];
}

export function useSpeech() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speakingId, setSpeakingId] = useState(null);
    const [voices, setVoices] = useState([]);
    const audioRef = useRef(null);
    const utteranceRef = useRef(null);
    const isPlayingRef = useRef(false);

    const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

    // ── Load browser voices (Chrome loads them async) ────────────────────────
    useEffect(() => {
        if (!isSupported) return;
        const load = () => {
            const v = window.speechSynthesis.getVoices();
            if (v.length) setVoices(v);
        };
        load();
        window.speechSynthesis.addEventListener('voiceschanged', load);
        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', load);
            window.speechSynthesis.cancel();
        };
    }, [isSupported]);

    // ── Find best browser voice ───────────────────────────────────────────────
    const getBestVoice = useCallback((bcp47) => {
        if (!voices.length) return null;
        const lang = bcp47.toLowerCase();
        const prefix = lang.split('-')[0];
        return (
            voices.find(v => v.lang.toLowerCase() === lang) ||
            voices.find(v => v.lang.toLowerCase().startsWith(prefix)) ||
            null
        );
    }, [voices]);

    // ── Stop everything ───────────────────────────────────────────────────────
    const stopAll = useCallback(() => {
        isPlayingRef.current = false;
        if (isSupported) window.speechSynthesis.cancel();
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
            audioRef.current = null;
        }
        setIsSpeaking(false);
        setSpeakingId(null);
    }, [isSupported]);

    // ── Play chunks sequentially via backend proxy ────────────────────────────
    const playViaProxy = useCallback((chunks, lang, id, chunkIdx = 0) => {
        if (!isPlayingRef.current || chunkIdx >= chunks.length) {
            if (isPlayingRef.current) {
                setIsSpeaking(false);
                setSpeakingId(null);
                isPlayingRef.current = false;
            }
            return;
        }

        const url = buildProxyUrl(chunks[chunkIdx], lang);
        const audio = new Audio();
        audioRef.current = audio;

        // First chunk → set speaking state
        if (chunkIdx === 0) {
            setIsSpeaking(true);
            setSpeakingId(id);
        }

        audio.oncanplaythrough = () => {
            audio.play().catch(err => {
                console.error('Audio play error:', err);
                stopAll();
            });
        };

        audio.onended = () => {
            if (isPlayingRef.current) {
                playViaProxy(chunks, lang, id, chunkIdx + 1);
            }
        };

        audio.onerror = (e) => {
            console.error('TTS proxy audio error (chunk', chunkIdx, '):', e);
            // Try next chunk anyway
            if (isPlayingRef.current) {
                playViaProxy(chunks, lang, id, chunkIdx + 1);
            }
        };

        audio.src = url;
        audio.load();
    }, [stopAll]);

    // ── Main speak function ───────────────────────────────────────────────────
    const speak = useCallback((text, id, opts = {}) => {
        // Toggle off if same message
        if (isSpeaking && speakingId === id) {
            stopAll();
            return;
        }
        stopAll();

        const cleaned = cleanForTTS(text);
        if (!cleaned) return;

        const appLang = i18n.language.split('-')[0];   // 'ta' | 'hi' | 'en'
        const bcp47Map = { ta: 'ta-IN', hi: 'hi-IN', en: 'en-IN' };
        const bcp47Locale = bcp47Map[appLang] || 'en-IN';

        // ── Tamil: always use backend proxy (no Windows browser Tamil voice) ──
        if (appLang === 'ta') {
            console.log('🔊 Tamil TTS → backend proxy → Google Translate');
            const chunks = chunkText(cleaned);
            isPlayingRef.current = true;
            playViaProxy(chunks, 'ta', id);
            return;
        }

        // ── Hindi / English: try Web Speech API ───────────────────────────────
        if (isSupported) {
            const bestVoice = getBestVoice(bcp47Locale);
            const utterance = new SpeechSynthesisUtterance(cleaned);
            utterance.lang = bcp47Locale;
            utterance.rate = opts.rate ?? 0.9;
            utterance.pitch = opts.pitch ?? 1;
            utterance.volume = opts.volume ?? 1;
            if (bestVoice) {
                utterance.voice = bestVoice;
                console.log(`🔊 Browser TTS: ${bestVoice.name} (${bestVoice.lang})`);
            }

            utterance.onstart = () => { setIsSpeaking(true); setSpeakingId(id); };
            utterance.onend = () => { setIsSpeaking(false); setSpeakingId(null); };
            utterance.onerror = (e) => {
                console.warn('Web Speech fallback to proxy:', e.error);
                // Fallback to proxy
                const chunks = chunkText(cleaned);
                isPlayingRef.current = true;
                playViaProxy(chunks, appLang, id);
            };

            utteranceRef.current = utterance;
            window.speechSynthesis.speak(utterance);
            return;
        }

        // ── Ultimate fallback: proxy for any language ─────────────────────────
        const chunks = chunkText(cleaned);
        isPlayingRef.current = true;
        playViaProxy(chunks, appLang, id);

    }, [isSpeaking, speakingId, isSupported, getBestVoice, stopAll, playViaProxy]);

    return { speak, stop: stopAll, isSpeaking, speakingId, isSupported: true };
}
