// Web app version of the renderer logic
class WebApp {
    constructor() {
        this.writingStyle = null;
        this.isWriting = false;
        this.initializeElements();
        this.setupEventListeners();
        this.setupFileUpload();
        this.loadSettings();
    }

    initializeElements() {
        this.elements = {
            essayPrompt: document.getElementById('essay-prompt'),
            typingSpeed: document.getElementById('typing-speed'),
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

        // Auto-save settings to localStorage
        this.elements.documentUrl.addEventListener('input', (e) => {
            this.saveSettings();
        });

        this.elements.typingSpeed.addEventListener('change', (e) => {
            this.saveSettings();
        });
    }

    setupFileUpload() {
        // Drag and drop functionality
        this.elements.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.elements.uploadArea.classList.add('drag-over');
        });

        this.elements.uploadArea.addEventListener('dragleave', () => {
            this.elements.uploadArea.classList.remove('drag-over');
        });

        this.elements.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.elements.uploadArea.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            this.handleFiles(files);
        });

        // Click to upload
        this.elements.uploadArea.addEventListener('click', () => {
            this.elements.fileInput.click();
        });

        this.elements.fileInput.addEventListener('change', (e) => {
            const files = e.target.files;
            this.handleFiles(files);
        });
    }

    async handleFiles(files) {
        if (files.length === 0) return;

        this.updateStatus('info', `Analyzing ${files.length} writing sample(s)...`);
        this.elements.stylePreview.style.display = 'none';
        this.elements.styleDetails.innerHTML = '';

        try {
            const file = files[0];
            const textContent = await this.readFileAsText(file);
            
            const response = await fetch('/api/analyze-style', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ textContent })
            });

            const result = await response.json();

            if (result.success) {
                this.writingStyle = result.style;
                this.elements.stylePreview.style.display = 'block';
                this.elements.styleDetails.innerHTML = `
                    <p><strong>Formality:</strong> ${this.writingStyle.formality}</p>
                    <p><strong>Average Sentence Length:</strong> ${this.writingStyle.averageSentenceLength} words</p>
                    <p><strong>Vocabulary Richness:</strong> ${this.writingStyle.vocabularyRichness}%</p>
                    <p><strong>Overall Style:</strong> ${this.writingStyle.overallStyle}</p>
                `;
                this.updateStatus('success', 'Writing style analyzed successfully!');
            } else {
                this.updateStatus('error', `Error analyzing style: ${result.error}`);
            }
        } catch (error) {
            console.error('File analysis error:', error);
            this.updateStatus('error', `Failed to analyze writing style: ${error.message}`);
        }
    }

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    async startWriting() {
        if (this.isWriting) return;

        const prompt = this.elements.essayPrompt.value.trim();

        if (!prompt) {
            this.updateStatus('error', 'Please enter an essay prompt.');
            return;
        }

        const settings = {
            typingSpeed: this.elements.typingSpeed.value,
            writingStyle: this.writingStyle,
            documentUrl: this.elements.documentUrl.value.trim() || null
        };

        this.isWriting = true;
        this.updateUI(true);
        this.updateStatus('info', 'Starting essay writing process...');

        try {
            console.log('Making API request to /api/start-writing');
            console.log('Request payload:', { prompt, settings });
            
            const response = await fetch('/api/start-writing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt, settings })
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('API response:', result);

            if (result.success) {
                if (result.mode === 'generation-only') {
                    this.updateStatus('success', result.message);
                    this.showGeneratedContent(result.content);
                } else {
                    this.updateStatus('success', 'Essay writing completed successfully!');
                    this.updateProgress(100, 'Essay completed!', '');
                }
            } else {
                this.updateStatus('error', `Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Start writing error:', error);
            console.error('Error type:', error.constructor.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            
            // More specific error messages
            let errorMessage = error.message;
            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Cannot connect to server. Make sure the web app is running with "npm start"';
            } else if (error.message.includes('HTTP 500')) {
                errorMessage = 'Server error. Check console for details.';
            } else if (error.message.includes('HTTP 404')) {
                errorMessage = 'API endpoint not found. Check server configuration.';
            }
            
            this.updateStatus('error', `Failed to start writing: ${errorMessage}`);
        } finally {
            this.isWriting = false;
            this.updateUI(false);
        }
    }

    async stopWriting() {
        if (!this.isWriting) return;

        this.updateStatus('info', 'Stopping writing process...');
        this.isWriting = false;
        this.updateUI(false);
        this.updateStatus('warning', 'Writing stopped by user.');
    }

    updateStatus(type, message) {
        const statusCard = this.elements.statusCard;
        const statusIcon = statusCard.querySelector('.status-icon');
        const statusTitle = statusCard.querySelector('h4');
        const statusMessage = statusCard.querySelector('p');

        statusCard.className = `status-card ${type}`;
        statusMessage.textContent = message;

        switch (type) {
            case 'info':
                statusIcon.textContent = '💡';
                statusTitle.textContent = 'Info';
                break;
            case 'success':
                statusIcon.textContent = '✅';
                statusTitle.textContent = 'Success';
                break;
            case 'error':
                statusIcon.textContent = '❌';
                statusTitle.textContent = 'Error';
                break;
            case 'warning':
                statusIcon.textContent = '⚠️';
                statusTitle.textContent = 'Warning';
                break;
            default:
                statusIcon.textContent = '💡';
                statusTitle.textContent = 'Status';
        }
    }

    updateProgress(percent, message, currentSentence) {
        if (this.elements.progressFill && this.elements.progressText) {
            this.elements.progressFill.style.width = `${percent}%`;
            this.elements.progressText.textContent = `${message} (${percent}%)`;
            if (currentSentence) {
                this.elements.currentSentence.textContent = `"${currentSentence}"`;
            } else {
                this.elements.currentSentence.textContent = '';
            }
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
            this.elements.documentUrl
        ];

        inputs.forEach(input => {
            input.disabled = isWriting;
        });
    }

    saveSettings() {
        const settings = {
            documentUrl: this.elements.documentUrl.value,
            typingSpeed: this.elements.typingSpeed.value
        };
        localStorage.setItem('essayBotSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('essayBotSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            if (settings.documentUrl) {
                this.elements.documentUrl.value = settings.documentUrl;
            }
            if (settings.typingSpeed) {
                this.elements.typingSpeed.value = settings.typingSpeed;
            }
        }
    }

    showGeneratedContent(content) {
        // Create a modal or section to display the generated content
        const contentSection = document.createElement('div');
        contentSection.className = 'generated-content-section';
        contentSection.innerHTML = `
            <div class="content-header">
                <h3>📝 Generated Essay Content</h3>
                <button class="copy-btn" onclick="navigator.clipboard.writeText(this.nextElementSibling.textContent)">📋 Copy to Clipboard</button>
            </div>
            <div class="content-text">${content}</div>
            <div class="content-footer">
                <p><strong>Instructions:</strong> Copy the content above and paste it into your Google Doc manually.</p>
            </div>
        `;

        // Insert after the progress section
        const progressSection = document.getElementById('progress-section');
        progressSection.parentNode.insertBefore(contentSection, progressSection.nextSibling);
        
        // Show the content section
        contentSection.style.display = 'block';
    }
}

// Initialize the web app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WebApp();
});
