// Browser extension/bookmarklet for Human Essay Bot
// This runs directly in the student's browser on Google Docs

class HumanEssayBot {
    constructor() {
        this.isWriting = false;
        this.currentPrompt = '';
        this.settings = {
            typingSpeed: 'human-like',
            writingStyle: null
        };
    }

    // Initialize the bot
    init() {
        this.createUI();
        this.setupEventListeners();
        console.log('Human Essay Bot initialized!');
    }

    // Create the UI overlay
    createUI() {
        // Remove existing UI if present
        const existingUI = document.getElementById('essay-bot-ui');
        if (existingUI) {
            existingUI.remove();
        }

        // Create main container
        const container = document.createElement('div');
        container.id = 'essay-bot-ui';
        container.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                width: 350px;
                background: white;
                border: 2px solid #4285f4;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                z-index: 10000;
                font-family: 'Google Sans', Arial, sans-serif;
                font-size: 14px;
            ">
                <div style="
                    background: #4285f4;
                    color: white;
                    padding: 15px;
                    border-radius: 8px 8px 0 0;
                    font-weight: 500;
                ">
                    🤖 Human Essay Bot
                </div>
                
                <div style="padding: 20px;">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Essay Prompt:</label>
                        <textarea id="essay-prompt" placeholder="Write an essay about..." style="
                            width: 100%;
                            height: 80px;
                            padding: 10px;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                            resize: vertical;
                            font-family: inherit;
                        "></textarea>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Typing Speed:</label>
                        <select id="typing-speed" style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                            font-family: inherit;
                        ">
                            <option value="human-like">Human-like (Recommended)</option>
                            <option value="slow">Slow & Deliberate</option>
                            <option value="fast">Fast Typist</option>
                        </select>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">OpenAI API Key:</label>
                        <input type="password" id="openai-key" placeholder="sk-..." style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                            font-family: inherit;
                        ">
                        <small style="color: #666; font-size: 12px;">Your API key is used locally and never stored</small>
                    </div>

                    <div style="display: flex; gap: 10px;">
                        <button id="start-writing" style="
                            flex: 1;
                            background: #34a853;
                            color: white;
                            border: none;
                            padding: 12px;
                            border-radius: 5px;
                            font-weight: 500;
                            cursor: pointer;
                            font-family: inherit;
                        ">🚀 Start Writing</button>
                        
                        <button id="stop-writing" style="
                            flex: 1;
                            background: #ea4335;
                            color: white;
                            border: none;
                            padding: 12px;
                            border-radius: 5px;
                            font-weight: 500;
                            cursor: pointer;
                            font-family: inherit;
                            display: none;
                        ">⏹️ Stop</button>
                    </div>

                    <div id="progress-container" style="
                        margin-top: 15px;
                        display: none;
                    ">
                        <div style="
                            background: #f1f3f4;
                            height: 8px;
                            border-radius: 4px;
                            overflow: hidden;
                        ">
                            <div id="progress-bar" style="
                                background: #4285f4;
                                height: 100%;
                                width: 0%;
                                transition: width 0.3s ease;
                            "></div>
                        </div>
                        <div id="progress-text" style="
                            margin-top: 5px;
                            font-size: 12px;
                            color: #666;
                        ">Starting...</div>
                    </div>

                    <div id="status" style="
                        margin-top: 10px;
                        padding: 10px;
                        border-radius: 5px;
                        font-size: 12px;
                        display: none;
                    "></div>
                </div>
            </div>
        `;

        document.body.appendChild(container);
    }

    setupEventListeners() {
        const startBtn = document.getElementById('start-writing');
        const stopBtn = document.getElementById('stop-writing');
        const promptInput = document.getElementById('essay-prompt');

        startBtn.addEventListener('click', () => this.startWriting());
        stopBtn.addEventListener('click', () => this.stopWriting());

        // Auto-save prompt to localStorage
        promptInput.addEventListener('input', (e) => {
            localStorage.setItem('essay-bot-prompt', e.target.value);
        });

        // Load saved prompt
        const savedPrompt = localStorage.getItem('essay-bot-prompt');
        if (savedPrompt) {
            promptInput.value = savedPrompt;
        }
    }

    async startWriting() {
        const prompt = document.getElementById('essay-prompt').value.trim();
        const apiKey = document.getElementById('openai-key').value.trim();
        const typingSpeed = document.getElementById('typing-speed').value;

        if (!prompt) {
            this.showStatus('Please enter an essay prompt.', 'error');
            return;
        }

        if (!apiKey) {
            this.showStatus('Please enter your OpenAI API key.', 'error');
            return;
        }

        this.currentPrompt = prompt;
        this.settings.typingSpeed = typingSpeed;

        this.isWriting = true;
        this.updateUI(true);
        this.showProgress(true);
        this.updateProgress(0, 'Generating essay...');

        try {
            // Generate essay using OpenAI
            const essayContent = await this.generateEssay(prompt, apiKey);
            
            if (!this.isWriting) return; // Check if stopped

            this.updateProgress(50, 'Starting to type...');
            
            // Start typing the essay
            await this.typeEssay(essayContent);
            
            this.updateProgress(100, 'Essay complete!');
            this.showStatus('Essay written successfully!', 'success');
            
        } catch (error) {
            console.error('Error writing essay:', error);
            this.showStatus(`Error: ${error.message}`, 'error');
        } finally {
            this.isWriting = false;
            this.updateUI(false);
        }
    }

    async generateEssay(prompt, apiKey) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that writes academic essays. Write in a natural, human-like style with varied sentence lengths and structures. Include natural transitions between ideas and write in a conversational yet academic tone.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 2000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    async typeEssay(content) {
        // Find the Google Docs editor
        const editor = this.findGoogleDocsEditor();
        if (!editor) {
            throw new Error('Could not find Google Docs editor. Make sure you are on a Google Docs page.');
        }

        // Focus on the editor
        editor.focus();

        // Split content into sentences
        const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
        let typedChars = 0;
        const totalChars = content.length;

        for (let i = 0; i < sentences.length && this.isWriting; i++) {
            const sentence = sentences[i].trim();
            if (sentence.length === 0) continue;

            this.updateProgress(
                50 + Math.floor((typedChars / totalChars) * 50),
                `Typing: "${sentence.substring(0, 50)}..."`
            );

            await this.typeText(editor, sentence + ' ');
            typedChars += sentence.length + 1;

            // Natural pause between sentences
            await this.randomDelay(500, 2000);
        }
    }

    findGoogleDocsEditor() {
        // Try different selectors for Google Docs editor
        const selectors = [
            '[contenteditable="true"]',
            '.kix-lineview-text-block',
            '.kix-wordhtmlgenerator-word',
            '[role="textbox"]',
            '.docs-texteventtarget-iframe'
        ];

        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                return element;
            }
        }

        return null;
    }

    async typeText(element, text) {
        for (let i = 0; i < text.length && this.isWriting; i++) {
            const char = text[i];

            // Simulate realistic typing
            await this.simulateTyping(char, element);
            
            // Variable delay between characters
            await this.getTypingDelay(char);
        }
    }

    async simulateTyping(char, element) {
        // Create a typing event
        const event = new KeyboardEvent('keydown', {
            key: char,
            code: `Key${char.toUpperCase()}`,
            keyCode: char.charCodeAt(0),
            which: char.charCodeAt(0)
        });

        element.dispatchEvent(event);

        // Also trigger input event for Google Docs
        const inputEvent = new InputEvent('input', {
            data: char,
            inputType: 'insertText'
        });

        element.dispatchEvent(inputEvent);

        // Update the element's content
        if (element.contentEditable === 'true') {
            element.textContent += char;
        }
    }

    async getTypingDelay(char) {
        let baseDelay = 100;

        // Adjust delay based on character type
        if (char === ' ') {
            baseDelay = this.randomInt(80, 150);
        } else if (char === '.' || char === '!' || char === '?') {
            baseDelay = this.randomInt(200, 500);
        } else if (char === ',' || char === ';' || char === ':') {
            baseDelay = this.randomInt(150, 300);
        } else if (char.match(/[A-Z]/)) {
            baseDelay = this.randomInt(120, 250);
        } else if (char.match(/[0-9]/)) {
            baseDelay = this.randomInt(100, 200);
        } else {
            baseDelay = this.randomInt(80, 180);
        }

        // Adjust for typing speed setting
        switch (this.settings.typingSpeed) {
            case 'slow':
                baseDelay *= 1.5;
                break;
            case 'fast':
                baseDelay *= 0.7;
                break;
            default:
                baseDelay *= 1.0;
        }

        // Occasionally add longer pauses (thinking pauses)
        if (this.randomInt(1, 100) <= 3) {
            baseDelay += this.randomInt(500, 2000);
        }

        await this.randomDelay(Math.floor(baseDelay * 0.7), Math.floor(baseDelay * 1.3));
    }

    async randomDelay(min, max) {
        const delay = this.randomInt(min, max);
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    stopWriting() {
        this.isWriting = false;
        this.showStatus('Writing stopped.', 'warning');
        this.updateUI(false);
    }

    updateUI(isWriting) {
        const startBtn = document.getElementById('start-writing');
        const stopBtn = document.getElementById('stop-writing');
        const inputs = document.querySelectorAll('input, textarea, select');

        startBtn.style.display = isWriting ? 'none' : 'block';
        stopBtn.style.display = isWriting ? 'block' : 'none';

        inputs.forEach(input => {
            input.disabled = isWriting;
        });
    }

    showProgress(show) {
        const container = document.getElementById('progress-container');
        container.style.display = show ? 'block' : 'none';
    }

    updateProgress(percent, message) {
        const bar = document.getElementById('progress-bar');
        const text = document.getElementById('progress-text');

        bar.style.width = `${percent}%`;
        text.textContent = message;
    }

    showStatus(message, type) {
        const status = document.getElementById('status');
        status.textContent = message;
        status.style.display = 'block';

        // Remove existing type classes
        status.classList.remove('success', 'error', 'warning', 'info');
        status.classList.add(type);

        // Set colors based on type
        const colors = {
            success: '#34a853',
            error: '#ea4335',
            warning: '#fbbc04',
            info: '#4285f4'
        };

        status.style.backgroundColor = colors[type] || colors.info;
        status.style.color = 'white';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            status.style.display = 'none';
        }, 5000);
    }
}

// Initialize when the script loads
const essayBot = new HumanEssayBot();

// Wait for page to load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => essayBot.init());
} else {
    essayBot.init();
}

// Export for use as bookmarklet
if (typeof window !== 'undefined') {
    window.HumanEssayBot = essayBot;
}
