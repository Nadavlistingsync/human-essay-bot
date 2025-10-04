// Content script for EssayForge Chrome Extension
class GoogleDocsEssayWriter {
    constructor() {
        this.isWriting = false;
        this.currentText = '';
        this.typingSpeed = 'medium';
        this.essayLength = 'medium';
        this.apiKey = '';
        this.setupMessageListener();
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'startWriting') {
                this.startWriting(message.data);
            } else if (message.action === 'stopWriting') {
                this.stopWriting();
            }
        });
    }

    async startWriting(data) {
        if (this.isWriting) return;

        this.isWriting = true;
        this.typingSpeed = data.settings.typingSpeed;
        this.essayLength = data.settings.essayLength;
        this.apiKey = data.settings.apiKey;

        try {
            // Send progress update
            this.sendProgressUpdate(10, 'Generating essay content...');

            // Generate essay content using OpenAI
            const essayContent = await this.generateEssay(data.prompt);
            
            this.sendProgressUpdate(30, 'Essay generated, starting to type...');

            // Find the Google Docs editor
            const editor = this.findGoogleDocsEditor();
            if (!editor) {
                throw new Error('Could not find Google Docs editor');
            }

            this.sendProgressUpdate(50, 'Typing essay...');

            // Type the essay content
            await this.typeEssay(editor, essayContent);

            this.sendProgressUpdate(100, 'Essay completed!');
            this.sendMessage('complete', { success: true });

        } catch (error) {
            console.error('Error writing essay:', error);
            this.sendMessage('error', { error: error.message });
        } finally {
            this.isWriting = false;
        }
    }

    async generateEssay(prompt) {
        const lengthMap = {
            'short': '300-500 words',
            'medium': '500-800 words',
            'long': '800-1200 words'
        };

        const systemPrompt = `You are an expert essay writer. Write a well-structured essay based on the given prompt. The essay should be approximately ${lengthMap[this.essayLength]}. Make sure to include:
1. A clear introduction with a thesis statement
2. Well-developed body paragraphs with supporting evidence
3. A strong conclusion that reinforces the main points
4. Proper transitions between paragraphs
5. Academic tone and style

Write the essay content only, without any meta-commentary or instructions.`;

        // Get API key from storage
        const { apiKey } = await chrome.storage.sync.get('apiKey');
        
        if (!apiKey) {
            throw new Error('API key not configured. Please set your OpenAI API key in the extension popup.');
        }

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: 2000,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content.trim();
        } catch (error) {
            console.error('Error generating essay:', error);
            throw new Error('Failed to generate essay: ' + error.message);
        }
    }

    findGoogleDocsEditor() {
        // Try multiple selectors to find the Google Docs editor
        const selectors = [
            '[contenteditable="true"]',
            '.kix-appview-editor',
            '[role="textbox"]',
            '.docs-texteventtarget-iframe'
        ];

        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                return element;
            }
        }

        // If not found, try to find it in iframes
        const iframes = document.querySelectorAll('iframe');
        for (const iframe of iframes) {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                for (const selector of selectors) {
                    const element = iframeDoc.querySelector(selector);
                    if (element) {
                        return element;
                    }
                }
            } catch (e) {
                // Cross-origin iframe, skip
                continue;
            }
        }

        return null;
    }

    async typeEssay(editor, content) {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        let totalSentences = sentences.length;
        let currentSentence = 0;

        for (const sentence of sentences) {
            if (!this.isWriting) break;

            const cleanSentence = sentence.trim() + '. ';
            await this.typeText(editor, cleanSentence);
            
            currentSentence++;
            const progress = 50 + (currentSentence / totalSentences) * 40; // 50-90%
            this.sendProgressUpdate(progress, `Typing sentence ${currentSentence} of ${totalSentences}...`);
            
            // Add a realistic pause between sentences (longer than character delays)
            const sentenceDelay = this.getTypingDelay('sentence') * 3; // 3x longer than normal
            await this.delay(sentenceDelay);
        }
    }

    async typeText(element, text) {
        // Focus the element
        element.focus();
        
        // Clear any existing selection
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        }

        for (let i = 0; i < text.length; i++) {
            if (!this.isWriting) break;

            const char = text[i];
            
            // Simulate typing the character
            this.simulateTyping(element, char);
            
            // Add delay between characters
            await this.delay(this.getTypingDelay(char));
        }
    }

    simulateTyping(element, char) {
        // Focus the element first
        element.focus();
        
        // Try to insert text using execCommand (works better with Google Docs)
        try {
            document.execCommand('insertText', false, char);
        } catch (e) {
            // Fallback: dispatch keyboard events
            const keydownEvent = new KeyboardEvent('keydown', {
                key: char,
                code: this.getKeyCode(char),
                keyCode: char.charCodeAt(0),
                which: char.charCodeAt(0),
                bubbles: true,
                cancelable: true,
                composed: true
            });

            const keypressEvent = new KeyboardEvent('keypress', {
                key: char,
                code: this.getKeyCode(char),
                keyCode: char.charCodeAt(0),
                which: char.charCodeAt(0),
                bubbles: true,
                cancelable: true,
                composed: true
            });

            const keyupEvent = new KeyboardEvent('keyup', {
                key: char,
                code: this.getKeyCode(char),
                keyCode: char.charCodeAt(0),
                which: char.charCodeAt(0),
                bubbles: true,
                cancelable: true,
                composed: true
            });

            const inputEvent = new InputEvent('input', {
                data: char,
                inputType: 'insertText',
                bubbles: true,
                cancelable: false,
                composed: true
            });

            const beforeInputEvent = new InputEvent('beforeinput', {
                data: char,
                inputType: 'insertText',
                bubbles: true,
                cancelable: true,
                composed: true
            });

            // Dispatch events in the correct order
            element.dispatchEvent(keydownEvent);
            element.dispatchEvent(beforeInputEvent);
            element.dispatchEvent(keypressEvent);
            element.dispatchEvent(inputEvent);
            element.dispatchEvent(keyupEvent);
        }
    }

    getKeyCode(char) {
        if (char === ' ') return 'Space';
        if (char === '.') return 'Period';
        if (char === ',') return 'Comma';
        if (char === '!') return 'Exclamation';
        if (char === '?') return 'Question';
        return `Key${char.toUpperCase()}`;
    }

    getTypingDelay(char) {
        const speedMap = {
            'slow': { min: 200, max: 400 },
            'medium': { min: 120, max: 250 },
            'fast': { min: 80, max: 150 }
        };

        const speed = speedMap[this.typingSpeed] || speedMap['medium'];
        let baseDelay = Math.random() * (speed.max - speed.min) + speed.min;

        // Adjust delay based on character type
        if (char === ' ') {
            baseDelay *= 0.7; // Faster for spaces
        } else if (char === '.' || char === '!' || char === '?') {
            baseDelay *= 2.0; // Longer pause after sentences
        } else if (char === ',' || char === ';' || char === ':') {
            baseDelay *= 1.5; // Medium pause after commas
        } else if (char.match(/[A-Z]/)) {
            baseDelay *= 1.3; // Slightly longer for capitals
        } else if (char.match(/[0-9]/)) {
            baseDelay *= 1.2; // Numbers take a bit longer
        }

        // Add occasional longer pauses (thinking pauses)
        if (Math.random() < 0.08) {
            baseDelay += Math.random() * 800 + 200; // 200-1000ms thinking pause
        }

        // Add micro-pauses for more realistic typing
        if (Math.random() < 0.15) {
            baseDelay += Math.random() * 50 + 10; // 10-60ms micro-pause
        }

        return Math.max(baseDelay, 50); // Minimum 50ms delay
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    stopWriting() {
        this.isWriting = false;
        this.sendMessage('stopped', { message: 'Writing stopped by user' });
    }

    sendProgressUpdate(progress, text) {
        this.sendMessage('progress', { progress, text });
    }

    sendMessage(type, data) {
        chrome.runtime.sendMessage({
            type: type,
            ...data
        });
    }
}

// Initialize the essay writer when the script loads
const essayWriter = new GoogleDocsEssayWriter();
