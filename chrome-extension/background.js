// Background script for EssayForge Chrome Extension
chrome.runtime.onInstalled.addListener(() => {
    console.log('EssayForge extension installed');
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'progress') {
        // Forward progress updates to popup if it's open
        chrome.runtime.sendMessage(message);
    } else if (message.type === 'complete') {
        // Show notification when essay is complete
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'EssayForge',
            message: 'Essay writing completed successfully!'
        });
    } else if (message.type === 'error') {
        // Show error notification
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'EssayForge Error',
            message: message.error || 'An error occurred while writing the essay'
        });
    }
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
