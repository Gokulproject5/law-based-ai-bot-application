import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader } from 'lucide-react';
import { useLegalAnalysis } from '../hooks/useLegalAnalysis';
import { useTranslation } from 'react-i18next';
import VoiceInput from './VoiceInput';
import SkeletonLoader from './SkeletonLoader';

export default function AIChat() {
    const { t } = useTranslation();
    const { results, loading, error, analyzeText } = useLegalAnalysis();
    const [messages, setMessages] = useState([
        { type: 'bot', text: t('greeting') + " " + t('subtitle') }
    ]);
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    // Handle new results from the hook
    useEffect(() => {
        if (results) {
            // Priority: AI summary -> Local message -> First matched law description -> Fallback
            const responseText = results.summary ||
                results.message ||
                (results.matches && results.matches[0]?.description) ||
                "I've analyzed your situation and found some relevant legal information.";

            const botResponse = {
                type: 'bot',
                data: results,
                text: responseText
            };
            setMessages(prev => [...prev, botResponse]);
        }
    }, [results]);

    // Handle errors
    useEffect(() => {
        if (error) {
            setMessages(prev => [...prev, { type: 'bot', text: "Sorry, I encountered an error: " + error, isError: true }]);
        }
    }, [error]);

    const handleSend = async (text) => {
        if (!text || !text.trim()) return;

        // Add user message
        setMessages(prev => [...prev, { type: 'user', text: text }]);
        setInputValue("");

        // Trigger analysis
        await analyzeText(text);
    };

    return (
        <div className="flex flex-col h-full bg-[var(--bg-primary)] overflow-hidden rounded-2xl shadow-inner border border-[var(--border-color)] relative">

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth pb-20">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                        <div className={`flex gap-3 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.type === 'user' ? 'bg-indigo-500 text-white' : 'bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white'
                                }`}>
                                {msg.type === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>

                            {/* Bubble */}
                            <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.type === 'user'
                                ? 'bg-indigo-500 text-white rounded-tr-none'
                                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-tl-none'
                                }`}>
                                {msg.text}

                                {/* Rich Content for Bot (if available) */}
                                {msg.data && (
                                    <div className="mt-4 space-y-3">
                                        {/* Simple Explanation for AI Responses */}
                                        {msg.data.simple_explanation && (
                                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800 text-sm italic">
                                                {msg.data.simple_explanation}
                                            </div>
                                        )}

                                        {/* Risk Badge (AI urgency or Local urgency) */}
                                        {(msg.data.risk_level || msg.data.urgency_level) && (
                                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase ${(msg.data.risk_level === 'High' || msg.data.urgency_level === 'High' || msg.data.risk_level === 'Emergency' || msg.data.urgency_level === 'Emergency')
                                                    ? 'bg-red-100 text-red-600'
                                                    : 'bg-green-100 text-green-600'
                                                }`}>
                                                {msg.data.risk_level || msg.data.urgency_level} Risk
                                            </span>
                                        )}

                                        {/* Steps - prefer AI steps, fallback to matching laws if needed */}
                                        {msg.data.steps ? (
                                            msg.data.steps.slice(0, 3).map((step, i) => (
                                                <div key={i} className="pl-3 border-l-2 border-indigo-200">
                                                    <p className="font-bold text-xs">{step.title}</p>
                                                    <p className="text-xs opacity-80">{step.description}</p>
                                                </div>
                                            ))
                                        ) : msg.data.matches && msg.data.matches.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-xs font-bold text-indigo-500 uppercase">Relevant Provisions:</p>
                                                {msg.data.matches.slice(0, 2).map((match, i) => (
                                                    <div key={i} className="pl-3 border-l-2 border-indigo-200">
                                                        <p className="font-bold text-xs">{match.title}</p>
                                                        <p className="text-xs opacity-80 line-clamp-2">{match.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="flex gap-3 max-w-[85%]">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white flex items-center justify-center">
                                <Bot size={16} />
                            </div>
                            <div className="p-4 bg-[var(--bg-secondary)] rounded-2xl rounded-tl-none border border-[var(--border-color)]">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-[var(--glass-bg)] backdrop-blur-lg border-t border-[var(--glass-border)] flex items-center gap-2">
                <VoiceInput onTranscript={(text) => setInputValue(text)} compact={true} />

                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
                    placeholder={t('input_placeholder')}
                    className="flex-1 bg-[var(--bg-tertiary)] border-0 focus:ring-2 ring-indigo-500 rounded-full px-4 py-2 text-sm"
                    disabled={loading}
                />

                <button
                    onClick={() => handleSend(inputValue)}
                    disabled={!inputValue.trim() || loading}
                    className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
}
