import React, { useState } from 'react';
import { AlertTriangle, Shield, FileText, ChevronDown, ChevronUp, Download } from 'lucide-react';
import EvidenceHelper from './EvidenceHelper';
import { useTranslation } from 'react-i18next';

export default function ResultCard({ match, defaultExpanded = false }) {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(defaultExpanded);

    const severityColors = {
        Low: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        Medium: 'bg-orange-100 text-orange-800 border-orange-200',
        High: 'bg-red-100 text-red-800 border-red-200',
        Emergency: 'bg-red-600 text-white border-red-700 animate-pulse'
    };

    const downloadSummary = () => {
        const content = `
NYAYA LITE - LEGAL SUMMARY
--------------------------
Issue: ${match.title}
Category: ${match.category}
Severity: ${match.severity}

IPC Sections: ${match.ipc_sections ? match.ipc_sections.join(', ') : 'N/A'}

Steps to Take:
${match.steps ? match.steps.map((s, i) => `${i + 1}. ${s}`).join('\n') : '-'}

Evidence Required:
${match.evidence_required ? match.evidence_required.join('\n- ') : '-'}

Disclaimer: Not legal advice. Consult a lawyer.
    `;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Nyaya_Summary_${match.title.replace(/\s+/g, '_')}.txt`;
        a.click();
    };

    return (
        <div className="card-premium overflow-hidden transition-all hover:shadow-md border border-[var(--border-color)]">
            {/* Header */}
            <div
                className="p-4 flex justify-between items-start cursor-pointer bg-[var(--bg-secondary)]"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${severityColors[match.severity] || 'bg-gray-100 text-gray-800'}`}>
                            {t(match.severity.toLowerCase())} {t('severity')}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{match.category}</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight mb-1">{match.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{match.description}</p>

                    {/* Immediate Next Step Preview */}
                    {!expanded && match.steps && match.steps.length > 0 && (
                        <div className="mt-3 flex items-start gap-2 text-sm bg-blue-50 dark:bg-gray-800 p-2 rounded-lg border border-blue-100 dark:border-gray-700">
                            <span className="bg-blue-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs flex-shrink-0 mt-0.5">1</span>
                            <span className="text-gray-900 dark:text-white font-medium">{t('next_step')} {match.steps[0]}</span>
                        </div>
                    )}
                </div>
                <button className="text-[var(--text-muted)] mt-1 ml-2">
                    {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            </div>

            {/* Expanded Content */}
            {expanded && (
                <div className="p-4 border-t border-[var(--border-color)] space-y-4 bg-[var(--bg-primary)]">

                    {/* IPC Sections */}
                    <div className="flex items-start gap-2">
                        <Shield className="text-blue-600 mt-0.5" size={18} />
                        <div>
                            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{t('relevant_laws')}</h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {match.ipc_sections && match.ipc_sections.map((sec, idx) => (
                                    <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded border border-blue-100 font-mono">
                                        {sec}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Offense Details Grid */}
                    {(match.offense_nature || match.bail_status || match.court_jurisdiction) && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[var(--bg-tertiary)] p-3 rounded-lg border border-[var(--border-color)]">
                            {match.offense_nature && (
                                <div>
                                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Nature</p>
                                    <p className="text-sm font-semibold text-[var(--text-primary)]">{match.offense_nature}</p>
                                </div>
                            )}
                            {match.bail_status && (
                                <div>
                                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Bail</p>
                                    <p className={`text-sm font-semibold ${match.bail_status.includes('Non') ? 'text-red-500' : 'text-green-500'}`}>
                                        {match.bail_status}
                                    </p>
                                </div>
                            )}
                            {match.court_jurisdiction && (
                                <div>
                                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Court</p>
                                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate" title={match.court_jurisdiction}>
                                        {match.court_jurisdiction}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Steps */}
                    <div>
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">{t('recommended_actions')}</h4>
                        <ul className="space-y-2">
                            {match.steps && match.steps.map((step, idx) => (
                                <li key={idx} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700">
                                    <span className="bg-blue-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs flex-shrink-0 mt-0.5">{idx + 1}</span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Evidence Helper */}
                    <EvidenceHelper checklist={match.evidence_required} />

                    {/* Footer Actions */}
                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={downloadSummary}
                            className="flex-1 flex items-center justify-center gap-2 bg-gray-800 text-white py-2 rounded-lg text-sm hover:bg-gray-900 transition"
                        >
                            <Download size={16} />
                            {t('download_summary')}
                        </button>
                        {/* Template Button could go here */}
                    </div>

                    <div className="text-xs text-center text-gray-400 mt-2">
                        {t('penalty')} {match.penalty || t('consult_lawyer_details')}
                    </div>
                </div>
            )}
        </div>
    );
}
