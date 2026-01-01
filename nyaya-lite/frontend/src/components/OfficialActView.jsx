import React, { useState } from 'react';
import axios from 'axios';
import { BookOpen, Search, X, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function OfficialActView() {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedAct, setSelectedAct] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const [loading, setLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/laws/official/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchResults(res.data.results || []);
        } catch (err) {
            console.error('Error searching acts:', err);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const viewActDetails = async (actId) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/laws/official/acts/${actId}`);
            setSelectedAct(res.data);
            setSearchResults([]);
        } catch (err) {
            console.error('Error fetching act details:', err);
        } finally {
            setLoading(false);
        }
    };

    const viewSection = async (actId, section) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/laws/official/acts/${actId}/sections/${section}`);
            setSelectedSection(res.data);
        } catch (err) {
            console.error('Error fetching section:', err);
            setSelectedSection(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 fade-in">
            {/* Header */}
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold gradient-text font-['Outfit']">{t('official_acts_sections')}</h2>
                <p className="text-[var(--text-secondary)] text-sm">{t('search_official_desc')}</p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="card-premium p-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('search_acts_placeholder')}
                        className="flex-1 p-3 border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#667eea]"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 rounded-xl font-medium transition-all"
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white'
                        }}
                        disabled={loading}
                    >
                        <Search size={20} />
                    </button>
                </div>
            </form>

            {/* Loading State */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="spinner mb-4"></div>
                    <p className="text-[var(--text-secondary)]">{t('searching')}</p>
                </div>
            )}

            {/* Search Results */}
            {!loading && searchResults.length > 0 && (
                <div className="space-y-3">
                    <h3 className="font-semibold text-[var(--text-primary)]">{t('search_results')} ({searchResults.length})</h3>
                    {searchResults.map((act, idx) => (
                        <div
                            key={idx}
                            onClick={() => viewActDetails(act.id)}
                            className="card-premium p-4 cursor-pointer hover-lift slide-in-up"
                            style={{ animationDelay: `${idx * 0.1}s` }}
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                    <BookOpen size={20} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-[var(--text-primary)]">{act.title}</h4>
                                    <p className="text-sm text-[var(--text-secondary)] mt-1">{act.description}</p>
                                    <div className="flex gap-3 mt-2 text-xs text-[var(--text-muted)]">
                                        <span>{t('year')}{act.year}</span>
                                        <span>•</span>
                                        <span>{t('sections')}{act.totalSections}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Act Details View */}
            {!loading && selectedAct && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => { setSelectedAct(null); setSelectedSection(null); }}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="font-bold text-lg">{selectedAct.title}</h3>
                    </div>

                    <div className="card-premium p-4 space-y-3">
                        <div>
                            <span className="font-semibold">{t('type')}</span> {selectedAct.type}
                        </div>
                        <div>
                            <span className="font-semibold">{t('enacted')}</span> {selectedAct.enacted}
                        </div>
                        {selectedAct.commenced && (
                            <div>
                                <span className="font-semibold">{t('commenced')}</span> {selectedAct.commenced}
                            </div>
                        )}
                        <div>
                            <span className="font-semibold">{t('total_sections')}</span> {selectedAct.totalSections}
                        </div>
                        <p className="text-[var(--text-secondary)]">{selectedAct.description}</p>

                        {selectedAct.officialLink && (
                            <a
                                href={selectedAct.officialLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-[#667eea] hover:underline"
                            >
                                <ExternalLink size={16} />
                                {t('view_official_doc')}
                            </a>
                        )}
                    </div>

                    {/* Popular Sections */}
                    {selectedAct.popularSections && selectedAct.popularSections.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="font-semibold text-[var(--text-primary)]">{t('popular_sections')}</h4>
                            {selectedAct.popularSections.map((sec, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => viewSection(selectedAct.id, sec.section)}
                                    className="card-premium p-3 cursor-pointer hover-lift"
                                >
                                    <div className="font-semibold text-[#667eea]">{t('section')} {sec.section}</div>
                                    <div className="text-sm text-[var(--text-secondary)]">{sec.title}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Section Details View */}
            {selectedSection && (
                <div className="card-premium p-4 space-y-3 border-l-4 border-[#667eea]">
                    <button
                        onClick={() => setSelectedSection(null)}
                        className="text-sm text-[#667eea] hover:underline"
                    >
                        {t('back_to_act')}
                    </button>
                    <h4 className="font-bold text-lg">{t('section')} {selectedSection.section}</h4>
                    <p className="font-semibold text-[var(--text-primary)]">{selectedSection.title}</p>
                    <p className="text-[var(--text-secondary)]">{selectedSection.content}</p>

                    <div className="bg-[var(--bg-secondary)] p-3 rounded-lg space-y-2 text-sm">
                        <div><span className="font-semibold">{t('punishment')}</span> {selectedSection.punishment}</div>
                        <div className="flex gap-4">
                            <span className={selectedSection.cognizable ? 'text-green-600' : 'text-red-600'}>
                                {selectedSection.cognizable ? '✓' : '✗'} {t('cognizable')}
                            </span>
                            <span className={selectedSection.bailable ? 'text-green-600' : 'text-red-600'}>
                                {selectedSection.bailable ? '✓' : '✗'} {t('bailable')}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && searchResults.length === 0 && !selectedAct && searchQuery && (
                <div className="card-premium text-center p-8">
                    <BookOpen size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-[var(--text-secondary)]">{t('no_acts_found', { query: searchQuery })}</p>
                    <p className="text-sm text-[var(--text-muted)] mt-2">{t('try_searching_for')}</p>
                </div>
            )}
        </div>
    );
}

