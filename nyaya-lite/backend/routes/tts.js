const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * GET /api/tts
 * Proxy for Google Translate TTS to avoid CORS restrictions in the browser.
 *
 * Query params:
 *   text  – the text to speak (max 200 chars per chunk)
 *   lang  – BCP-47 language code short form: 'ta', 'hi', 'en'
 *   speed – (optional) 0.0–1.0, default 0.9
 */
router.get('/tts', async (req, res) => {
    const { text, lang = 'ta', speed = '0.9' } = req.query;

    if (!text || !text.trim()) {
        return res.status(400).json({ error: 'text is required' });
    }
    if (text.length > 250) {
        return res.status(400).json({ error: 'text exceeds 250 character limit per chunk' });
    }

    const allowedLangs = ['ta', 'hi', 'en', 'te', 'kn', 'ml', 'bn'];
    if (!allowedLangs.includes(lang)) {
        return res.status(400).json({ error: 'unsupported language' });
    }

    const googleUrl = 'https://translate.google.com/translate_tts';
    const params = {
        ie: 'UTF-8',
        q: text.trim(),
        tl: lang,
        client: 'tw-ob',
        ttsspeed: speed
    };

    try {
        const response = await axios.get(googleUrl, {
            params,
            responseType: 'stream',
            headers: {
                // Mimic a real browser request so Google doesn't block it
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Referer': 'https://translate.google.com/',
                'Accept': 'audio/webm,audio/ogg,audio/wav,audio/*;q=0.9,application/ogg;q=0.7,video/*;q=0.6,*/*;q=0.5',
                'Accept-Language': 'en-US,en;q=0.5',
            },
            timeout: 10000
        });

        // Forward the audio stream to the frontend
        res.setHeader('Content-Type', response.headers['content-type'] || 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=3600'); // cache for 1 hr
        res.setHeader('Access-Control-Allow-Origin', '*');
        // Required: overrides Helmet's default 'same-origin' CORP policy so the
        // browser can load this audio cross-origin (localhost:5000 → localhost:5173)
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        response.data.pipe(res);

    } catch (err) {
        console.error('TTS proxy error:', err.message);
        res.status(502).json({ error: 'TTS service unavailable', detail: err.message });
    }
});

module.exports = router;
