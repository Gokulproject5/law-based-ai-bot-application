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

    const analyzeText = async (text) => {
        if (!text || !text.trim()) {
            toast.error("Please enter or speak your legal issue.");
            return;
        }

        setLoading(true);
        setResults(null);
        setError(null);

        try {
            const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

            const r = await axios.post(`${API_URL}/api/analyze`, {
                text,
                sessionId // Include session ID for context
            });

            if (r.data.error) {
                setError(r.data.error);
                toast.error(r.data.error);
            } else {
                setResults(r.data);

                // Show success toast with context
                if (r.data.isFollowUp) {
                    toast.success("Follow-up analyzed!");
                } else if (r.data.source === 'Gemini AI') {
                    toast.success("AI analysis complete!");
                } else {
                    toast.success("Analysis complete!");
                }
            }
        } catch (e) {
            console.error(e);
            let errorMsg = 'Server connection failed. Is the backend running?';
            if (e.response && e.response.data && e.response.data.error) {
                errorMsg = e.response.data.error;
            }
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
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
