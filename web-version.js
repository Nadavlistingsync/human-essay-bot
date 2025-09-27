// Full web app version for students
require('dotenv').config();
const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer');
const OpenAI = require('openai');
const { HumanTyping } = require('./src/HumanTyping');
const { WritingStyleAnalyzer } = require('./src/WritingStyleAnalyzer');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('src'));
app.use(express.json());

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'inject.html'));
});

// Serve the original Electron-style interface
app.get('/electron', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Serve the browser extension script
app.get('/browser-extension.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'browser-extension.js'));
});

// Real API endpoints for essay writing
app.post('/api/start-writing', async (req, res) => {
    console.log('Essay writing started:', req.body);
    
    try {
        const { prompt, settings } = req.body;
        
        // Create EssayBot instance
        const essayBot = new EssayBot(settings);
        
        // Start writing process
        const result = await essayBot.startWriting(prompt, (progress) => {
            console.log(`Writing progress: ${progress.progress}% - ${progress.stage}`);
            // In a real implementation, you'd use WebSockets to send progress updates
        });
        
        res.json({ success: true, result });
        
    } catch (error) {
        console.error('Error starting writing:', error);
        res.json({ success: false, error: error.message });
    }
});

// EssayBot class for web version
class EssayBot {
    constructor(settings = {}) {
        this.settings = {
            typingSpeed: settings.typingSpeed || 'human-like',
            writingStyle: settings.writingStyle || null,
            openaiApiKey: process.env.OPENAI_API_KEY,
            documentUrl: settings.documentUrl || null,
            ...settings
        };
        
        this.browser = null;
        this.page = null;
        this.isWriting = false;
        this.humanTyping = new HumanTyping(this.settings);
        
        if (this.settings.openaiApiKey) {
            this.openai = new OpenAI({
                apiKey: this.settings.openaiApiKey
            });
        }
    }

