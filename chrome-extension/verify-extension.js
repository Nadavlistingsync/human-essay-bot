#!/usr/bin/env node

/**
 * Extension Verification Script
 * Verifies that all required files exist and are properly configured
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

// Required files
const requiredFiles = [
    'manifest.json',
    'popup.html',
    'popup.css',
    'popup.js',
    'content.js',
    'content.css',
    'background.js',
    'README.md',
    'install.md',
    'icons/icon16.png',
    'icons/icon32.png',
    'icons/icon48.png',
    'icons/icon128.png'
];

// Test results
let passed = 0;
let failed = 0;
let warnings = 0;

console.log('\n' + '='.repeat(60));
log('🔍 EssayForge Extension Verification', 'bold');
console.log('='.repeat(60) + '\n');

// Test 1: Check if all required files exist
logInfo('Test 1: Checking required files...');
requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        logSuccess(`${file} exists`);
        passed++;
    } else {
        logError(`${file} is missing`);
        failed++;
    }
});

// Test 2: Validate manifest.json
logInfo('\nTest 2: Validating manifest.json...');
try {
    const manifestPath = path.join(__dirname, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    if (manifest.manifest_version === 3) {
        logSuccess('Manifest version 3 ✓');
        passed++;
    } else {
        logError('Invalid manifest version');
        failed++;
    }
    
    if (manifest.permissions && manifest.permissions.includes('notifications')) {
        logSuccess('Notifications permission present ✓');
        passed++;
    } else {
        logWarning('Notifications permission missing');
        warnings++;
    }
    
    if (manifest.permissions && manifest.permissions.includes('storage')) {
        logSuccess('Storage permission present ✓');
        passed++;
    } else {
        logError('Storage permission missing');
        failed++;
    }
    
    if (manifest.action && manifest.action.default_popup) {
        logSuccess('Popup configured ✓');
        passed++;
    } else {
        logError('Popup not configured');
        failed++;
    }
    
} catch (error) {
    logError(`Error reading manifest.json: ${error.message}`);
    failed++;
}

// Test 3: Check icon files
logInfo('\nTest 3: Checking icon files...');
const iconSizes = [16, 32, 48, 128];
iconSizes.forEach(size => {
    const iconPath = path.join(__dirname, 'icons', `icon${size}.png`);
    if (fs.existsSync(iconPath)) {
        const stats = fs.statSync(iconPath);
        if (stats.size > 0) {
            logSuccess(`icon${size}.png is valid (${stats.size} bytes)`);
            passed++;
        } else {
            logError(`icon${size}.png is empty`);
            failed++;
        }
    } else {
        logError(`icon${size}.png not found`);
        failed++;
    }
});

// Test 4: Check for hardcoded API keys (security check)
logInfo('\nTest 4: Security check - scanning for hardcoded API keys...');
const filesToCheck = ['content.js', 'popup.js', 'background.js'];
let foundHardcodedKey = false;

filesToCheck.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        // Look for patterns like sk-... or hardcoded OpenAI keys
        if (content.match(/sk-[a-zA-Z0-9]{20,}/)) {
            logError(`Potential hardcoded API key found in ${file}`);
            foundHardcodedKey = true;
            failed++;
        }
    }
});

if (!foundHardcodedKey) {
    logSuccess('No hardcoded API keys found ✓');
    passed++;
}

// Test 5: Check popup.js for API key management
logInfo('\nTest 5: Checking API key management...');
try {
    const popupJs = fs.readFileSync(path.join(__dirname, 'popup.js'), 'utf8');
    
    if (popupJs.includes('saveApiKey')) {
        logSuccess('API key save function present ✓');
        passed++;
    } else {
        logError('API key save function missing');
        failed++;
    }
    
    if (popupJs.includes('chrome.storage.sync')) {
        logSuccess('Chrome storage API used ✓');
        passed++;
    } else {
        logError('Chrome storage API not used');
        failed++;
    }
    
} catch (error) {
    logError(`Error checking popup.js: ${error.message}`);
    failed++;
}

// Test 6: Check content.js for typing simulation
logInfo('\nTest 6: Checking typing simulation...');
try {
    const contentJs = fs.readFileSync(path.join(__dirname, 'content.js'), 'utf8');
    
    if (contentJs.includes('simulateTyping')) {
        logSuccess('Typing simulation function present ✓');
        passed++;
    } else {
        logError('Typing simulation function missing');
        failed++;
    }
    
    if (contentJs.includes('execCommand') || contentJs.includes('KeyboardEvent')) {
        logSuccess('Typing event handling present ✓');
        passed++;
    } else {
        logError('Typing event handling missing');
        failed++;
    }
    
    if (contentJs.includes('findGoogleDocsEditor')) {
        logSuccess('Google Docs detection present ✓');
        passed++;
    } else {
        logError('Google Docs detection missing');
        failed++;
    }
    
} catch (error) {
    logError(`Error checking content.js: ${error.message}`);
    failed++;
}

// Test 7: Check documentation
logInfo('\nTest 7: Checking documentation...');
const docFiles = ['README.md', 'install.md', 'TESTING.md'];
docFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.size > 100) {
            logSuccess(`${file} exists and has content`);
            passed++;
        } else {
            logWarning(`${file} exists but may be incomplete`);
            warnings++;
        }
    } else {
        logError(`${file} not found`);
        failed++;
    }
});

// Test 8: Check for test files
logInfo('\nTest 8: Checking test files...');
if (fs.existsSync(path.join(__dirname, 'test-google-docs.html'))) {
    logSuccess('Test page exists ✓');
    passed++;
} else {
    logWarning('Test page not found');
    warnings++;
}

// Summary
console.log('\n' + '='.repeat(60));
log('📊 Verification Summary', 'bold');
console.log('='.repeat(60));
logSuccess(`Passed: ${passed}`);
logError(`Failed: ${failed}`);
logWarning(`Warnings: ${warnings}`);
console.log('='.repeat(60) + '\n');

if (failed === 0) {
    log('🎉 All critical tests passed! Extension is ready to use.', 'green');
    process.exit(0);
} else {
    log('❌ Some tests failed. Please review and fix the issues above.', 'red');
    process.exit(1);
}

