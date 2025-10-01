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
            generateBtn: document.getElementById('generate-btn'),
            stopBtn: document.getElementById('stop-btn'),
            progressSection: document.getElementById('progress-section'),
            progressFill: document.getElementById('progress-fill'),
            progressText: document.getElementById('progress-text'),
            currentSentence: document.getElementById('current-sentence'),
            statusCard: document.getElementById('status-card'),
            // New Composite-like elements
            newProjectBtn: document.getElementById('new-project-btn'),
            projectGrid: document.getElementById('project-grid'),
            templatesSection: document.getElementById('templates-section'),
            saveDraftBtn: document.getElementById('save-draft-btn'),
            exportBtn: document.getElementById('export-btn'),
            shareBtn: document.getElementById('share-btn'),
            modeBtns: document.querySelectorAll('.mode-btn'),
            templateCards: document.querySelectorAll('.template-card')
        };
    }

    setupEventListeners() {
        this.elements.startBtn.addEventListener('click', () => this.startWriting());
        this.elements.generateBtn.addEventListener('click', () => this.generateEssayOnly());
        this.elements.stopBtn.addEventListener('click', () => this.stopWriting());
        
        // New Composite-like event listeners
        if (this.elements.newProjectBtn) {
            this.elements.newProjectBtn.addEventListener('click', () => this.createNewProject());
        }
        
        if (this.elements.saveDraftBtn) {
            this.elements.saveDraftBtn.addEventListener('click', () => this.saveDraft());
        }
        
        if (this.elements.exportBtn) {
            this.elements.exportBtn.addEventListener('click', () => this.exportEssay());
        }
        
        if (this.elements.shareBtn) {
            this.elements.shareBtn.addEventListener('click', () => this.shareEssay());
        }
        
        // Mode buttons
        this.elements.modeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchMode(e.target.dataset.mode));
        });
        
        // Template cards
        this.elements.templateCards.forEach(card => {
            card.addEventListener('click', (e) => this.selectTemplate(e.currentTarget.dataset.template));
        });

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

    async generateEssayOnly() {
        if (this.isWriting) return;

        const prompt = this.elements.essayPrompt.value.trim();

        if (!prompt) {
            this.updateStatus('error', 'Please enter an essay prompt.');
            return;
        }

        this.isWriting = true;
        this.updateUI(true);
        this.updateStatus('info', 'Generating essay content...');

        try {
            console.log('Making API request to /api/generate-essay-simple');
            
            const response = await fetch('/api/generate-essay-simple', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt })
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('API response:', result);

            if (result.success) {
                this.updateStatus('success', result.message);
                this.showGeneratedContent(result.content);
            } else {
                this.updateStatus('error', `Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Generate essay error:', error);
            this.updateStatus('error', `Failed to generate essay: ${error.message}`);
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
        this.elements.generateBtn.style.display = isWriting ? 'none' : 'inline-block';
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

    // Composite-like functionality methods
    createNewProject() {
        const projectName = prompt('Enter project name:');
        if (projectName) {
            this.addProjectToGrid(projectName, 'New essay project', 'draft');
        }
    }

    addProjectToGrid(name, description, status) {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
            <div class="project-icon">📝</div>
            <h3>${name}</h3>
            <p>${description}</p>
            <div class="project-meta">
                <span class="status ${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
                <span class="date">Just now</span>
            </div>
        `;
        
        if (this.elements.projectGrid) {
            this.elements.projectGrid.insertBefore(projectCard, this.elements.projectGrid.firstChild);
        }
    }

    switchMode(mode) {
        // Update active mode button
        this.elements.modeBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            }
        });

        // Show/hide relevant sections
        if (mode === 'template') {
            if (this.elements.templatesSection) {
                this.elements.templatesSection.style.display = 'block';
            }
        } else {
            if (this.elements.templatesSection) {
                this.elements.templatesSection.style.display = 'none';
            }
        }

        console.log(`Switched to ${mode} mode`);
    }

    selectTemplate(templateType) {
        const templates = {
            argumentative: "Write an argumentative essay about [topic]. Present a clear thesis statement, provide evidence to support your position, address counterarguments, and conclude with a strong restatement of your position.",
            persuasive: "Write a persuasive essay about [topic]. Use emotional appeals, logical reasoning, and credible evidence to convince your audience to adopt your viewpoint or take action.",
            expository: "Write an expository essay about [topic]. Explain the topic clearly, provide detailed information, use examples and evidence, and present the information in a logical, organized manner.",
            narrative: "Write a narrative essay about [topic]. Tell a story or describe a personal experience, use descriptive language, include dialogue if appropriate, and reflect on the significance of the experience."
        };

        if (templates[templateType]) {
            this.elements.essayPrompt.value = templates[templateType];
            this.updateStatus('info', `Selected ${templateType} template. Customize the prompt as needed.`);
        }
    }

    saveDraft() {
        const prompt = this.elements.essayPrompt.value;
        if (prompt.trim()) {
            localStorage.setItem('essayDraft', prompt);
            this.updateStatus('success', 'Draft saved successfully!');
        } else {
            this.updateStatus('error', 'No content to save as draft.');
        }
    }

    exportEssay() {
        const content = document.querySelector('.content-text');
        if (content) {
            const text = content.textContent;
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'essay.txt';
            a.click();
            URL.revokeObjectURL(url);
            this.updateStatus('success', 'Essay exported successfully!');
        } else {
            this.updateStatus('error', 'No essay content to export.');
        }
    }

    shareEssay() {
        const content = document.querySelector('.content-text');
        if (content) {
            const text = content.textContent;
            if (navigator.share) {
                navigator.share({
                    title: 'My Essay',
                    text: text
                });
            } else {
                navigator.clipboard.writeText(text).then(() => {
                    this.updateStatus('success', 'Essay copied to clipboard for sharing!');
                });
            }
        } else {
            this.updateStatus('error', 'No essay content to share.');
        }
    }
}

// Initialize the web app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WebApp();
});
