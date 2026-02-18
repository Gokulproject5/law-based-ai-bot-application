import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Generate a unique session ID for this browser session
const generateSessionId = () => {
    let sessionId = sessionStorage.getItem('nyaya_session_id');
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('nyaya_session_id', sessionId);
    }
    return sessionId;
};

export function useLegalAnalysis() {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sessionId] = useState(generateSessionId());

    const analyzeText = async (text, retryCount = 0) => {
        if (!text || !text.trim()) {
            toast.error("Please enter or speak your legal issue.");
            return;
        }

        setLoading(true);
        // Don't reset results immediately to prevent flashing, optional
        // setResults(null); 
        setError(null);

        try {
            const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

            const r = await axios.post(`${API_URL}/api/analyze`, {
                text,
                sessionId // Include session ID for context
            }, {
                timeout: 60000 // 60s timeout for AI analysis
            });

            if (r.data.error) {
                throw new Error(r.data.error);
            } else {
                setResults(r.data);
                // toast.success("Analysis complete!"); // Optional, maybe too noisy
            }
        } catch (e) {
            console.error(e);
            let errorMsg = 'Server connection failed.';

            if (e.code === 'ECONNABORTED') {
                errorMsg = 'Request timed out. The AI is thinking hard!';
            } else if (e.response) {
                if (e.response.status === 429) {
                    errorMsg = 'Too many requests. Please wait a moment.';
                } else if (e.response.status === 503 || e.response.status === 504) {
                    errorMsg = 'Server is busy. logic retrying...';
                    // Retry once
                    if (retryCount < 1) {
                        console.log('Retrying request...');
                        setTimeout(() => analyzeText(text, retryCount + 1), 2000);
                        return;
                    }
                } else if (e.response.data && e.response.data.error) {
                    errorMsg = e.response.data.error;
                }
            }

            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            if (retryCount === 0) setLoading(false);
        }
    };

    // Clear session when component unmounts
    const clearSession = () => {
        sessionStorage.removeItem('nyaya_session_id');
    };

    return {
        results,
        loading,
        error,
        analyzeText,
        sessionId,
        clearSession
    };
}
