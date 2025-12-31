import React, { useState } from 'react';
import axios from 'axios';

export default function AdminView() {
    const [form, setForm] = useState({
        title: '',
        category: '',
        description: '',
        ipc_sections: '',
        severity: 'Medium'
    });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Note: You need to implement POST /api/laws in backend for this to work fully
            // For now, this is a UI shell as per "Admin Features (Later)"
            alert("Admin API endpoint not yet fully secured/implemented. This is a UI demo.");
            // await axios.post('http://localhost:5000/api/laws', form);
            setMessage('Law added successfully (Demo)!');
            setForm({ title: '', category: '', description: '', ipc_sections: '', severity: 'Medium' });
        } catch (err) {
            setMessage('Error adding law.');
        }
    };

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
            <p className="text-sm text-gray-500">Add new legal scenarios to the database.</p>

            {message && <div className="p-2 bg-green-100 text-green-700 rounded">{message}</div>}

            <form onSubmit={handleSubmit} className="space-y-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <label className="block text-xs font-medium text-gray-500">Title</label>
                    <input name="title" value={form.title} onChange={handleChange} className="w-full p-2 border rounded" required />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500">Category</label>
                    <input name="category" value={form.category} onChange={handleChange} className="w-full p-2 border rounded" required />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500">IPC Sections (comma separated)</label>
                    <input name="ipc_sections" value={form.ipc_sections} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500">Severity</label>
                    <select name="severity" value={form.severity} onChange={handleChange} className="w-full p-2 border rounded">
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Emergency</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500">Description</label>
                    <textarea name="description" value={form.description} onChange={handleChange} className="w-full p-2 border rounded" rows={3} />
                </div>
                <button type="submit" className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900">Add Law</button>
            </form>
        </div>
    );
}
