import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function AdminView() {
    const { t } = useTranslation();
    const [form, setForm] = useState({
        title: '',
        category: '',
        description: '',
        ipc_sections: '',
        severity: 'Medium'
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/laws`, form);
            setMessage(t('law_added_success'));
            setForm({ title: '', category: '', description: '', ipc_sections: '', severity: 'Medium' });
        } catch (err) {
            setMessage(t('error_adding_law'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">{t('admin_dashboard')}</h2>
            <p className="text-sm text-gray-500">{t('admin_desc')}</p>

            {message && <div className="p-2 bg-green-100 text-green-700 rounded">{message}</div>}

            <form onSubmit={handleSubmit} className="space-y-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <label className="block text-xs font-medium text-gray-500">{t('name')}</label>
                    <input name="title" value={form.title} onChange={handleChange} className="w-full p-2 border rounded" required />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500">{t('legal_categories')}</label>
                    <input name="category" value={form.category} onChange={handleChange} className="w-full p-2 border rounded" required />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500">{t('ipc_sections_label')}</label>
                    <input name="ipc_sections" value={form.ipc_sections} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500">{t('severity')}</label>
                    <select name="severity" value={form.severity} onChange={handleChange} className="w-full p-2 border rounded">
                        <option value="Low">{t('low')}</option>
                        <option value="Medium">{t('medium')}</option>
                        <option value="High">{t('high')}</option>
                        <option value="Emergency">{t('emergency')}</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500">{t('description_incident')}</label>
                    <textarea name="description" value={form.description} onChange={handleChange} className="w-full p-2 border rounded" rows={3} />
                </div>
                <button type="submit" className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 disabled:opacity-50" disabled={loading}>
                    {loading ? t('searching') : t('add_law')}
                </button>
            </form>
        </div>
    );
}

