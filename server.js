const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const app = express();

// ⚠️ IMPORTANT: Create a .env file with your API key like this:
// OPENAI_API_KEY=sk-proj-your-actual-key-here

require('dotenv').config();
const OPENROUTER_API_KEY = process.env.OPENAI_API_KEY;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve static files (your HTML app)
app.use(express.static(path.join(__dirname)));

// Root route - serve ai.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'ai.html'));
});

const OPENROUTER_TEXT_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_IMAGE_URL = 'https://openrouter.ai/api/v1/images/generations';

// Text completions proxy
app.post('/api/chat', async (req, res) => {
    try {
        if (!OPENROUTER_API_KEY) {
            return res.status(500).json({ error: 'API key not configured on server' });
        }

        const response = await fetch(OPENROUTER_TEXT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('OpenAI Error:', data);
            return res.status(response.status).json(data);
        }

        res.json(data);
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Image generation proxy
app.post('/api/image', async (req, res) => {
    try {
        // OpenRouter doesn't support image generation
        // Return a user-friendly error
        return res.status(501).json({ 
            error: 'Image generation not available with OpenRouter',
            message: 'OpenRouter focuses on text models. For image generation, you can:\n1. Use DALL-E directly (requires separate OpenAI key)\n2. Try a different service like Replicate\n3. Use Claude with vision capabilities instead'
        });
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', hasApiKey: !!OPENAI_API_KEY });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 ZXNV AI Server running on http://localhost:${PORT}`);
    console.log(`📝 Make sure .env file exists with OPENAI_API_KEY=your-key-here`);
    console.log(`🌐 Open http://localhost:${PORT} in your browser`);
});
