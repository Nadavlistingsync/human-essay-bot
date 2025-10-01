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
    console.log('=== Essay writing API called ===');
    console.log('Request body:', req.body);
    console.log('OpenAI API Key present:', !!process.env.OPENAI_API_KEY);
    
    try {
        const { prompt, settings } = req.body;
        
        if (!prompt) {
            console.error('No prompt provided');
            return res.status(400).json({ success: false, error: 'No prompt provided' });
        }
        
        if (!process.env.OPENAI_API_KEY) {
            console.error('OpenAI API key not found in environment variables');
            return res.status(500).json({ success: false, error: 'OpenAI API key not configured' });
        }
        
        console.log('Creating EssayBot instance...');
        // Create EssayBot instance
        const essayBot = new EssayBot(settings);
        
        console.log('Starting writing process...');
        // Start writing process
        const result = await essayBot.startWriting(prompt, (progress) => {
            console.log(`Writing progress: ${progress.progress}% - ${progress.stage}`);
            // In a real implementation, you'd use WebSockets to send progress updates
        });
        
        console.log('Writing completed successfully');
        res.json({ success: true, result });
        
    } catch (error) {
        console.error('=== Error starting writing ===');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ success: false, error: error.message });
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
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
            try {
                this.isWriting = true;
                console.log(`Attempting to launch browser (attempt ${retryCount + 1}/${maxRetries})...`);
                
                // Launch browser with visible window for real human-like automation
        // Create a browser extension approach that works in current browser
        console.log('🌐 Setting up browser integration...');
        
        // Generate a unique session ID for this writing session
        const sessionId = Math.random().toString(36).substring(7);
        
        // Create instructions for user to open Google Docs in current browser
        const instructions = {
            step1: 'Open a new tab in your current browser',
            step2: 'Go to https://docs.google.com/document/create',
            step3: 'Create a new document',
            step4: 'Copy the document URL from the address bar',
            step5: 'Return to this tab and paste the URL below',
            step6: 'Click "Start Writing Essay" again'
        };
        
        // Store session info for later use
        this.sessionId = sessionId;
        
        return {
            success: true,
            mode: 'browser-integration',
            message: 'Please open Google Docs in a new tab and create a document',
            instructions: instructions,
            sessionId: sessionId,
            googleDocsUrl: 'https://docs.google.com/document/create'
        };

                console.log('Browser launched successfully, creating new page...');
                this.page = await this.browser.newPage();
                console.log('New page created successfully');
                break; // Success, exit retry loop
                
            } catch (error) {
                retryCount++;
                console.error(`Browser launch attempt ${retryCount} failed:`, error.message);
                
                if (this.browser) {
                    try {
                        await this.browser.close();
                    } catch (closeError) {
                        console.error('Error closing browser after failed launch:', closeError);
                    }
                    this.browser = null;
                }
                
                if (retryCount >= maxRetries) {
                    // Try one final attempt with headless mode as fallback
                    if (retryCount === maxRetries) {
                        console.log('Attempting fallback with headless mode...');
                        try {
                            this.browser = await puppeteer.launch({
                                headless: true,
                                executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
                                args: [
                                    '--no-sandbox',
                                    '--disable-setuid-sandbox',
                                    '--disable-dev-shm-usage'
                                ],
                                timeout: 30000
                            });
                            this.page = await this.browser.newPage();
                            console.log('Headless browser launched successfully as fallback');
                            break;
                        } catch (headlessError) {
                            console.log('Headless mode also failed, falling back to essay generation only...');
                            // Fallback: just generate the essay content without browser automation
                            const essayContent = await this.generateEssay(prompt);
                            return { 
                                success: true, 
                                content: essayContent,
                                mode: 'generation-only',
                                message: 'Essay generated successfully. Browser automation failed, but you can copy the content below and paste it into your Google Doc manually.'
                            };
                        }
                    } else {
                        throw new Error(`Failed to launch browser after ${maxRetries} attempts: ${error.message}`);
                    }
                }
                
                console.log(`Retrying in 2 seconds... (${retryCount}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        
        try {
            // Hide automation indicators and make it look more human
            await this.page.evaluateOnNewDocument(() => {
                // Remove webdriver property
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined,
                });
                
                // Add realistic plugins
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [
                        { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
                        { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
                        { name: 'Native Client', filename: 'internal-nacl-plugin' }
                    ],
                });
                
                // Set realistic languages
                Object.defineProperty(navigator, 'languages', {
                    get: () => ['en-US', 'en'],
                });
                
                // Add chrome runtime
                window.chrome = {
                    runtime: {
                        onConnect: undefined,
                        onMessage: undefined
                    },
                };
                
                // Remove automation indicators
                delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
                delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
                delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
            });

            // Set realistic user agent
            await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            
            // Set realistic viewport
            await this.page.setViewport({ width: 1920, height: 1080 });
            
            // Set additional headers to look more legitimate
            await this.page.setExtraHTTPHeaders({
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Upgrade-Insecure-Requests': '1',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
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
            
            // Check if this is a browser connection error
            if (error.message.includes('Target closed') || 
                error.message.includes('Protocol error') || 
                error.message.includes('socket hang up') ||
                error.message.includes('ECONNRESET')) {
                
                console.log('🔧 Browser connection failed, falling back to essay generation only...');
                
                if (this.browser) {
                    try {
                        await this.browser.close();
                    } catch (closeError) {
                        console.error('Error closing browser:', closeError);
                    }
                }
                
                // Generate essay content without browser automation
                console.log('📝 Generating essay content...');
                const essayContent = await this.generateEssay(prompt);
                console.log('✅ Essay generated successfully!');
                
                return { 
                    success: true, 
                    content: essayContent,
                    mode: 'generation-only',
                    message: 'Essay generated successfully! Browser automation failed, but you can copy the content below and paste it into your Google Doc manually.'
                };
            }
            
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
        console.log('🌐 Opening Google first...');
        
        // Navigate to Google first (more natural)
        await this.page.goto('https://www.google.com', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });

        // Add human-like delay
        await this.page.waitForTimeout(3000);

        console.log('🔗 Navigating to Google Docs...');
        
        // Navigate to Google Docs
        await this.page.goto('https://docs.google.com', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });

        // Add human-like delay
        await this.page.waitForTimeout(2000);

        console.log('👤 Waiting for you to log in to Google...');
        console.log('📝 Please log in to your Google account in the browser window');
        console.log('💡 If you see a security warning, try refreshing the page or using a different Google account');
        
        // Wait for user to be logged in
        await this.waitForLogin();
        
        console.log('✅ Login detected! Navigating to document...');
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
        console.log('✍️ Starting to type essay like a human...');
        console.log('📊 Essay content length:', content.length);
        
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        let typedCharacters = 0;
        const totalCharacters = content.length;

        console.log('📝 Number of sentences to type:', sentences.length);

        for (let i = 0; i < sentences.length && this.isWriting; i++) {
            const sentence = sentences[i].trim() + (i < sentences.length - 1 ? '.' : '');
            
            console.log(`⌨️ Typing sentence ${i + 1}/${sentences.length}: "${sentence.substring(0, 50)}..."`);
            
            // Type the sentence with human-like patterns
            await this.humanTyping.typeText(this.page, sentence);
            
            // Add natural pause after sentence (like a human thinking)
            const pauseTime = Math.random() * 3000 + 1000; // 1-4 seconds
            console.log(`⏸️ Pausing for ${Math.round(pauseTime/1000)}s (thinking...)`);
            await this.humanTyping.randomDelay(pauseTime, pauseTime + 500);
            
            typedCharacters += sentence.length;
            const progress = Math.min(75 + (typedCharacters / totalCharacters) * 25, 95);
            
            progressCallback({ 
                stage: 'typing', 
                progress: Math.round(progress),
                currentSentence: sentence.substring(0, 50) + '...'
            });
        }
        
        console.log('🎉 Finished typing essay! It should look like a human wrote it!');
    }
}

// Simple essay generation endpoint (no browser automation)
app.post('/api/generate-essay-simple', async (req, res) => {
    console.log('Simple essay generation requested:', req.body);
    
    try {
        const { prompt, settings } = req.body;
        
        if (!prompt) {
            return res.json({ success: false, error: 'No prompt provided' });
        }

        if (!process.env.OPENAI_API_KEY) {
            return res.json({ success: false, error: 'OpenAI API key not configured' });
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        const systemPrompt = `You are a helpful assistant that writes academic essays. Write in a natural, human-like style with the following characteristics:
- Use varied sentence lengths and structures
- Include natural transitions between ideas
- Write in a conversational yet academic tone
- Use appropriate vocabulary for the topic
- Include some personal insights or examples where relevant
- Write in a way that sounds like a real student wrote it`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            max_tokens: 2000,
            temperature: 0.7
        });

        const content = completion.choices[0].message.content;
        res.json({ 
            success: true, 
            content,
            mode: 'generation-only',
            message: 'Essay generated successfully! Copy the content below and paste it into your Google Doc.'
        });
        
    } catch (error) {
        console.error('Error generating essay:', error);
        res.json({ success: false, error: error.message });
    }
});

// Essay generation endpoint for browser extension
app.post('/api/generate-essay', async (req, res) => {
    console.log('Generating essay for browser extension:', req.body);
    
    try {
        const { prompt, settings } = req.body;
        
        if (!prompt) {
            return res.json({ success: false, error: 'No prompt provided' });
        }

        // Create a simple essay generator
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        const systemPrompt = `You are a helpful assistant that writes academic essays. Write in a natural, human-like style with the following characteristics:
- Use varied sentence lengths and structures
- Include natural transitions between ideas
- Write in a conversational yet academic tone
- Use appropriate vocabulary for the topic
- Include some personal insights or examples where relevant
- Write in a way that sounds like a real student wrote it`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            max_tokens: 2000,
            temperature: 0.7
        });

        const content = completion.choices[0].message.content;
        res.json({ success: true, content });
        
    } catch (error) {
        console.error('Error generating essay:', error);
        res.json({ success: false, error: error.message });
    }
});

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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        openaiConfigured: !!process.env.OPENAI_API_KEY
    });
});

// Test OpenAI connection endpoint
app.get('/api/test-openai', async (req, res) => {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ 
                success: false, 
                error: 'OpenAI API key not configured' 
            });
        }
        
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: "Hello, this is a test." }],
            max_tokens: 10
        });
        
        res.json({ 
            success: true, 
            message: 'OpenAI connection successful',
            response: completion.choices[0].message.content
        });
    } catch (error) {
        console.error('OpenAI test error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log('=== Human Essay Bot Web App Starting ===');
    console.log(`🌐 Server running at http://localhost:${PORT}`);
    console.log(`📝 Main interface: http://localhost:${PORT}/electron`);
    console.log(`🔧 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🧪 OpenAI test: http://localhost:${PORT}/api/test-openai`);
    console.log(`🔑 OpenAI API Key configured: ${!!process.env.OPENAI_API_KEY}`);
    console.log('🚀 Ready for students to use!');
    console.log('==========================================');
});
