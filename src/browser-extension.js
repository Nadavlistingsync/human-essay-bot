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
                        <div style="background: #e8f5e8; padding: 10px; border-radius: 5px; border-left: 4px solid #34a853;">
                            <div style="font-weight: 500; color: #2d5a2d; margin-bottom: 5px;">✅ API Key Included</div>
                            <div style="font-size: 12px; color: #666;">No API key needed - we provide the OpenAI access for you!</div>
                        </div>
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
        const typingSpeed = document.getElementById('typing-speed').value;

        if (!prompt) {
            this.showStatus('Please enter an essay prompt.', 'error');
            return;
        }

        // First, test if we can find and type into the Google Docs editor
        const editor = this.findGoogleDocsEditor();
        if (!editor) {
            this.showStatus('Could not find Google Docs editor. Make sure you are on a Google Docs page and the document is ready.', 'error');
            return;
        }

        // Test typing with a simple message first
        this.showStatus('Testing typing into Google Docs...', 'info');
        try {
            await this.testTyping(editor);
            this.showStatus('✓ Typing test successful! Starting essay...', 'success');
        } catch (error) {
            this.showStatus(`✗ Typing test failed: ${error.message}`, 'error');
            return;
        }

        this.currentPrompt = prompt;
        this.settings.typingSpeed = typingSpeed;

        this.isWriting = true;
        this.updateUI(true);
        this.showProgress(true);
        this.updateProgress(0, 'Generating essay...');

        try {
            // Generate essay using our server (which has the API key)
            const essayContent = await this.generateEssay(prompt);
            
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

    async testTyping(editor) {
        // Test with a simple message to verify typing works
        const testMessage = " [Bot Test - This will be deleted] ";
        
        // Focus and click the editor
        editor.focus();
        editor.click();
        await this.randomDelay(200, 500);
        
        // Type the test message
        for (let i = 0; i < testMessage.length; i++) {
            const char = testMessage[i];
            await this.typeCharacterInGoogleDocs(char, editor);
            await this.randomDelay(50, 100);
        }
        
        // Wait a moment then delete the test message
        await this.randomDelay(1000, 2000);
        
        // Delete the test message
        for (let i = 0; i < testMessage.length; i++) {
            await this.simulateKeyPress('Backspace', editor);
            await this.randomDelay(20, 50);
        }
    }

    async simulateKeyPress(key, element) {
        const keyCode = this.getKeyCodeFromKey(key);
        const events = [
            new KeyboardEvent('keydown', {
                key: key,
                code: keyCode,
                keyCode: keyCode,
                which: keyCode,
                bubbles: true,
                cancelable: true
            }),
            new KeyboardEvent('keyup', {
                key: key,
                code: keyCode,
                keyCode: keyCode,
                which: keyCode,
                bubbles: true,
                cancelable: true
            })
        ];

        for (const event of events) {
            element.dispatchEvent(event);
            await this.randomDelay(1, 2);
        }
    }

    getKeyCodeFromKey(key) {
        const keyMap = {
            'Backspace': 8,
            'Delete': 46,
            'Enter': 13,
            'Space': 32,
            'Tab': 9
        };
        return keyMap[key] || 0;
    }

    async generateEssay(prompt) {
        // Get the current domain to determine the server URL
        const serverUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000' 
            : window.location.origin;

        const response = await fetch(`${serverUrl}/api/generate-essay`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                settings: {
                    typingSpeed: this.settings.typingSpeed,
                    writingStyle: this.settings.writingStyle
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate essay');
        }

        const data = await response.json();
        return data.content;
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
        // Try different selectors for Google Docs editor (in order of preference)
        const selectors = [
            // Most reliable Google Docs selectors
            '[contenteditable="true"]',
            '.kix-lineview-text-block',
            '.kix-wordhtmlgenerator-word',
            '[role="textbox"]',
            '.docs-texteventtarget-iframe',
            // Fallback selectors
            '[contenteditable]',
            '.kix-lineview',
            '.kix-page-column',
            '#docs-editor',
            '[data-testid="editor"]'
        ];

        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element && this.isEditableElement(element)) {
                console.log(`Found Google Docs editor with selector: ${selector}`);
                return element;
            }
        }

        // Last resort: try to find any contenteditable element
        const contentEditableElements = document.querySelectorAll('[contenteditable]');
        for (const element of contentEditableElements) {
            if (this.isEditableElement(element)) {
                console.log('Found contenteditable element as fallback');
                return element;
            }
        }

        console.error('Could not find Google Docs editor');
        return null;
    }

    isEditableElement(element) {
        // Check if element is actually editable
        if (!element) return false;
        
        // Check if it's visible
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        
        // Check if it's contenteditable
        if (element.contentEditable === 'true') return true;
        
        // Check if it has the right attributes
        if (element.getAttribute('contenteditable') === 'true') return true;
        
        // Check if it's a text input
        if (element.tagName === 'INPUT' && element.type === 'text') return true;
        if (element.tagName === 'TEXTAREA') return true;
        
        return false;
    }

    async typeText(element, text) {
        // Make sure the element is focused and visible
        element.focus();
        element.click(); // Click to ensure focus
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Wait for focus to be established
        await this.randomDelay(100, 300);
        
        // Show a typing cursor
        this.showTypingCursor(element);
        
        for (let i = 0; i < text.length && this.isWriting; i++) {
            const char = text[i];

            // Use multiple methods to ensure typing works in Google Docs
            await this.typeCharacterInGoogleDocs(char, element);
            
            // Variable delay between characters
            await this.getTypingDelay(char);
            
            // Occasionally pause to "think" (like a human would)
            if (this.shouldPauseToThink(char, i, text)) {
                await this.thinkingPause();
            }
            
            // Update progress more frequently for better feedback
            if (i % 10 === 0) {
                const progress = 50 + Math.round((i / text.length) * 50);
                this.updateProgress(progress, `Typing: ${Math.round((i/text.length)*100)}% complete`);
            }
        }
        
        // Hide typing cursor when done
        this.hideTypingCursor();
    }

    showTypingCursor(element) {
        // Create a blinking cursor indicator
        this.typingCursor = document.createElement('div');
        this.typingCursor.id = 'human-essay-bot-cursor';
        this.typingCursor.style.cssText = `
            position: fixed;
            width: 2px;
            height: 20px;
            background: #4285f4;
            z-index: 10000;
            animation: cursorBlink 1s infinite;
            pointer-events: none;
        `;
        
        document.body.appendChild(this.typingCursor);
        this.updateCursorPosition(element);
    }

    hideTypingCursor() {
        if (this.typingCursor && this.typingCursor.parentNode) {
            this.typingCursor.parentNode.removeChild(this.typingCursor);
            this.typingCursor = null;
        }
    }

    updateCursorPosition(element) {
        if (!this.typingCursor) return;
        
        // Try to get the current cursor position
        const selection = window.getSelection();
        let x = window.innerWidth / 2;
        let y = window.innerHeight / 2;

        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            x = rect.right;
            y = rect.top;
        } else {
            // Fallback to element position
            const rect = element.getBoundingClientRect();
            x = rect.left + 10;
            y = rect.top + 10;
        }

        this.typingCursor.style.left = `${x}px`;
        this.typingCursor.style.top = `${y}px`;
    }

    async typeCharacterInGoogleDocs(char, element) {
        // Method 1: Try execCommand (most reliable for contenteditable)
        try {
            const success = document.execCommand('insertText', false, char);
            if (success) {
                this.showTypingFeedback(char, element);
                this.updateCursorPosition(element);
                return;
            }
        } catch (e) {
            console.log('execCommand failed, trying other methods');
        }

        // Method 2: Direct text insertion for contenteditable
        try {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(char));
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
                
                // Trigger input event
                element.dispatchEvent(new Event('input', { bubbles: true }));
                
                this.showTypingFeedback(char, element);
                this.updateCursorPosition(element);
                return;
            }
        } catch (e) {
            console.log('Direct text insertion failed, trying keyboard events');
        }

        // Method 3: Simulate keyboard events (fallback)
        await this.simulateKeyboardEvents(char, element);
    }

    async simulateKeyboardEvents(char, element) {
        // Create comprehensive keyboard events
        const events = [
            new KeyboardEvent('keydown', {
                key: char,
                code: this.getKeyCode(char),
                keyCode: char.charCodeAt(0),
                which: char.charCodeAt(0),
                bubbles: true,
                cancelable: true
            }),
            new KeyboardEvent('keypress', {
                key: char,
                code: this.getKeyCode(char),
                keyCode: char.charCodeAt(0),
                which: char.charCodeAt(0),
                bubbles: true,
                cancelable: true
            })
        ];

        // Dispatch keydown and keypress
        for (const event of events) {
            element.dispatchEvent(event);
            await this.randomDelay(1, 2);
        }

        // Insert the character manually
        try {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(char));
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        } catch (e) {
            console.log('Manual insertion failed');
        }

        // Dispatch keyup
        const keyupEvent = new KeyboardEvent('keyup', {
            key: char,
            code: this.getKeyCode(char),
            keyCode: char.charCodeAt(0),
            which: char.charCodeAt(0),
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(keyupEvent);

        // Trigger input event
        const inputEvent = new InputEvent('input', {
            data: char,
            inputType: 'insertText',
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(inputEvent);

        this.showTypingFeedback(char, element);
        this.updateCursorPosition(element);
    }

    getKeyCode(char) {
        // Map characters to proper key codes
        if (char === ' ') return 'Space';
        if (char === '.') return 'Period';
        if (char === ',') return 'Comma';
        if (char === '!') return 'Digit1';
        if (char === '?') return 'Slash';
        if (char.match(/[A-Z]/)) return `Key${char}`;
        if (char.match(/[a-z]/)) return `Key${char.toUpperCase()}`;
        if (char.match(/[0-9]/)) return `Digit${char}`;
        return `Key${char.toUpperCase()}`;
    }

    showTypingFeedback(char, element) {
        // Create a more prominent visual indicator
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: fixed;
            background: linear-gradient(45deg, #4285f4, #34a853);
            color: white;
            font-weight: bold;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 14px;
            pointer-events: none;
            z-index: 10001;
            animation: typingGlow 0.4s ease-out;
            box-shadow: 0 4px 12px rgba(66, 133, 244, 0.4);
            border: 2px solid white;
        `;
        
        indicator.textContent = char;
        
        // Add enhanced CSS animation
        if (!document.getElementById('typing-animation-style')) {
            const style = document.createElement('style');
            style.id = 'typing-animation-style';
            style.textContent = `
                @keyframes typingGlow {
                    0% { 
                        opacity: 0; 
                        transform: scale(0.5) translateY(20px); 
                    }
                    30% { 
                        opacity: 1; 
                        transform: scale(1.2) translateY(-10px); 
                    }
                    70% { 
                        opacity: 1; 
                        transform: scale(1) translateY(0px); 
                    }
                    100% { 
                        opacity: 0; 
                        transform: scale(0.8) translateY(-20px); 
                    }
                }
                @keyframes cursorBlink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Position the indicator near the current cursor position
        this.positionTypingIndicator(indicator, element);
        
        document.body.appendChild(indicator);
        
        // Remove after animation
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 400);
    }

    positionTypingIndicator(indicator, element) {
        // Try to get the current cursor position
        const selection = window.getSelection();
        let x = window.innerWidth / 2; // Default to center
        let y = window.innerHeight / 2;

        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            x = rect.right + 10;
            y = rect.top - 10;
        } else {
            // Fallback to element position
            const rect = element.getBoundingClientRect();
            x = rect.left + 20;
            y = rect.top - 30;
        }

        // Ensure indicator stays on screen
        x = Math.max(10, Math.min(x, window.innerWidth - 50));
        y = Math.max(10, Math.min(y, window.innerHeight - 50));

        indicator.style.left = `${x}px`;
        indicator.style.top = `${y}px`;
    }

    shouldPauseToThink(char, index, text) {
        // Pause after periods, question marks, exclamation points
        if (char === '.' || char === '!' || char === '?') {
            return this.randomInt(1, 100) <= 20; // 20% chance
        }
        
        // Pause after commas
        if (char === ',') {
            return this.randomInt(1, 100) <= 10; // 10% chance
        }
        
        // Pause after longer words
        const words = text.substring(0, index + 1).split(' ');
        const lastWord = words[words.length - 1];
        if (lastWord.length > 8) {
            return this.randomInt(1, 100) <= 5; // 5% chance
        }
        
        return false;
    }

    async thinkingPause() {
        // Simulate human thinking pause
        const pauseDuration = this.randomInt(800, 2500);
        this.updateProgress(null, `Thinking... (${Math.round(pauseDuration/1000)}s pause)`);
        await this.randomDelay(pauseDuration, pauseDuration + 500);
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
