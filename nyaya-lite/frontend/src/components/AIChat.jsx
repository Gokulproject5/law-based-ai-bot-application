import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader, BookOpen } from 'lucide-react';
import { useLegalAnalysis } from '../hooks/useLegalAnalysis';
import { useTranslation } from 'react-i18next';
import VoiceInput from './VoiceInput';
import SkeletonLoader from './SkeletonLoader';
import ResultCard from './ResultCard';
import ReactMarkdown from 'react-markdown';

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
            // Priority: AI detailed_analysis -> AI summary -> Local message -> Fallback
            const responseText = results.detailed_analysis ||
                results.summary ||
                results.message ||
                (results.matches && results.matches[0]?.description) ||
                t('analyzed_results');

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
            setMessages(prev => [...prev, { type: 'bot', text: t('error_encountered') + error, isError: true }]);
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
                            <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm flex-1 ${msg.type === 'user'
                                ? 'bg-indigo-600 text-white rounded-tr-none max-w-[80%] ml-auto'
                                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-tl-none w-full max-w-full'
                                }`}>

                                {msg.type === 'bot' ? (
                                    <div className="space-y-4">
                                        {/* Status / Source Info */}
                                        <div className="flex items-center gap-2">
                                            {msg.data?.source === 'Gemini AI' && (
                                                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase rounded-full border border-blue-500/20">
                                                    Gemini Legal Guide
                                                </span>
                                            )}
                                            {msg.isError && (
                                                <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase rounded-full">
                                                    Error
                                                </span>
                                            )}
                                        </div>

                                        {/* Main Analysis Block */}
                                        <div className="prose prose-sm dark:prose-invert max-w-none text-[var(--text-primary)]">
                                            <ReactMarkdown
                                                components={{
                                                    h3: ({ node, ...props }) => <h3 className="text-base font-bold text-indigo-500 mb-2 mt-4 flex items-center gap-2" {...props} />,
                                                    ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1 my-3" {...props} />,
                                                    li: ({ node, ...props }) => <li className="text-sm opacity-90" {...props} />,
                                                    p: ({ node, ...props }) => <p className="mb-3 leading-relaxed" {...props} />,
                                                    strong: ({ node, ...props }) => <strong className="font-bold text-indigo-400" {...props} />,
                                                }}
                                            >
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>

                                        {/* Prominent Step-by-Step Guide */}
                                        {msg.data?.steps && msg.data.steps.length > 0 && (
                                            <div className="mt-6 border-t border-[var(--border-color)] pt-5 animate-in slide-in-from-bottom-4 duration-700">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                                                        <Loader size={14} className="animate-spin-slow" />
                                                    </div>
                                                    <p className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                                                        Your Step-by-Step Action Plan
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-1 gap-3">
                                                    {msg.data.steps.map((step, sIdx) => (
                                                        <div
                                                            key={sIdx}
                                                            className="flex gap-4 p-4 bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--border-color)] hover:border-indigo-500/30 transition-all group"
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-sm font-bold flex-shrink-0 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                                                {sIdx + 1}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-[var(--text-primary)]">{step.title}</p>
                                                                <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                                                                    {step.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Legal References & Severity */}
                                        {(msg.data?.matches || msg.data?.relevant_laws || msg.data?.primary_offense) && (
                                            <div className="mt-6 border-t border-[var(--border-color)] pt-5 space-y-4">
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                                                            Legal Framework
                                                        </p>
                                                    </div>

                                                    {msg.data.risk_level && (
                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${(msg.data.risk_level === 'High' || msg.data.risk_level === 'Emergency')
                                                            ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                            : 'bg-green-500/10 text-green-500 border-green-500/20'
                                                            }`}>
                                                            {msg.data.risk_level} Priority
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {msg.data.matches?.slice(0, 2).map((match, i) => (
                                                        <ResultCard key={i} match={match} />
                                                    ))}
                                                    {!msg.data.matches?.length && msg.data.relevant_laws?.slice(0, 2).map((law, i) => (
                                                        <div key={`rem-${i}`} className="p-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)] flex items-start gap-2">
                                                            <div className="p-1 bg-indigo-500/10 rounded-lg">
                                                                <BookOpen size={14} className="text-indigo-500" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-[var(--text-primary)]">{law.name}</p>
                                                                <p className="text-[11px] text-[var(--text-secondary)] mt-1">{law.description}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="leading-relaxed">{msg.text}</p>
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
            <div className="absolute bottom-0 left-0 right-0 p-2 md:p-4 bg-[var(--glass-bg)] backdrop-blur-lg border-t border-[var(--glass-border)] flex items-center gap-2 shadow-2xl">
                <VoiceInput onTranscript={(text) => setInputValue(text)} compact={true} />

                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
                    placeholder={t('input_placeholder')}
                    className="flex-1 bg-[var(--bg-tertiary)] border-0 focus:ring-2 ring-indigo-500 rounded-full px-3 md:px-4 py-2 text-sm"
                    disabled={loading}
                />

                <button
                    onClick={() => handleSend(inputValue)}
                    disabled={!inputValue.trim() || loading}
                    className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <Send size={18} md:size={20} />
                </button>
            </div>
        </div >
    );
}
