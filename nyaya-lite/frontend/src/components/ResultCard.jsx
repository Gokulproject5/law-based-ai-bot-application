import React, { useState } from 'react';
import { AlertTriangle, Shield, FileText, ChevronDown, ChevronUp, Download } from 'lucide-react';
import EvidenceHelper from './EvidenceHelper';

export default function ResultCard({ match }) {
    const [expanded, setExpanded] = useState(false);

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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
            {/* Header */}
            <div
                className="p-4 flex justify-between items-start cursor-pointer bg-gray-50"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${severityColors[match.severity] || 'bg-gray-100 text-gray-800'}`}>
                            {match.severity} Severity
                        </span>
                        <span className="text-xs text-gray-500">{match.category}</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 leading-tight">{match.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{match.description}</p>
                </div>
                <button className="text-gray-400 mt-1">
                    {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            </div>

            {/* Expanded Content */}
            {expanded && (
                <div className="p-4 border-t border-gray-100 space-y-4">

                    {/* IPC Sections */}
                    <div className="flex items-start gap-2">
                        <Shield className="text-blue-600 mt-0.5" size={18} />
                        <div>
                            <h4 className="font-semibold text-sm text-gray-800">Relevant Laws (IPC/Acts)</h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {match.ipc_sections && match.ipc_sections.map((sec, idx) => (
                                    <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded border border-blue-100 font-mono">
                                        {sec}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action Steps */}
                    <div>
                        <h4 className="font-semibold text-sm text-gray-800 mb-2">Recommended Actions</h4>
                        <ul className="space-y-2">
                            {match.steps && match.steps.map((step, idx) => (
                                <li key={idx} className="flex gap-2 text-sm text-gray-700 bg-white p-2 rounded border border-gray-100 shadow-sm">
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
                            Download Summary
                        </button>
                        {/* Template Button could go here */}
                    </div>

                    <div className="text-xs text-center text-gray-400 mt-2">
                        Penalty: {match.penalty || "Consult a lawyer for details."}
                    </div>
                </div>
            )}
        </div>
    );
}
