import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader } from 'lucide-react';
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
                            <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm flex-1 ${msg.type === 'user'
                                ? 'bg-indigo-600 text-white rounded-tr-none max-w-[80%] ml-auto'
                                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-tl-none w-full max-w-full'
                                }`}>

                                {msg.type === 'bot' ? (
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        <ReactMarkdown
                                            components={{
                                                h3: ({ node, ...props }) => <h3 className="text-base font-bold text-indigo-500 mb-2 mt-4" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1 my-3" {...props} />,
                                                li: ({ node, ...props }) => <li className="text-sm opacity-90" {...props} />,
                                                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                strong: ({ node, ...props }) => <strong className="font-bold text-indigo-400" {...props} />,
                                            }}
                                        >
                                            {msg.text}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    msg.text
                                )}

                                {/* Rich Content for Bot (if available) */}
                                {msg.data && (
                                    <div className="mt-6 space-y-6">
                                        {/* If we have direct law matches (from backend analyzer) */}
                                        {msg.data.matches && msg.data.matches.length > 0 && (
                                            <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Verified Legal Matches</p>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {msg.data.matches.slice(0, 2).map((match, i) => (
                                                        <ResultCard key={i} match={match} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Simple Explanation / Bottom Stats if it was a legal query */}
                                        {msg.data.primary_offense && msg.data.primary_offense !== 'Conversational' && (
                                            <div className="flex flex-wrap gap-2 pt-2">
                                                {msg.data.risk_level && msg.data.risk_level !== 'N/A' && (
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${(msg.data.risk_level === 'High' || msg.data.risk_level === 'Emergency')
                                                            ? 'bg-red-500/10 text-red-500'
                                                            : 'bg-green-500/10 text-green-500'
                                                        }`}>
                                                        {msg.data.risk_level} Risk
                                                    </span>
                                                )}
                                                {msg.data.lawyer_type && (
                                                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 text-[10px] font-bold uppercase">
                                                        {msg.data.lawyer_type}
                                                    </span>
                                                )}
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
