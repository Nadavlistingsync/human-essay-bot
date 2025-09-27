const { ipcRenderer } = require('electron');
const path = require('path');

class EssayBotRenderer {
    constructor() {
        this.isWriting = false;
        this.uploadedFiles = [];
        this.writingStyle = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupFileUpload();
    }

    initializeElements() {
        this.elements = {
            essayPrompt: document.getElementById('essay-prompt'),
            typingSpeed: document.getElementById('typing-speed'),
            openaiKey: document.getElementById('openai-key'),
            documentUrl: document.getElementById('document-url'),
            uploadArea: document.getElementById('upload-area'),
            fileInput: document.getElementById('file-input'),
            stylePreview: document.getElementById('style-preview'),
            styleDetails: document.getElementById('style-details'),
            startBtn: document.getElementById('start-btn'),
            stopBtn: document.getElementById('stop-btn'),
            progressSection: document.getElementById('progress-section'),
            progressFill: document.getElementById('progress-fill'),
            progressText: document.getElementById('progress-text'),
            currentSentence: document.getElementById('current-sentence'),
            statusCard: document.getElementById('status-card')
        };
    }

    setupEventListeners() {
        this.elements.startBtn.addEventListener('click', () => this.startWriting());
        this.elements.stopBtn.addEventListener('click', () => this.stopWriting());
        
        // Auto-save API key to localStorage
        this.elements.openaiKey.addEventListener('input', (e) => {
            localStorage.setItem('openai_api_key', e.target.value);
        });

        // Auto-save document URL to localStorage
        this.elements.documentUrl.addEventListener('input', (e) => {
            localStorage.setItem('document_url', e.target.value);
        });

        // Load saved values
        const savedKey = localStorage.getItem('openai_api_key');
        if (savedKey) {
            this.elements.openaiKey.value = savedKey;
        }

        const savedUrl = localStorage.getItem('document_url');
        if (savedUrl) {
            this.elements.documentUrl.value = savedUrl;
        }
    }

