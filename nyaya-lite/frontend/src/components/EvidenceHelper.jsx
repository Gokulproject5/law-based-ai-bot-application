import React, { useState } from 'react';
import { Camera, Upload, CheckSquare, X } from 'lucide-react';

export default function EvidenceHelper({ checklist }) {
    const [uploads, setUploads] = useState([]);
    const [showCamera, setShowCamera] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            setUploads([...uploads, { name: file.name, url, type: 'file' }]);
        }
    };

    // Mock camera capture (since we can't easily do real webcam in all envs without https)
    const handleCameraCapture = () => {
        alert("Camera feature would open device camera here. (Requires HTTPS/Mobile)");
    };

    const removeUpload = (index) => {
        setUploads(uploads.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <CheckSquare className="text-blue-600" size={20} />
                Evidence Checklist
            </h3>

            <div className="space-y-2">
                {checklist && checklist.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <input type="checkbox" className="mt-1" />
                        <span>{item}</span>
                    </div>
                ))}
                {!checklist && <p className="text-gray-500 text-sm">No specific evidence checklist available.</p>}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Collect Proof</h4>
                <div className="flex gap-2">
                    <button
                        onClick={handleCameraCapture}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-100 text-blue-700 py-2 rounded hover:bg-blue-200 transition"
                    >
                        <Camera size={18} />
                        <span>Camera</span>
                    </button>
                    <label className="flex-1 flex items-center justify-center gap-2 bg-green-100 text-green-700 py-2 rounded hover:bg-green-200 transition cursor-pointer">
                        <Upload size={18} />
                        <span>Upload</span>
                        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf" />
                    </label>
                </div>
            </div>

            {uploads.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                    {uploads.map((u, i) => (
                        <div key={i} className="relative group">
                            <div className="h-16 w-full bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                                {/* Preview logic */}
                                <span className="text-xs text-gray-500 px-1 truncate">{u.name}</span>
                            </div>
                            <button
                                onClick={() => removeUpload(i)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-sm"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-2">
                * Photos/Docs are stored locally in your browser session only.
            </p>
        </div>
    );
}
