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
            saveApiKeyBtn: document.getElementById('save-api-key'),
            apiKeyStatus: document.getElementById('api-key-status'),
            // Browser control elements
            navBack: document.getElementById('nav-back'),
            navForward: document.getElementById('nav-forward'),
            navRefresh: document.getElementById('nav-refresh'),
            navNewTab: document.getElementById('nav-new-tab'),
            takeScreenshot: document.getElementById('take-screenshot'),
            scrollDown: document.getElementById('scroll-down'),
            scrollUp: document.getElementById('scroll-up'),
            bookmarkPage: document.getElementById('bookmark-page'),
            showTabs: document.getElementById('show-tabs'),
            closeCurrentTab: document.getElementById('close-current-tab'),
            tabsList: document.getElementById('tabs-list'),
            startRecording: document.getElementById('start-recording'),
            stopRecording: document.getElementById('stop-recording'),
            playbackActions: document.getElementById('playback-actions'),
            clearRecording: document.getElementById('clear-recording'),
            customUrl: document.getElementById('custom-url'),
            navigateUrl: document.getElementById('navigate-url'),
            elementSelector: document.getElementById('element-selector'),
            clickSelector: document.getElementById('click-selector')
        };
    }

    setupEventListeners() {
        // Essay writing controls
        this.elements.startBtn.addEventListener('click', () => this.startWriting());
        this.elements.stopBtn.addEventListener('click', () => this.stopWriting());
        this.elements.saveApiKeyBtn.addEventListener('click', () => this.saveApiKey());
        
        // Browser control event listeners
        this.setupBrowserControlListeners();
    }

    setupBrowserControlListeners() {
        // Navigation controls
        this.elements.navBack.addEventListener('click', () => this.navigateBack());
        this.elements.navForward.addEventListener('click', () => this.navigateForward());
        this.elements.navRefresh.addEventListener('click', () => this.refreshPage());
        this.elements.navNewTab.addEventListener('click', () => this.createNewTab());
        
        // Page actions
        this.elements.takeScreenshot.addEventListener('click', () => this.takeScreenshot());
        this.elements.scrollDown.addEventListener('click', () => this.scrollPage('down'));
        this.elements.scrollUp.addEventListener('click', () => this.scrollPage('up'));
        this.elements.bookmarkPage.addEventListener('click', () => this.bookmarkCurrentPage());
        
        // Tab management
        this.elements.showTabs.addEventListener('click', () => this.toggleTabsList());
        this.elements.closeCurrentTab.addEventListener('click', () => this.closeCurrentTab());
        
        // Automation
        this.elements.startRecording.addEventListener('click', () => this.startRecording());
        this.elements.stopRecording.addEventListener('click', () => this.stopRecording());
        this.elements.playbackActions.addEventListener('click', () => this.playbackActions());
        this.elements.clearRecording.addEventListener('click', () => this.clearRecording());
        
        // Quick actions
        this.elements.navigateUrl.addEventListener('click', () => this.navigateToUrl());
        this.elements.clickSelector.addEventListener('click', () => this.clickSelector());
        
        // Allow Enter key in input fields
        this.elements.customUrl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.navigateToUrl();
        });
        this.elements.elementSelector.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.clickSelector();
        });
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
            const result = await chrome.storage.sync.get(['typingSpeed', 'essayLength', 'apiKey']);
            
            if (result.typingSpeed) {
                this.elements.typingSpeed.value = result.typingSpeed;
            }
            
            if (result.essayLength) {
                this.elements.essayLength.value = result.essayLength;
            }

            if (result.apiKey) {
                this.elements.apiKey.value = result.apiKey;
                this.showApiKeyStatus('API key loaded ✓', 'success');
            } else {
                this.showApiKeyStatus('Please enter your OpenAI API key', 'warning');
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async saveApiKey() {
        const apiKey = this.elements.apiKey.value.trim();
        
        if (!apiKey) {
            this.showApiKeyStatus('Please enter a valid API key', 'error');
            return;
        }

        if (!apiKey.startsWith('sk-')) {
            this.showApiKeyStatus('Invalid API key format', 'error');
            return;
        }

        try {
            await chrome.storage.sync.set({ apiKey });
            this.showApiKeyStatus('API key saved successfully! ✓', 'success');
        } catch (error) {
            console.error('Error saving API key:', error);
            this.showApiKeyStatus('Error saving API key', 'error');
        }
    }

    showApiKeyStatus(message, type) {
        this.elements.apiKeyStatus.textContent = message;
        this.elements.apiKeyStatus.className = `api-key-status ${type}`;
        this.elements.apiKeyStatus.style.display = 'block';
    }

    async startWriting() {
        if (this.isWriting) return;

        const prompt = this.elements.essayPrompt.value.trim();
        
        if (!prompt) {
            this.updateStatus('error', 'Please enter an essay prompt');
            return;
        }

        // Check if API key is set
        const { apiKey } = await chrome.storage.sync.get('apiKey');
        if (!apiKey) {
            this.updateStatus('error', 'Please set your OpenAI API key first');
            this.showApiKeyStatus('⚠️ API key required! Please enter and save your key above', 'error');
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
                        essayLength: this.elements.essayLength.value
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

    // Browser Control Methods
    async navigateBack() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => window.history.back()
            });
        } catch (error) {
            console.error('Error navigating back:', error);
        }
    }

    async navigateForward() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => window.history.forward()
            });
        } catch (error) {
            console.error('Error navigating forward:', error);
        }
    }

    async refreshPage() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            await chrome.tabs.reload(tab.id);
        } catch (error) {
            console.error('Error refreshing page:', error);
        }
    }

    async createNewTab() {
        try {
            await chrome.tabs.create({ url: 'chrome://newtab/' });
        } catch (error) {
            console.error('Error creating new tab:', error);
        }
    }

    async takeScreenshot() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId);
            
            // Create download link
            const link = document.createElement('a');
            link.download = `screenshot-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
            
            this.updateStatus('success', 'Screenshot saved!');
        } catch (error) {
            console.error('Error taking screenshot:', error);
            this.updateStatus('error', 'Failed to take screenshot');
        }
    }

    async scrollPage(direction) {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'scrollPage',
                direction: direction
            });
            
            if (response.success) {
                this.updateStatus('success', `Scrolled ${direction}`);
            }
        } catch (error) {
            console.error('Error scrolling page:', error);
            this.updateStatus('error', 'Failed to scroll page');
        }
    }

    async bookmarkCurrentPage() {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'bookmarkCurrentPage'
            });
            
            if (response.success) {
                this.updateStatus('success', 'Page bookmarked!');
            }
        } catch (error) {
            console.error('Error bookmarking page:', error);
            this.updateStatus('error', 'Failed to bookmark page');
        }
    }

    async toggleTabsList() {
        const isVisible = this.elements.tabsList.style.display !== 'none';
        
        if (isVisible) {
            this.elements.tabsList.style.display = 'none';
        } else {
            await this.loadTabsList();
        }
    }

    async loadTabsList() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getTabs' });
            
            if (response.success) {
                this.elements.tabsList.innerHTML = '';
                
                response.tabs.forEach(tab => {
                    const tabItem = document.createElement('div');
                    tabItem.className = 'tab-item';
                    tabItem.innerHTML = `
                        <img src="${tab.favIconUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiByeD0iMiIgZmlsbD0iIzZCNzI4MCIvPgo8L3N2Zz4K'}" 
                             class="tab-favicon" alt="favicon" />
                        <span class="tab-title">${tab.title}</span>
                        <button class="tab-close" data-tab-id="${tab.id}">✕</button>
                    `;
                    
                    tabItem.addEventListener('click', (e) => {
                        if (!e.target.classList.contains('tab-close')) {
                            chrome.tabs.update(tab.id, { active: true });
                        }
                    });
                    
                    const closeBtn = tabItem.querySelector('.tab-close');
                    closeBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        chrome.tabs.remove(tab.id);
                        tabItem.remove();
                    });
                    
                    this.elements.tabsList.appendChild(tabItem);
                });
                
                this.elements.tabsList.style.display = 'block';
            }
        } catch (error) {
            console.error('Error loading tabs:', error);
        }
    }

    async closeCurrentTab() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            await chrome.tabs.remove(tab.id);
        } catch (error) {
            console.error('Error closing current tab:', error);
        }
    }

    async startRecording() {
        try {
            this.isRecording = true;
            this.elements.startRecording.style.display = 'none';
            this.elements.stopRecording.style.display = 'block';
            
            // Show recording status
            const recordingStatus = document.createElement('div');
            recordingStatus.className = 'recording-status active';
            recordingStatus.textContent = '🔴 Recording actions...';
            this.elements.startRecording.parentNode.appendChild(recordingStatus);
            
            this.updateStatus('writing', 'Recording browser actions...');
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    }

    async stopRecording() {
        try {
            this.isRecording = false;
            this.elements.startRecording.style.display = 'block';
            this.elements.stopRecording.style.display = 'none';
            
            // Remove recording status
            const recordingStatus = document.querySelector('.recording-status');
            if (recordingStatus) {
                recordingStatus.remove();
            }
            
            this.updateStatus('success', 'Recording stopped');
        } catch (error) {
            console.error('Error stopping recording:', error);
        }
    }

    async playbackActions() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getTabs' });
            if (response.success) {
                // Get recorded actions from storage
                const result = await chrome.storage.local.get(['recordedActions']);
                const recordedActions = result.recordedActions || [];
                
                if (recordedActions.length === 0) {
                    this.updateStatus('error', 'No recorded actions found');
                    return;
                }
                
                this.updateStatus('writing', `Playing back ${recordedActions.length} actions...`);
                
                // Playback actions
                const playbackResponse = await chrome.runtime.sendMessage({
                    action: 'playbackActions',
                    actions: recordedActions
                });
                
                if (playbackResponse.success) {
                    this.updateStatus('success', 'Actions played back successfully!');
                }
            }
        } catch (error) {
            console.error('Error playing back actions:', error);
            this.updateStatus('error', 'Failed to playback actions');
        }
    }

    async clearRecording() {
        try {
            await chrome.storage.local.remove(['recordedActions']);
            this.updateStatus('success', 'Recording cleared');
        } catch (error) {
            console.error('Error clearing recording:', error);
            this.updateStatus('error', 'Failed to clear recording');
        }
    }

    async navigateToUrl() {
        const url = this.elements.customUrl.value.trim();
        if (!url) {
            this.updateStatus('error', 'Please enter a URL');
            return;
        }
        
        try {
            const fullUrl = url.startsWith('http') ? url : `https://${url}`;
            await chrome.tabs.update({ url: fullUrl });
            this.elements.customUrl.value = '';
        } catch (error) {
            console.error('Error navigating to URL:', error);
            this.updateStatus('error', 'Failed to navigate to URL');
        }
    }

    async clickSelector() {
        const selector = this.elements.elementSelector.value.trim();
        if (!selector) {
            this.updateStatus('error', 'Please enter a CSS selector');
            return;
        }
        
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'clickElement',
                selector: selector
            });
            
            if (response.success) {
                this.updateStatus('success', `Clicked element: ${selector}`);
                this.elements.elementSelector.value = '';
            } else {
                this.updateStatus('error', 'Element not found');
            }
        } catch (error) {
            console.error('Error clicking selector:', error);
            this.updateStatus('error', 'Failed to click element');
        }
    }
}

// Initialize the popup app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PopupApp();
});
