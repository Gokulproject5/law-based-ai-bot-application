const axios = require('axios');

/**
 * Indian Kanoon API Utility
 * Documentation: https://api.indiankanoon.org/
 */
class IndianKanoonAPI {
    constructor() {
        this.baseURL = 'https://api.indiankanoon.org';
        this.apiKey = process.env.INDIAN_KANOON_API_KEY;
    }

    /**
     * Get headers for the request
     */
    getHeaders() {
        if (!this.apiKey) {
            console.warn('⚠️ INDIAN_KANOON_API_KEY is missing in .env');
        }
        return {
            'Authorization': `Token ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Search for legal documents
     * @param {string} query - The search query
     * @param {number} pagenum - Page number (starts from 0)
     */
    async search(query, pagenum = 0) {
        try {
            const response = await axios.get(`${this.baseURL}/search/`, {
                params: {
                    formInput: query,
                    pagenum: pagenum
                },
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Indian Kanoon Search Error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get a specific document by ID
     * @param {string} docid - The document ID
     */
    async getDocument(docid) {
        try {
            const response = await axios.get(`${this.baseURL}/doc/${docid}/`, {
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Indian Kanoon Document Error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get the original court copy (PDF/HTML)
     * @param {string} docid - The document ID
     */
    async getCourtCopy(docid) {
        try {
            const response = await axios.get(`${this.baseURL}/origdoc/${docid}/`, {
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Indian Kanoon Court Copy Error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get document fragments matching a query
     * @param {string} docid - The document ID
     * @param {string} query - The query to match fragments for
     */
    async getDocumentFragments(docid, query) {
        try {
            const response = await axios.get(`${this.baseURL}/docfragment/${docid}/`, {
                params: {
                    formInput: query
                },
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Indian Kanoon Fragments Error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get metadata for a specific document
     * @param {string} docid - The document ID
     */
    async getDocumentMeta(docid) {
        try {
            const response = await axios.get(`${this.baseURL}/docmeta/${docid}/`, {
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Indian Kanoon Meta Error:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = new IndianKanoonAPI();
