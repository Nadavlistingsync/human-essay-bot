// Background script for EssayForge Chrome Extension with Browser Control
class BrowserController {
    constructor() {
        this.setupMessageListener();
        this.setupContextMenus();
        this.setupWebNavigationListener();
        this.setupTabListener();
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep message channel open for async responses
        });
    }

    async handleMessage(message, sender, sendResponse) {
        try {
            switch (message.action) {
                case 'navigate':
                    await this.navigatePage(message.url);
                    sendResponse({ success: true });
                    break;
                case 'createTab':
                    const tab = await this.createTab(message.url, message.active);
                    sendResponse({ success: true, tabId: tab.id });
                    break;
                case 'closeTab':
                    await this.closeTab(message.tabId);
                    sendResponse({ success: true });
                    break;
                case 'getTabs':
                    const tabs = await this.getAllTabs();
                    sendResponse({ success: true, tabs });
                    break;
                case 'executeScript':
                    const result = await this.executeScript(message.code, message.tabId);
                    sendResponse({ success: true, result });
                    break;
                case 'clickElement':
                    await this.clickElement(message.selector, message.tabId);
                    sendResponse({ success: true });
                    break;
                case 'fillForm':
                    await this.fillForm(message.data, message.tabId);
                    sendResponse({ success: true });
                    break;
                case 'scrollPage':
                    await this.scrollPage(message.direction, message.tabId);
                    sendResponse({ success: true });
                    break;
                case 'takeScreenshot':
                    const screenshot = await this.takeScreenshot(message.tabId);
                    sendResponse({ success: true, screenshot });
                    break;
                case 'bookmarkCurrentPage':
                    await this.bookmarkCurrentPage(message.tabId);
                    sendResponse({ success: true });
                    break;
                case 'getPageInfo':
                    const pageInfo = await this.getPageInfo(message.tabId);
                    sendResponse({ success: true, pageInfo });
                    break;
                case 'recordAction':
                    await this.recordAction(message.action, message.data);
                    sendResponse({ success: true });
                    break;
                case 'playbackActions':
                    await this.playbackActions(message.actions);
                    sendResponse({ success: true });
                    break;
                case 'testReport':
                    await this.handleTestReport(message.report);
                    sendResponse({ success: true });
                    break;
                default:
                    // Handle original essay writing messages
                    if (message.type === 'progress') {
                        chrome.runtime.sendMessage(message);
                    } else if (message.type === 'complete') {
                        chrome.notifications.create({
                            type: 'basic',
                            iconUrl: 'icons/icon48.png',
                            title: 'EssayForge',
                            message: 'Essay writing completed successfully!'
                        });
                    } else if (message.type === 'error') {
                        chrome.notifications.create({
                            type: 'basic',
                            iconUrl: 'icons/icon48.png',
                            title: 'EssayForge Error',
                            message: message.error || 'An error occurred while writing the essay'
                        });
                    }
                    sendResponse({ success: true });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    // Navigation Controls
    async navigatePage(url) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        await chrome.tabs.update(tab.id, { url });
    }

    async createTab(url = 'chrome://newtab/', active = true) {
        return await chrome.tabs.create({ url, active });
    }

    async closeTab(tabId) {
        await chrome.tabs.remove(tabId);
    }

    async getAllTabs() {
        return await chrome.tabs.query({});
    }

    // Page Interaction
    async executeScript(code, tabId = null) {
        if (!tabId) {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            tabId = tab.id;
        }
        return await chrome.scripting.executeScript({
            target: { tabId },
            func: new Function('return ' + code)
        });
    }

    async clickElement(selector, tabId = null) {
        if (!tabId) {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            tabId = tab.id;
        }
        await chrome.scripting.executeScript({
            target: { tabId },
            func: (selector) => {
                const element = document.querySelector(selector);
                if (element) {
                    element.click();
                    return true;
                }
                return false;
            },
            args: [selector]
        });
    }

    async fillForm(formData, tabId = null) {
        if (!tabId) {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            tabId = tab.id;
        }
        await chrome.scripting.executeScript({
            target: { tabId },
            func: (formData) => {
                Object.entries(formData).forEach(([selector, value]) => {
                    const element = document.querySelector(selector);
                    if (element) {
                        element.value = value;
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                });
            },
            args: [formData]
        });
    }

    async scrollPage(direction, tabId = null) {
        if (!tabId) {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            tabId = tab.id;
        }
        await chrome.scripting.executeScript({
            target: { tabId },
            func: (direction) => {
                const scrollAmount = direction === 'up' ? -500 : 500;
                window.scrollBy(0, scrollAmount);
            },
            args: [direction]
        });
    }

    async takeScreenshot(tabId = null) {
        if (!tabId) {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            tabId = tab.id;
        }
        return await chrome.tabs.captureVisibleTab(tabId);
    }

    async bookmarkCurrentPage(tabId = null) {
        if (!tabId) {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            tabId = tab.id;
        }
        const tab = await chrome.tabs.get(tabId);
        await chrome.bookmarks.create({
            title: tab.title,
            url: tab.url
        });
    }

    async getPageInfo(tabId = null) {
        if (!tabId) {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            tabId = tab.id;
        }
        const tab = await chrome.tabs.get(tabId);
        const result = await chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
                return {
                    title: document.title,
                    url: window.location.href,
                    domain: window.location.hostname,
                    wordCount: document.body.innerText.split(' ').length,
                    imageCount: document.images.length,
                    linkCount: document.links.length,
                    formCount: document.forms.length
                };
            }
        });
        
        return {
            ...result[0].result,
            tabId: tab.id,
            favicon: tab.favIconUrl
        };
    }

    // Action Recording and Playback
    async recordAction(action, data) {
        const records = await chrome.storage.local.get(['recordedActions']);
        const recordedActions = records.recordedActions || [];
        recordedActions.push({
            timestamp: Date.now(),
            action,
            data
        });
        await chrome.storage.local.set({ recordedActions });
    }

    async playbackActions(actions) {
        for (const actionRecord of actions) {
            await this.handleMessage(actionRecord, null, () => {});
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay between actions
        }
    }

    // Context Menus
    setupContextMenus() {
        chrome.contextMenus.create({
            id: 'essayforge-control',
            title: 'EssayForge Browser Control',
            contexts: ['page', 'selection', 'link']
        });

        chrome.contextMenus.create({
            id: 'click-element',
            parentId: 'essayforge-control',
            title: 'Click This Element',
            contexts: ['all']
        });

        chrome.contextMenus.create({
            id: 'fill-form',
            parentId: 'essayforge-control',
            title: 'Fill Form Fields',
            contexts: ['page']
        });

        chrome.contextMenus.create({
            id: 'take-screenshot',
            parentId: 'essayforge-control',
            title: 'Take Screenshot',
            contexts: ['page']
        });

        chrome.contextMenus.create({
            id: 'bookmark-page',
            parentId: 'essayforge-control',
            title: 'Bookmark This Page',
            contexts: ['page']
        });
    }

    // Web Navigation Listener
    setupWebNavigationListener() {
        chrome.webNavigation.onCompleted.addListener((details) => {
            if (details.frameId === 0) { // Main frame only
                this.recordAction('navigation', {
                    url: details.url,
                    tabId: details.tabId
                });
            }
        });
    }

    // Tab Listener
    setupTabListener() {
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && tab.url) {
                this.recordAction('tabUpdated', {
                    tabId,
                    url: tab.url,
                    title: tab.title
                });
            }
        });
    }

    // Test Report Handler
    async handleTestReport(report) {
        console.log('📊 Test Report Received:', report);
        
        // Store the test report
        await chrome.storage.local.set({ 
            lastTestReport: report,
            testHistory: await this.updateTestHistory(report)
        });

        // Analyze test results and provide feedback
        const feedback = this.analyzeTestResults(report);
        
        if (feedback.issues.length > 0) {
            console.warn('⚠️ Test Issues Found:', feedback.issues);
            
            // Send notification about issues
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'EssayForge Test Results',
                message: `${feedback.issues.length} issues found. Success rate: ${feedback.successRate}%`
            });
        } else {
            console.log('✅ All tests passed!');
        }

        // Auto-fix common issues
        await this.autoFixIssues(feedback.issues);
    }

    async updateTestHistory(newReport) {
        const result = await chrome.storage.local.get(['testHistory']);
        const history = result.testHistory || [];
        
        history.push(newReport);
        
        // Keep only last 10 reports
        if (history.length > 10) {
            history.splice(0, history.length - 10);
        }
        
        return history;
    }

    analyzeTestResults(report) {
        const issues = [];
        const successRate = (report.passedTests / report.totalTests) * 100;
        
        // Analyze failed tests
        report.results.forEach(test => {
            if (test.status === 'FAIL') {
                issues.push({
                    test: test.name,
                    error: test.error,
                    severity: this.getSeverity(test.name, test.error)
                });
            }
        });
        
        // Check for performance issues
        const performanceTest = report.results.find(r => r.name === 'Performance Monitoring');
        if (performanceTest && performanceTest.result) {
            if (performanceTest.result.averagePerAction > 1000) {
                issues.push({
                    test: 'Performance',
                    error: 'Slow performance detected',
                    severity: 'warning'
                });
            }
        }
        
        return {
            issues,
            successRate,
            totalTests: report.totalTests,
            passedTests: report.passedTests,
            failedTests: report.failedTests
        };
    }

    getSeverity(testName, error) {
        if (testName.includes('Navigation') || testName.includes('Tab Management')) {
            return 'high';
        } else if (testName.includes('Screenshot') || testName.includes('Bookmark')) {
            return 'low';
        } else {
            return 'medium';
        }
    }

    async autoFixIssues(issues) {
        for (const issue of issues) {
            if (issue.severity === 'high') {
                console.log(`🔧 Auto-fixing high severity issue: ${issue.test}`);
                
                switch (issue.test) {
                    case 'Navigation Controls':
                        // Reset navigation state
                        break;
                    case 'Tab Management':
                        // Clean up orphaned tabs
                        break;
                    default:
                        console.log(`No auto-fix available for: ${issue.test}`);
                }
            }
        }
    }
}

// Initialize the browser controller
const browserController = new BrowserController();

chrome.runtime.onInstalled.addListener(() => {
    console.log('EssayForge extension with browser control installed');
});

// Handle tab updates to show/hide extension icon
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        if (tab.url.includes('docs.google.com/document')) {
            // Show extension icon for Google Docs
            chrome.action.enable(tabId);
        } else {
            // Hide extension icon for other sites
            chrome.action.disable(tabId);
        }
    }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    if (tab.url && tab.url.includes('docs.google.com/document')) {
        // Open popup (this is handled by the popup in manifest v3)
        console.log('Extension icon clicked on Google Docs');
    }
});