    async startWriting(prompt, progressCallback) {
        try {
            this.isWriting = true;
            
            // Launch browser
            this.browser = await puppeteer.launch({
                headless: false, // Show browser so user can log in
                defaultViewport: null,
                args: [
                    '--start-maximized',
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-blink-features=AutomationControlled',
                    '--disable-notifications'
                ]
            });

            this.page = await this.browser.newPage();
            
            // Hide automation indicators
            await this.page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined,
                });
            });

            progressCallback({ stage: 'launching', progress: 10 });

            // Navigate to Google Docs
            await this.navigateToGoogleDocs();
            progressCallback({ stage: 'navigating', progress: 25 });

            // Generate essay content
            const essayContent = await this.generateEssay(prompt);
            progressCallback({ stage: 'generating', progress: 50 });

            // Start typing the essay
            await this.typeEssay(essayContent, progressCallback);
            progressCallback({ stage: 'completed', progress: 100 });

            await this.browser.close();
            return { success: true, content: essayContent };

        } catch (error) {
            console.error('Error in startWriting:', error);
            console.error('Error details:', error.message);
            console.error('Stack trace:', error.stack);
            if (this.browser) {
                try {
                    await this.browser.close();
                } catch (closeError) {
                    console.error('Error closing browser:', closeError);
                }
            }
            throw error;
        }
    }

    async navigateToGoogleDocs() {
        console.log('Navigating to Google Docs...');
        // Navigate to Google Docs
        await this.page.goto('https://docs.google.com', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });

        console.log('Waiting for user login...');
        // Wait for user to be logged in
        await this.waitForLogin();
        
        console.log('Navigating to document...');
        // Navigate to document
        await this.navigateToDocument();
    }

    async waitForLogin() {
        console.log('Waiting for user to log in to Google...');
        console.log('Please log in to your Google account in the browser window that opened.');
        
        // Wait for user to manually log in
        await this.page.waitForFunction(() => {
            return document.querySelector('[data-testid="user-profile-menu"]') || 
                   document.querySelector('[aria-label*="Account"]') ||
                   document.querySelector('.gb_Dd') ||
                   document.querySelector('[data-email]') ||
                   document.querySelector('img[src*="googleusercontent.com"]');
        }, { timeout: 120000 });
        
        console.log('User is logged in, proceeding...');
    }

    async navigateToDocument() {
        if (this.settings.documentUrl) {
            console.log('Navigating to specific document...');
            await this.page.goto(this.settings.documentUrl, { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });
            
            await this.page.waitForSelector('[contenteditable="true"]', { timeout: 15000 });
            await this.page.click('[contenteditable="true"]');
            await this.page.waitForTimeout(1000);
        } else {
            await this.createNewDocument();
        }
    }

    async createNewDocument() {
        await this.humanTyping.clickElement(this.page, '[data-testid="new-document-button"]', { 
            fallback: 'button[aria-label*="Blank"]',
            timeout: 10000 
        });

        await this.page.waitForSelector('[contenteditable="true"]', { timeout: 15000 });
        await this.page.click('[contenteditable="true"]');
        await this.page.waitForTimeout(1000);
    }

    async generateEssay(prompt) {
        if (!this.openai) {
            throw new Error('OpenAI API key not provided');
        }

        const systemPrompt = this.buildSystemPrompt();
        
        const completion = await this.openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            max_tokens: 2000,
            temperature: 0.7
        });

        return completion.choices[0].message.content;
    }

    buildSystemPrompt() {
        let prompt = `You are an expert essay writer. Write in a natural, human-like style with the following characteristics:
- Use varied sentence lengths and structures
- Include natural transitions between ideas
- Write in a conversational yet academic tone
- Use appropriate vocabulary for the topic
- Include some personal insights or examples where relevant
- Write in a way that sounds like a real student wrote it`;

        if (this.settings.writingStyle) {
            prompt += `\n\nWrite in the following style based on the user's past writings:
${JSON.stringify(this.settings.writingStyle, null, 2)}`;
        }

        return prompt;
    }

    async typeEssay(content, progressCallback) {
        console.log('Starting to type essay...');
        console.log('Essay content length:', content.length);
        
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        let typedCharacters = 0;
        const totalCharacters = content.length;

        console.log('Number of sentences to type:', sentences.length);

        for (let i = 0; i < sentences.length && this.isWriting; i++) {
            const sentence = sentences[i].trim() + (i < sentences.length - 1 ? '.' : '');
            
            console.log(`Typing sentence ${i + 1}/${sentences.length}: "${sentence.substring(0, 50)}..."`);
            
            // Type the sentence with human-like patterns
            await this.humanTyping.typeText(this.page, sentence);
            
            // Add natural pause after sentence
            await this.humanTyping.randomDelay(500, 2000);
            
            typedCharacters += sentence.length;
            const progress = Math.min(75 + (typedCharacters / totalCharacters) * 25, 95);
            
            progressCallback({ 
                stage: 'typing', 
                progress: Math.round(progress),
                currentSentence: sentence.substring(0, 50) + '...'
            });
        }
        
        console.log('Finished typing essay!');
    }
}

// Real style analysis endpoint
app.post('/api/analyze-style', async (req, res) => {
    console.log('Analyzing writing style...');
    
    try {
        const { filePath } = req.body;
        
        // For web version, we'll analyze text content directly
        if (req.body.textContent) {
            const analyzer = new WritingStyleAnalyzer();
            const style = await analyzer.analyzeText(req.body.textContent);
            res.json({ success: true, style });
        } else {
            res.json({ success: false, error: 'No text content provided for analysis' });
        }
        
    } catch (error) {
        console.error('Error analyzing writing style:', error);
        res.json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🌐 Human Essay Bot Web App running at http://localhost:${PORT}`);
    console.log('📝 Open this URL in your browser to start writing essays!');
    console.log('🚀 Full functionality available - ready for students to use!');
});