    setupFileUpload() {
        // Drag and drop functionality
        this.elements.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.elements.uploadArea.classList.add('dragover');
        });

        this.elements.uploadArea.addEventListener('dragleave', () => {
            this.elements.uploadArea.classList.remove('dragover');
        });

        this.elements.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.elements.uploadArea.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });

        // Click to upload
        this.elements.uploadArea.addEventListener('click', () => {
            this.elements.fileInput.click();
        });

        this.elements.fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
    }

    async handleFiles(files) {
        const validFiles = Array.from(files).filter(file => {
            const ext = path.extname(file.name).toLowerCase();
            return ['.txt', '.md'].includes(ext);
        });

        if (validFiles.length === 0) {
            this.updateStatus('error', 'Please upload .txt or .md files only.');
            return;
        }

        this.uploadedFiles = validFiles;
        this.updateStatus('info', `Loaded ${validFiles.length} writing sample(s). Analyzing style...`);

        // Analyze writing style
        try {
            const analysis = await this.analyzeWritingStyle(validFiles[0].path);
            this.displayWritingStyle(analysis);
            this.writingStyle = analysis;
            this.updateStatus('success', 'Writing style analyzed successfully!');
        } catch (error) {
            console.error('Error analyzing writing style:', error);
            this.updateStatus('error', 'Failed to analyze writing style.');
        }
    }

    async analyzeWritingStyle(filePath) {
        return await ipcRenderer.invoke('analyze-writing-style', { filePath });
    }

    displayWritingStyle(analysis) {
        if (!analysis.success) {
            console.error('Analysis failed:', analysis.error);
            return;
        }

        const style = analysis.style;
        const details = `
            <div style="margin-bottom: 15px;">
                <strong>Overall Style:</strong> ${style.overallStyle.description}
            </div>
            <div style="margin-bottom: 10px;">
                <strong>Formality Level:</strong> ${style.tone.formality}
            </div>
            <div style="margin-bottom: 10px;">
                <strong>Average Sentence Length:</strong> ${Math.round(style.sentenceStructure.averageLength)} words
            </div>
            <div style="margin-bottom: 10px;">
                <strong>Vocabulary Richness:</strong> ${(style.vocabulary.richness * 100).toFixed(1)}%
            </div>
            <div>
                <strong>Common Words:</strong> ${style.vocabulary.commonWords.slice(0, 5).map(([word]) => word).join(', ')}
            </div>
        `;

        this.elements.styleDetails.innerHTML = details;
        this.elements.stylePreview.style.display = 'block';
    }

    async startWriting() {
        if (this.isWriting) return;

        const prompt = this.elements.essayPrompt.value.trim();
        const openaiKey = this.elements.openaiKey.value.trim();

        if (!prompt) {
            this.updateStatus('error', 'Please enter an essay prompt.');
            return;
        }

        if (!openaiKey) {
            this.updateStatus('error', 'Please enter your OpenAI API key.');
            return;
        }

        const settings = {
            typingSpeed: this.elements.typingSpeed.value,
            writingStyle: this.writingStyle?.style || null,
            openaiApiKey: openaiKey,
            documentUrl: this.elements.documentUrl.value.trim() || null
        };

        this.isWriting = true;
        this.updateUI(true);
        this.updateStatus('info', 'Starting essay writing process...');

        try {
            const result = await ipcRenderer.invoke('start-writing', { prompt, settings });
            
            if (result.success) {
                this.updateStatus('success', 'Essay completed successfully!');
            } else {
                this.updateStatus('error', `Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Writing error:', error);
            this.updateStatus('error', 'An unexpected error occurred.');
        } finally {
            this.isWriting = false;
            this.updateUI(false);
        }
    }

    async stopWriting() {
        try {
            await ipcRenderer.invoke('stop-writing');
            this.updateStatus('info', 'Writing stopped by user.');
        } catch (error) {
            console.error('Stop error:', error);
        }
    }

    updateUI(isWriting) {
        this.elements.startBtn.style.display = isWriting ? 'none' : 'inline-block';
        this.elements.stopBtn.style.display = isWriting ? 'inline-block' : 'none';
        this.elements.progressSection.style.display = isWriting ? 'block' : 'none';
        
        // Disable form inputs during writing
        const inputs = [
            this.elements.essayPrompt,
            this.elements.typingSpeed,
            this.elements.openaiKey,
            this.elements.documentUrl
        ];
        
        inputs.forEach(input => {
            input.disabled = isWriting;
        });
    }

    updateStatus(type, message) {
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️'
        };

        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6',
            warning: '#f59e0b'
        };

        this.elements.statusCard.innerHTML = `
            <div class="status-icon">${icons[type]}</div>
            <div class="status-content">
                <h4>${this.getStatusTitle(type)}</h4>
                <p>${message}</p>
            </div>
        `;

        this.elements.statusCard.style.borderLeftColor = colors[type];
    }

    getStatusTitle(type) {
        const titles = {
            success: 'Success',
            error: 'Error',
            info: 'Information',
            warning: 'Warning'
        };
        return titles[type];
    }
}

// Listen for progress updates from main process
ipcRenderer.on('writing-progress', (event, progress) => {
    const renderer = window.essayBotRenderer;
    
    if (renderer && renderer.elements) {
        renderer.elements.progressFill.style.width = `${progress.progress}%`;
        renderer.elements.progressText.textContent = `Stage: ${progress.stage} (${progress.progress}%)`;
        
        if (progress.currentSentence) {
            renderer.elements.currentSentence.textContent = `Currently typing: "${progress.currentSentence}"`;
        }

        // Add writing animation
        if (progress.stage === 'typing') {
            renderer.elements.progressSection.classList.add('writing');
        } else {
            renderer.elements.progressSection.classList.remove('writing');
        }
    }
});

// Initialize the renderer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.essayBotRenderer = new EssayBotRenderer();
});

// Handle window beforeunload
window.addEventListener('beforeunload', (event) => {
    if (window.essayBotRenderer && window.essayBotRenderer.isWriting) {
        event.preventDefault();
        event.returnValue = 'Writing is in progress. Are you sure you want to close?';
    }
});
