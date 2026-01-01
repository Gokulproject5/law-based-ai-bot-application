import React, { useState, useEffect } from 'react';
import { Camera, Upload, CheckSquare, X, FileText, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CameraCapture from './CameraCapture';

export default function EvidenceHelper({ checklist }) {
    const { t } = useTranslation();
    const [uploads, setUploads] = useState([]);
    const [showCamera, setShowCamera] = useState(false);

    // Cleanup object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            uploads.forEach(u => {
                if (u.type === 'file' && u.url) {
                    URL.revokeObjectURL(u.url);
                }
            });
        };
    }, [uploads]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Limit file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("File size exceeds 5MB limit.");
                return;
            }

            const url = URL.createObjectURL(file);
            setUploads(prev => [...prev, { name: file.name, url, type: 'file' }]);
        }
    };

    const handleCameraCapture = (imageData) => {
        setUploads(prev => [...prev, {
            name: `Capture_${new Date().getTime()}.jpg`,
            url: imageData,
            type: 'image'
        }]);
    };

    const removeUpload = (index) => {
        const item = uploads[index];
        if (item.type === 'file') URL.revokeObjectURL(item.url);
        setUploads(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <CheckSquare className="text-blue-600" size={20} />
                {t('evidence_checklist')}
            </h3>

            <div className="space-y-2">
                {checklist && checklist.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <input type="checkbox" className="mt-1" />
                        <span>{item}</span>
                    </div>
                ))}
                {!checklist && <p className="text-gray-500 text-sm">{t('no_evidence_checklist')}</p>}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">{t('collect_proof')}</h4>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowCamera(true)}
                        className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 py-3 rounded-xl hover:bg-indigo-100 transition border border-indigo-100 font-medium"
                    >
                        <Camera size={18} />
                        <span>{t('camera')}</span>
                    </button>
                    <label className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-700 py-3 rounded-xl hover:bg-green-100 transition cursor-pointer border border-green-100 font-medium">
                        <Upload size={18} />
                        <span>{t('upload')}</span>
                        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf" />
                    </label>
                </div>
            </div>

            {showCamera && (
                <CameraCapture
                    onCapture={handleCameraCapture}
                    onClose={() => setShowCamera(false)}
                />
            )}

            {uploads.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                    {uploads.map((u, i) => (
                        <div key={i} className="relative group">
                            <div className="h-20 w-full bg-white dark:bg-gray-700 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 shadow-sm flex items-center justify-center">
                                {u.url.startsWith('data:image') || u.name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                    <img src={u.url} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-1">
                                        <FileText size={16} className="text-gray-400" />
                                        <span className="text-[10px] text-gray-500 px-1 truncate max-w-full">{u.name}</span>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => removeUpload(i)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg border-2 border-white dark:border-gray-800 z-10"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-2">
                {t('local_storage_disclaimer')}
            </p>
        </div>
    );
}

