// Simple web version for immediate testing
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static('src'));
app.use(express.json());

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Mock API endpoints for testing
app.post('/api/start-writing', (req, res) => {
    console.log('Essay writing started:', req.body);
    
    // Simulate progress updates
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        
        // Mock progress update
        console.log(`Writing progress: ${progress}%`);
        
        if (progress >= 100) {
            clearInterval(interval);
            res.json({ success: true, message: 'Essay completed! (Demo mode)' });
        }
    }, 1000);
});

app.post('/api/analyze-style', (req, res) => {
    console.log('Analyzing writing style...');
    
    // Mock style analysis
    setTimeout(() => {
        res.json({
            success: true,
            style: {
                formality: 'formal',
                averageSentenceLength: 12,
                vocabularyRichness: 0.85,
                description: 'Formal, academic writing style with varied vocabulary.'
            }
        });
    }, 2000);
});

app.listen(PORT, () => {
    console.log(`🌐 Human Essay Bot Web Version running at http://localhost:${PORT}`);
    console.log('📝 Open this URL in your browser to test the interface!');
    console.log('⚠️  Note: This is a demo version - full functionality requires Electron');
});
