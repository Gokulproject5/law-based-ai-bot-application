import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CameraCapture({ onCapture, onClose }) {
    const { t } = useTranslation();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        startCamera();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startCamera = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const constraints = {
                video: { facingMode: 'environment' },
                audio: false
            };
            const newStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(newStream);
            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
            }
            setIsLoading(false);
        } catch (err) {
            console.error("Camera access error:", err);
            setError(err.message || "Could not access camera");
            setIsLoading(false);
        }
    };

    const takePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL('image/jpeg');
        onCapture(imageData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-md aspect-[3/4] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3">
                        <RefreshCw className="animate-spin" size={32} />
                        <p className="text-sm font-medium">Initializing Camera...</p>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 p-8 text-center gap-4">
                        <p className="text-sm font-bold">Camera Access Denied</p>
                        <p className="text-xs opacity-80">{error}</p>
                        <button
                            onClick={startCamera}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs transition"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className={`w-full h-full object-cover ${isLoading || error ? 'hidden' : 'block'}`}
                />

                <canvas ref={canvasRef} className="hidden" />

                {/* Controls overlay */}
                {!isLoading && !error && (
                    <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-8">
                        <button
                            onClick={takePhoto}
                            className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/20 hover:bg-white/40 active:scale-95 transition-all shadow-lg"
                        >
                            <div className="w-12 h-12 bg-white rounded-full"></div>
                        </button>
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="mt-6 text-white text-center">
                <p className="text-xs opacity-60">Place your document or evidence inside the frame</p>
            </div>
        </div>
    );
}
