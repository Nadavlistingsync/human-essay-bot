// Popup script for EssayForge Chrome Extension
class PopupApp {
    constructor() {
        this.isWriting = false;
        this.initializeElements();
        this.setupEventListeners();
        this.loadSettings();
        this.checkCurrentTab();
    }

    initializeElements() {
        this.elements = {
            essayPrompt: document.getElementById('essay-prompt'),
            typingSpeed: document.getElementById('typing-speed'),
            essayLength: document.getElementById('essay-length'),
            startBtn: document.getElementById('start-btn'),
            stopBtn: document.getElementById('stop-btn'),
            progressSection: document.getElementById('progress-section'),
            progressFill: document.getElementById('progress-fill'),
            progressText: document.getElementById('progress-text'),
            statusIndicator: document.getElementById('status-indicator'),
            statusText: document.querySelector('.status-text'),
            statusDot: document.querySelector('.status-dot'),
            apiKey: document.getElementById('api-key'),
            saveKeyBtn: document.getElementById('save-key-btn')
        };
    }

    setupEventListeners() {
        this.elements.startBtn.addEventListener('click', () => this.startWriting());
        this.elements.stopBtn.addEventListener('click', () => this.stopWriting());
        this.elements.saveKeyBtn.addEventListener('click', () => this.saveApiKey());
    }

    async checkCurrentTab() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab.url && tab.url.includes('docs.google.com/document')) {
                this.updateStatus('ready', 'Ready to write in Google Docs!');
                this.elements.startBtn.disabled = false;
            } else {
                this.updateStatus('error', 'Please open a Google Doc first');
                this.elements.startBtn.disabled = true;
            }
        } catch (error) {
            console.error('Error checking current tab:', error);
            this.updateStatus('error', 'Error checking current tab');
        }
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get(['apiKey', 'typingSpeed', 'essayLength']);
            
            if (result.apiKey) {
                this.elements.apiKey.value = result.apiKey;
            }
            
            if (result.typingSpeed) {
                this.elements.typingSpeed.value = result.typingSpeed;
            }
            
            if (result.essayLength) {
                this.elements.essayLength.value = result.essayLength;
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async saveApiKey() {
        const apiKey = this.elements.apiKey.value.trim();
        
        if (!apiKey) {
            this.updateStatus('error', 'Please enter an API key');
            return;
        }

        try {
            await chrome.storage.sync.set({ apiKey });
            this.updateStatus('success', 'API key saved successfully!');
        } catch (error) {
            console.error('Error saving API key:', error);
            this.updateStatus('error', 'Failed to save API key');
        }
    }

    async startWriting() {
        if (this.isWriting) return;

        const prompt = this.elements.essayPrompt.value.trim();
        
        if (!prompt) {
            this.updateStatus('error', 'Please enter an essay prompt');
            return;
        }

        // Check if API key is set
        const result = await chrome.storage.sync.get(['apiKey']);
        if (!result.apiKey) {
            this.updateStatus('error', 'Please set your OpenAI API key first');
            return;
        }

        this.isWriting = true;
        this.updateUI(true);
        this.updateStatus('writing', 'Starting essay writing...');

        try {
            // Get current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Send message to content script
            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'startWriting',
                data: {
                    prompt: prompt,
                    settings: {
                        typingSpeed: this.elements.typingSpeed.value,
                        essayLength: this.elements.essayLength.value,
                        apiKey: result.apiKey
                    }
                }
            });

            if (response && response.success) {
                this.updateStatus('success', 'Essay writing started!');
                this.startProgressTracking();
            } else {
                this.updateStatus('error', response?.error || 'Failed to start writing');
                this.isWriting = false;
                this.updateUI(false);
            }
        } catch (error) {
            console.error('Error starting writing:', error);
            this.updateStatus('error', 'Failed to start writing: ' + error.message);
            this.isWriting = false;
            this.updateUI(false);
        }
    }

    async stopWriting() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            await chrome.tabs.sendMessage(tab.id, { action: 'stopWriting' });
            
            this.isWriting = false;
            this.updateUI(false);
            this.updateStatus('ready', 'Writing stopped');
        } catch (error) {
            console.error('Error stopping writing:', error);
        }
    }

    startProgressTracking() {
        // Listen for progress updates from content script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'progress') {
                this.updateProgress(message.progress, message.text);
            } else if (message.type === 'complete') {
                this.isWriting = false;
                this.updateUI(false);
                this.updateStatus('success', 'Essay completed!');
            } else if (message.type === 'error') {
                this.isWriting = false;
                this.updateUI(false);
                this.updateStatus('error', message.error);
            }
        });
    }

    updateProgress(progress, text) {
        this.elements.progressFill.style.width = `${progress}%`;
        this.elements.progressText.textContent = text;
    }

    updateStatus(type, message) {
        this.elements.statusText.textContent = message;
        this.elements.statusDot.className = `status-dot ${type}`;
    }

    updateUI(isWriting) {
        this.elements.startBtn.style.display = isWriting ? 'none' : 'block';
        this.elements.stopBtn.style.display = isWriting ? 'block' : 'none';
        this.elements.progressSection.style.display = isWriting ? 'block' : 'none';
        
        // Disable form elements while writing
        this.elements.essayPrompt.disabled = isWriting;
        this.elements.typingSpeed.disabled = isWriting;
        this.elements.essayLength.disabled = isWriting;
    }
}

// Initialize the popup app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PopupApp();
});
