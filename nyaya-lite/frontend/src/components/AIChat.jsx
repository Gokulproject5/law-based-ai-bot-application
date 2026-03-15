import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader, BookOpen, Phone, MapPin, FileText, Shield, Activity, ExternalLink, Volume2, VolumeX, Clock, AlertCircle, IndianRupee, Trash2 } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';
import { useLegalAnalysis } from '../hooks/useLegalAnalysis';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import VoiceInput from './VoiceInput';
import SkeletonLoader from './SkeletonLoader';
import ResultCard from './ResultCard';
import ReactMarkdown from 'react-markdown';

export default function AIChat() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { results, loading, error, analyzeText, sessionId } = useLegalAnalysis();
    const { speak, stop, isSpeaking, speakingId, isSupported: ttsSupported } = useSpeech();

    // Define standard markdown styles for consistent informative content
    const markdownStyles = {
        h3: ({ node, ...props }) => <h3 className="text-base font-bold text-indigo-500 mb-2 mt-4 flex items-center gap-2" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-2 my-4" {...props} />,
        li: ({ node, ...props }) => <li className="text-sm opacity-90 leading-relaxed" {...props} />,
        p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-sm opacity-90" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-bold text-indigo-500" {...props} />,
        blockquote: ({ node, ...props }) => <div className="border-l-4 border-indigo-500/30 pl-4 py-1 my-4 italic opacity-80 bg-indigo-500/5 rounded-r-lg" {...props} />,
    };

    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('nyaya_chat_history');
        return saved ? JSON.parse(saved) : [
            { type: 'bot', text: t('greeting') + " " + t('subtitle') }
        ];
    });
    const [inputValue, setInputValue] = useState("");
    const [quickReplies, setQuickReplies] = useState([]);
    const messagesEndRef = useRef(null);
    const latestMessageRef = useRef(null);

    const scrollToLatest = () => {
        if (latestMessageRef.current) {
            latestMessageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    useEffect(() => {
        if (!loading) {
            scrollToLatest();
        } else {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, loading]);

    // Save chats to local storage
    useEffect(() => {
        localStorage.setItem('nyaya_chat_history', JSON.stringify(messages));
    }, [messages]);

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

            // Set quick reply suggestions if available
            if (results.follow_up_suggestions && results.follow_up_suggestions.length > 0) {
                setQuickReplies(results.follow_up_suggestions);
            } else {
                setQuickReplies([]);
            }
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
        setQuickReplies([]); // Clear quick replies when sending

        // Trigger analysis
        await analyzeText(text);
    };

    const handleQuickReply = (reply) => {
        handleSend(reply);
    };

    const handleEmergencyAction = (button) => {
        const { type, value } = button;

        switch (type) {
            case 'call':
                window.location.href = `tel:${value}`;
                break;
            case 'link':
                window.open(value, '_blank');
                break;
            case 'action':
                if (value === 'location_police') {
                    navigate('/map', { state: { type: 'police' } });
                } else if (value === 'location_court') {
                    navigate('/map', { state: { type: 'courts' } });
                } else if (value === 'location_lawyer') {
                    navigate('/map', { state: { type: 'lawyers' } });
                } else if (value === 'draft_fir') {
                    navigate('/templates', { state: { template: 'FIR' } });
                } else if (value === 'complaint_format') {
                    navigate('/templates', { state: { template: 'Consumer' } });
                }
                break;
            default:
                console.warn('Unknown action type:', type);
        }
    };

    const clearChat = () => {
        if (window.confirm(t('confirm_clear_chat') || 'Are you sure you want to clear your chat history?')) {
            const initialMessage = [{ type: 'bot', text: t('greeting') + " " + t('subtitle') }];
            setMessages(initialMessage);
            localStorage.setItem('nyaya_chat_history', JSON.stringify(initialMessage));
        }
    };

    return (
        <div className="flex flex-col h-full bg-[var(--bg-primary)] overflow-hidden rounded-2xl shadow-inner border border-[var(--border-color)] relative">

            {/* Header / Clear Chat Row */}
            <div className="flex justify-end p-2 px-4 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                <button 
                    onClick={clearChat}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-tighter bg-red-500/5 px-2 py-1 rounded-md transition-all hover:bg-red-500/10"
                    title={t('clear_chat')}
                >
                    <Trash2 size={12} />
                    {t('clear_chat') || 'Clear History'}
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth mb-20 pb-20">
                {messages.map((msg, idx) => (
                    <div 
                        key={idx} 
                        ref={idx === messages.length - 1 ? latestMessageRef : null}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
                    >
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
                                        {/* Status / Source Info + TTS button row */}
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                {msg.data?.source === 'Gemini AI' && (
                                                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase rounded-full border border-blue-500/20">
                                                        {t('gemini_badge')}
                                                    </span>
                                                )}
                                                {msg.isError && (
                                                    <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase rounded-full">
                                                        {t('error_badge')}
                                                    </span>
                                                )}
                                            </div>

                                            {/* TTS Speak Button */}
                                            {ttsSupported && msg.text && (
                                                <button
                                                    onClick={() => speak(msg.text, idx)}
                                                    title={speakingId === idx && isSpeaking ? t('stop_reading') : t('read_aloud')}
                                                    className={`relative flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200
                                                        ${speakingId === idx && isSpeaking
                                                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40'
                                                            : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:bg-indigo-500/20 hover:text-indigo-400'
                                                        }`}
                                                >
                                                    {/* Pulsing ring when speaking */}
                                                    {speakingId === idx && isSpeaking && (
                                                        <span className="absolute inset-0 rounded-full animate-ping bg-indigo-500/40 pointer-events-none" />
                                                    )}
                                                    {speakingId === idx && isSpeaking
                                                        ? <VolumeX size={13} />
                                                        : <Volume2 size={13} />}
                                                </button>
                                            )}
                                        </div>

                                        {/* Main Analysis Block */}
                                        <div className="space-y-4">
                                            <div className="prose prose-sm dark:prose-invert max-w-none text-[var(--text-primary)]">
                                                {/* Smart Section Parsing */}
                                                {(() => {
                                                    // Support multiple marker styles: '1️⃣', '### 1.', '### 1️⃣', '### 1', etc.
                                                    const sections = msg.text.split(/(?:[1-4]️⃣|### [1-4]️⃣|### \d\.?)\s\*\*(.*?)\*\*/g);

                                                    if (sections.length > 1) {
                                                        const renderedSections = [];
                                                        for (let i = 1; i < sections.length; i += 2) {
                                                            const title = sections[i];
                                                            const content = sections[i + 1];
                                                            const sectionIndex = Math.floor(i / 2) + 1;
                                                            const emoji = sectionIndex === 1 ? '📜' : sectionIndex === 2 ? '💡' : sectionIndex === 3 ? '👣' : '⚠️';

                                                            // Logic for showing IPC laws as simple text in "Relevant Law" (Section 1)
                                                            if (sectionIndex === 1) {
                                                                // Use matches (local DB) OR relevant_laws (Gemini AI)
                                                                const lawsToShow = (msg.data?.matches && msg.data.matches.length > 0)
                                                                    ? msg.data.matches.map(m => ({
                                                                        name: m.title || m.name,   // local DB uses 'title', Gemini uses 'name'
                                                                        description: m.description,
                                                                        ipc_sections: m.ipc_sections
                                                                    })).filter(m => m.name)        // skip any with no name
                                                                    : (msg.data?.relevant_laws && msg.data.relevant_laws.length > 0)
                                                                        ? msg.data.relevant_laws
                                                                        : null;

                                                                renderedSections.push(
                                                                    <div key={title} className="mb-6 last:mb-0 animate-in fade-in slide-in-from-left-4 duration-500">
                                                                        <div className="flex items-center gap-2 mb-3">
                                                                            <span className="text-lg">{emoji}</span>
                                                                            <h4 className="text-sm font-bold text-indigo-500 uppercase tracking-wider">{title}</h4>
                                                                        </div>
                                                                        <div className="pl-4 border-l-2 border-indigo-500/10 space-y-3">
                                                                            {lawsToShow && lawsToShow.length > 0 ? (
                                                                                <ul className="space-y-4">
                                                                                    {lawsToShow.map((law, idx) => {
                                                                                        const name = law.title || law.name;
                                                                                        if (!name) return null;
                                                                                        return (
                                                                                            <li key={idx} className="text-sm">
                                                                                                <div className="flex flex-wrap items-baseline gap-2">
                                                                                                    <span className="font-bold text-gray-900 dark:text-gray-100">{name}</span>
                                                                                                    {(law.ipc_sections || law.sections) && (
                                                                                                        <span className="text-indigo-400 font-mono text-xs px-1.5 py-0.5 bg-indigo-500/10 rounded">
                                                                                                            {Array.isArray(law.ipc_sections || law.sections)
                                                                                                                ? (law.ipc_sections || law.sections).join(', ')
                                                                                                                : (law.ipc_sections || law.sections)}
                                                                                                        </span>
                                                                                                    )}
                                                                                                </div>
                                                                                                {law.description && (
                                                                                                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                                                                                        {law.description}
                                                                                                    </p>
                                                                                                )}
                                                                                            </li>
                                                                                        );
                                                                                    })}
                                                                                </ul>
                                                                            ) : (
                                                                                <ReactMarkdown components={markdownStyles}>{content}</ReactMarkdown>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            } else {
                                                                renderedSections.push(
                                                                    <div key={title} className="mb-6 last:mb-0 animate-in fade-in slide-in-from-left-4 duration-500">
                                                                        <div className="flex items-center gap-2 mb-3">
                                                                            <span className="text-lg">{emoji}</span>
                                                                            <h4 className="text-sm font-bold text-indigo-500 uppercase tracking-wider">{title}</h4>
                                                                        </div>
                                                                        <div className="pl-4 border-l-2 border-indigo-500/10">
                                                                            <ReactMarkdown components={markdownStyles}>
                                                                                {content}
                                                                            </ReactMarkdown>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }
                                                        }
                                                        return renderedSections;
                                                    }

                                                    return <ReactMarkdown components={markdownStyles}>{msg.text}</ReactMarkdown>;
                                                })()}
                                            </div>
                                        </div>

                                        {/* Emergency Action Buttons */}
                                        {msg.data?.emergency_buttons && msg.data.emergency_buttons.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[var(--border-color)]">
                                                {msg.data.emergency_buttons.map((btn, bIdx) => {
                                                    const Icon = btn.icon === 'phone' ? Phone :
                                                        btn.icon === 'map-pin' ? MapPin :
                                                            btn.icon === 'file-text' ? FileText :
                                                                btn.icon === 'shield' ? Shield :
                                                                    btn.icon === 'activity' ? Activity : ExternalLink;

                                                    return (
                                                        <button
                                                            key={bIdx}
                                                            onClick={() => handleEmergencyAction(btn)}
                                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-95 ${btn.type === 'call'
                                                                ? 'bg-red-500 text-white hover:bg-red-600'
                                                                : btn.type === 'link'
                                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                                }`}
                                                        >
                                                            <Icon size={14} />
                                                            <span>{btn.label}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Prominent Step-by-Step Guide */}
                                        {msg.data?.steps && msg.data.steps.length > 0 && (
                                            <div className="mt-6 border-t border-[var(--border-color)] pt-5 animate-in slide-in-from-bottom-4 duration-700">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                                                        <Loader size={14} className="animate-spin-slow" />
                                                    </div>
                                                    <p className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                                                        {t('step_by_step_plan')}
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

                                        {/* Confidence Score */}
                                        {msg.data?.confidence_score && (
                                            <div className="mt-4 flex items-center gap-2">
                                                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{t('confidence')}</span>
                                                <div className="flex-1 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                                                        style={{ width: `${msg.data.confidence_score * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-bold text-indigo-500">{Math.round(msg.data.confidence_score * 100)}%</span>
                                            </div>
                                        )}

                                        {/* Case Analysis: Win Probability & Improvement Suggestions */}
                                        {msg.data?.case_analysis && (
                                            <div className="mt-6 border-t border-[var(--border-color)] pt-5 animate-in slide-in-from-bottom-4 duration-700">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                                                        <Activity size={14} />
                                                    </div>
                                                    <p className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                                                        {t('case_legal_analysis') || 'Legal Strategy & Analysis'}
                                                    </p>
                                                </div>

                                                <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl border border-indigo-500/10 p-5 space-y-4">
                                                    {/* Win Probability Gauge */}
                                                    <div>
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-sm font-medium text-[var(--text-secondary)]">{t('win_probability') || 'Probable Chance of Winning'}</span>
                                                            <span className={`text-lg font-black ${msg.data.case_analysis.win_probability > 70 ? 'text-green-500' : msg.data.case_analysis.win_probability > 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                                                                {msg.data.case_analysis.win_probability}%
                                                            </span>
                                                        </div>
                                                        <div className="h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden shadow-inner">
                                                            <div
                                                                className={`h-full transition-all duration-1000 ease-out ${msg.data.case_analysis.win_probability > 70 ? 'bg-gradient-to-r from-green-400 to-green-600' : msg.data.case_analysis.win_probability > 40 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-gradient-to-r from-red-400 to-red-600'}`}
                                                                style={{ width: `${msg.data.case_analysis.win_probability}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>

                                                    {/* Legal Strategy */}
                                                    {msg.data.case_analysis.legal_strategy && (
                                                        <div className="py-3 border-y border-[var(--border-color)] border-dashed">
                                                            <p className="text-xs font-bold text-[var(--text-muted)] uppercase mb-1">{t('legal_strategy') || 'Legal Strategy'}</p>
                                                            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium leading-relaxed">
                                                                {msg.data.case_analysis.legal_strategy}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Likely Outcome */}
                                                    {msg.data.case_analysis.likely_outcome && (
                                                        <div className="py-3 border-y border-[var(--border-color)] border-dashed">
                                                            <p className="text-xs font-bold text-[var(--text-muted)] uppercase mb-1">{t('likely_outcome') || 'Likely Outcome'}</p>
                                                            <p className="text-sm text-[var(--text-primary)] leading-relaxed italic">
                                                                "{msg.data.case_analysis.likely_outcome}"
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Expected Duration */}
                                                    {msg.data.case_analysis.expected_duration && (
                                                        <div className="py-3 border-b border-[var(--border-color)] border-dashed">
                                                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                                                <Clock size={10} /> {t('expected_duration')}
                                                            </p>
                                                            <p className="text-sm text-[var(--text-secondary)]">
                                                                {msg.data.case_analysis.expected_duration}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Key Challenges */}
                                                    {msg.data.case_analysis.key_challenges && msg.data.case_analysis.key_challenges.length > 0 && (
                                                        <div className="py-3 border-b border-[var(--border-color)] border-dashed">
                                                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                                <AlertCircle size={10} /> {t('key_challenges')}
                                                            </p>
                                                            <ul className="space-y-1.5">
                                                                {msg.data.case_analysis.key_challenges.map((challenge, cIdx) => (
                                                                    <li key={cIdx} className="flex gap-2 items-start text-xs text-[var(--text-secondary)]">
                                                                        <div className="w-1 h-1 rounded-full bg-red-400/50 mt-1.5 flex-shrink-0" />
                                                                        <span>{challenge}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Estimated Cost Awareness */}
                                                    {msg.data.case_analysis.estimated_cost_range && (
                                                        <div className="py-3 border-b border-[var(--border-color)] border-dashed">
                                                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                                                <IndianRupee size={10} /> {t('estimated_cost')}
                                                            </p>
                                                            <p className="text-sm text-[var(--text-secondary)]">
                                                                {msg.data.case_analysis.estimated_cost_range}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Suggestions to increase probability */}
                                                    {msg.data.case_analysis.improvement_suggestions && msg.data.case_analysis.improvement_suggestions.length > 0 && (
                                                        <div className="pt-3">
                                                            <p className="text-xs font-bold text-[var(--text-muted)] uppercase mb-3">{t('how_to_increase_probability') || 'How to Strengthen Your Case'}</p>
                                                            <ul className="space-y-2">
                                                                {msg.data.case_analysis.improvement_suggestions.map((sug, sIdx) => (
                                                                    <li key={sIdx} className="flex gap-3 items-start text-sm text-[var(--text-secondary)]">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                                                                        <span>{sug}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Roadmap to 100% Win Success */}
                                                    {msg.data.case_analysis.winning_roadmap && msg.data.case_analysis.winning_roadmap.length > 0 && (
                                                        <div className="mt-6 pt-6 border-t border-indigo-500/20">
                                                            <div className="flex items-center gap-2 mb-4">
                                                                <div className="w-6 h-6 rounded bg-indigo-600 text-white flex items-center justify-center shadow-md">
                                                                    <Activity size={14} />
                                                                </div>
                                                                <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] animate-pulse">
                                                                    {t('roadmap_to_win') || 'Roadmap to 90-100% Success'}
                                                                </p>
                                                                <span className="text-[9px] bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded font-bold ml-auto">{t('ai_generated') || 'AI Generated'}</span>
                                                            </div>
                                                            <div className="space-y-4">
                                                                {msg.data.case_analysis.winning_roadmap.map((item, roadmapIdx) => (
                                                                    <div key={roadmapIdx} className="bg-white dark:bg-gray-800/80 p-4 rounded-2xl border border-[var(--border-color)] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                                                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 transition-all group-hover:w-2" />
                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <span className="text-[9px] font-black text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">{item.stage}</span>
                                                                        </div>
                                                                        <p className="text-sm font-bold text-[var(--text-primary)] mb-2 group-hover:text-indigo-500 transition-colors">{item.action}</p>
                                                                        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-2 rounded-lg border border-indigo-100/30">
                                                                            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed italic">
                                                                                <span className="font-bold text-indigo-400 not-italic mr-1">Impact:</span>
                                                                                {item.impact}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Emotional Support Message */}
                                        {msg.data?.emotional_support && (
                                            <div className="mt-4 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
                                                <p className="text-xs text-[var(--text-primary)] italic">
                                                    💜 {msg.data.emotional_support}
                                                </p>
                                            </div>
                                        )}

                                        {/* Risk level badge (standalone, no duplicate cards) */}
                                        {msg.data?.risk_level && (
                                            <div className="mt-4 flex justify-end">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${(msg.data.risk_level === 'High' || msg.data.risk_level === 'Emergency')
                                                    ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                    : 'bg-green-500/10 text-green-500 border-green-500/20'
                                                    }`}>
                                                    {msg.data.risk_level} {t('priority')}
                                                </span>
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
                    <div className="flex justify-start animate-in fade-in duration-300">
                        <div className="flex gap-3 max-w-[85%]">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white flex items-center justify-center shadow-lg">
                                <Bot size={16} />
                            </div>
                            <div className="p-4 bg-[var(--bg-secondary)] rounded-2xl rounded-tl-none border border-[var(--border-color)] shadow-sm">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-indigo-500 font-medium text-xs uppercase tracking-wide">
                                        <Loader size={12} className="animate-spin" />
                                        <span>{t('ai_thinking')}</span>
                                    </div>
                                    <div className="flex gap-1.5 h-3 items-center">
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Reply Suggestions */}
            {quickReplies.length > 0 && (
                <div className="absolute bottom-16 md:bottom-20 left-0 right-0 px-4 pb-2">
                    <div className="bg-[var(--glass-bg)] backdrop-blur-lg border border-[var(--glass-border)] rounded-2xl p-3 shadow-lg">
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">{t('suggested_questions')}</p>
                        <div className="flex flex-wrap gap-2">
                            {quickReplies.map((reply, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleQuickReply(reply)}
                                    className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 text-xs rounded-full border border-indigo-500/20 hover:border-indigo-500/40 transition-all"
                                >
                                    {reply}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

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
