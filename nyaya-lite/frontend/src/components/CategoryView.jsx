import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ResultCard from './ResultCard';
import { ChevronRight, ArrowLeft } from 'lucide-react';

export default function CategoryView() {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [laws, setLaws] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch categories on mount
        axios.get('http://localhost:5000/api/categories')
            .then(res => setCategories(res.data))
            .catch(err => console.error(err));
    }, []);

    const handleCategoryClick = async (category) => {
        setSelectedCategory(category);
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/laws?category=${encodeURIComponent(category)}`);
            setLaws(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                {selectedCategory && (
                    <button onClick={() => setSelectedCategory(null)} className="p-1 hover:bg-gray-100 rounded-full">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                )}
                <h2 className="text-2xl font-bold text-gray-800">
                    {selectedCategory || 'Legal Categories'}
                </h2>
            </div>

            {!selectedCategory ? (
                <div className="grid grid-cols-1 gap-3">
                    {categories.map((cat, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleCategoryClick(cat)}
                            className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition shadow-sm text-left"
                        >
                            <span className="font-medium text-gray-700">{cat}</span>
                            <ChevronRight size={20} className="text-gray-400" />
                        </button>
                    ))}
                    {categories.length === 0 && <div className="text-center text-gray-500">Loading categories...</div>}
                </div>
            ) : (
                <div className="space-y-4">
                    {loading && <div className="text-center text-blue-600 animate-pulse">Loading laws...</div>}
                    {!loading && laws.map((law, idx) => (
                        <ResultCard key={idx} match={law} />
                    ))}
                    {!loading && laws.length === 0 && (
                        <div className="text-center text-gray-500">No laws found in this category.</div>
                    )}
                </div>
            )}
        </div>
    );
}
