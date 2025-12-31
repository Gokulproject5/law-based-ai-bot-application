import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export function useLegalAnalysis() {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const analyzeText = async (text) => {
        if (!text || !text.trim()) {
            toast.error("Please enter or speak your legal issue.");
            return;
        }

        setLoading(true);
        setResults(null);
        setError(null);

        // Show loading toast if it takes a while, but for now we rely on UI skeleton

        try {
            const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');
            const r = await axios.post(`${API_URL}/api/analyze`, { text });

            if (r.data.error) {
                setError(r.data.error);
                toast.error(r.data.error);
            } else {
                setResults(r.data);
                // Optional: toast.success("Analysis Complete"); 
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

    return { results, loading, error, analyzeText };
}
