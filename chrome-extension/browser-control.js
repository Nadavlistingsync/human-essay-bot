// Browser Control Content Script for EssayForge Chrome Extension
class BrowserControlContentScript {
    constructor() {
        this.isRecording = false;
        this.setupMessageListener();
        this.setupPageInteraction();
        this.setupContextMenuHandler();
        this.setupAutomaticFeedback();
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true;
        });
    }

    async handleMessage(message, sender, sendResponse) {
        try {
            switch (message.action) {
                case 'clickElement':
                    const clicked = await this.clickElement(message.selector);
                    sendResponse({ success: clicked });
                    break;
                case 'fillForm':
                    await this.fillForm(message.data);
                    sendResponse({ success: true });
                    break;
                case 'scrollPage':
                    await this.scrollPage(message.direction);
                    sendResponse({ success: true });
                    break;
                case 'getPageInfo':
                    const pageInfo = await this.getPageInfo();
                    sendResponse({ success: true, pageInfo });
                    break;
                case 'executeScript':
                    const result = await this.executeScript(message.code);
                    sendResponse({ success: true, result });
                    break;
                case 'startRecording':
                    this.isRecording = true;
                    sendResponse({ success: true });
                    break;
                case 'stopRecording':
                    this.isRecording = false;
                    sendResponse({ success: true });
                    break;
                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async clickElement(selector) {
        try {
            const element = document.querySelector(selector);
            if (element) {
                // Record the action if recording is active
                if (this.isRecording) {
                    await this.recordAction('clickElement', { selector });
                }
                
                element.click();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error clicking element:', error);
            return false;
        }
    }

    async fillForm(formData) {
        try {
            Object.entries(formData).forEach(([selector, value]) => {
                const element = document.querySelector(selector);
                if (element) {
                    element.value = value;
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
            
            // Record the action if recording is active
            if (this.isRecording) {
                await this.recordAction('fillForm', { formData });
            }
        } catch (error) {
            console.error('Error filling form:', error);
        }
    }

    async scrollPage(direction) {
        try {
            const scrollAmount = direction === 'up' ? -500 : 500;
            window.scrollBy(0, scrollAmount);
            
            // Record the action if recording is active
            if (this.isRecording) {
                await this.recordAction('scrollPage', { direction });
            }
        } catch (error) {
            console.error('Error scrolling page:', error);
        }
    }

    async getPageInfo() {
        try {
            const info = {
                title: document.title,
                url: window.location.href,
                domain: window.location.hostname,
                wordCount: document.body.innerText.split(' ').length,
                imageCount: document.images.length,
                linkCount: document.links.length,
                formCount: document.forms.length,
                inputCount: document.querySelectorAll('input').length,
                buttonCount: document.querySelectorAll('button').length,
                timestamp: Date.now()
            };

            // Record the action if recording is active
            if (this.isRecording) {
                await this.recordAction('getPageInfo', info);
            }

            return info;
        } catch (error) {
            console.error('Error getting page info:', error);
            return null;
        }
    }

    async executeScript(code) {
        try {
            const result = eval(code);
            
            // Record the action if recording is active
            if (this.isRecording) {
                await this.recordAction('executeScript', { code, result });
            }
            
            return result;
        } catch (error) {
            console.error('Error executing script:', error);
            throw error;
        }
    }

    setupPageInteraction() {
        // Add visual feedback for browser control actions
        this.addControlOverlay();
        
        // Monitor page changes for automatic feedback
        this.observePageChanges();
    }

    addControlOverlay() {
        // Create a subtle overlay to show when browser control is active
        const overlay = document.createElement('div');
        overlay.id = 'essayforge-control-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 6px;
            padding: 8px 12px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 12px;
            color: #3b82f6;
            z-index: 10000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        overlay.textContent = 'EssayForge Browser Control Active';
        document.body.appendChild(overlay);

        // Show overlay when recording starts
        const observer = new MutationObserver(() => {
            if (this.isRecording) {
                overlay.style.opacity = '1';
            } else {
                overlay.style.opacity = '0';
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    observePageChanges() {
        // Monitor DOM changes for automatic feedback
        const observer = new MutationObserver(async (mutations) => {
            if (this.isRecording) {
                const significantChanges = mutations.filter(mutation => {
                    return mutation.type === 'childList' && 
                           mutation.addedNodes.length > 0;
                });

                if (significantChanges.length > 0) {
                    await this.recordAction('pageChange', {
                        changes: significantChanges.length,
                        timestamp: Date.now()
                    });
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style', 'data-*']
        });
    }

    setupContextMenuHandler() {
        // Handle right-click context menu actions
        document.addEventListener('contextmenu', async (event) => {
            if (this.isRecording) {
                const element = event.target;
                const selector = this.generateSelector(element);
                
                await this.recordAction('contextMenu', {
                    selector,
                    tagName: element.tagName,
                    text: element.textContent?.substring(0, 100),
                    timestamp: Date.now()
                });
            }
        });
    }

    generateSelector(element) {
        // Generate a CSS selector for the element
        if (element.id) {
            return `#${element.id}`;
        }
        
        if (element.className) {
            const classes = element.className.split(' ').filter(c => c.trim());
            if (classes.length > 0) {
                return `.${classes.join('.')}`;
            }
        }
        
        // Generate path-based selector
        const path = [];
        let current = element;
        
        while (current && current !== document.body) {
            let selector = current.tagName.toLowerCase();
            
            if (current.id) {
                selector += `#${current.id}`;
                path.unshift(selector);
                break;
            }
            
            if (current.className) {
                const classes = current.className.split(' ').filter(c => c.trim());
                if (classes.length > 0) {
                    selector += `.${classes.join('.')}`;
                }
            }
            
            const parent = current.parentElement;
            if (parent) {
                const siblings = Array.from(parent.children).filter(child => 
                    child.tagName === current.tagName
                );
                
                if (siblings.length > 1) {
                    const index = siblings.indexOf(current) + 1;
                    selector += `:nth-of-type(${index})`;
                }
            }
            
            path.unshift(selector);
            current = parent;
        }
        
        return path.join(' > ');
    }

    async recordAction(action, data) {
        try {
            await chrome.runtime.sendMessage({
                action: 'recordAction',
                actionType: action,
                data: data
            });
        } catch (error) {
            console.error('Error recording action:', error);
        }
    }

    setupAutomaticFeedback() {
        // Automatic testing and feedback loop
        this.setupPerformanceMonitoring();
        this.setupErrorReporting();
        this.setupUsageAnalytics();
    }

    setupPerformanceMonitoring() {
        // Monitor performance of browser control actions
        const originalClick = Element.prototype.click;
        Element.prototype.click = function(...args) {
            const start = performance.now();
            const result = originalClick.apply(this, args);
            const duration = performance.now() - start;
            
            if (window.essayForgeControl && window.essayForgeControl.isRecording) {
                window.essayForgeControl.recordAction('performance', {
                    action: 'click',
                    duration,
                    selector: window.essayForgeControl.generateSelector(this)
                });
            }
            
            return result;
        };
    }

    setupErrorReporting() {
        // Capture and report errors automatically
        window.addEventListener('error', async (event) => {
            if (this.isRecording) {
                await this.recordAction('error', {
                    message: event.message,
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    stack: event.error?.stack,
                    timestamp: Date.now()
                });
            }
        });

        window.addEventListener('unhandledrejection', async (event) => {
            if (this.isRecording) {
                await this.recordAction('unhandledRejection', {
                    reason: event.reason,
                    timestamp: Date.now()
                });
            }
        });
    }

    setupUsageAnalytics() {
        // Track usage patterns for automatic feedback
        let interactionCount = 0;
        
        ['click', 'keydown', 'scroll', 'resize'].forEach(eventType => {
            document.addEventListener(eventType, () => {
                interactionCount++;
                
                if (interactionCount % 10 === 0) {
                    this.recordAction('usageAnalytics', {
                        eventType,
                        count: interactionCount,
                        timestamp: Date.now()
                    });
                }
            });
        });
    }

    // Utility method to highlight elements (for debugging)
    highlightElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            const originalStyle = element.style.cssText;
            element.style.cssText += `
                outline: 2px solid #3b82f6 !important;
                outline-offset: 2px !important;
                background: rgba(59, 130, 246, 0.1) !important;
            `;
            
            setTimeout(() => {
                element.style.cssText = originalStyle;
            }, 2000);
            
            return true;
        }
        return false;
    }
}

// Initialize browser control content script
const browserControl = new BrowserControlContentScript();

// Make it globally accessible for debugging
window.essayForgeControl = browserControl;

console.log('EssayForge Browser Control Content Script loaded');
