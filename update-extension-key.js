#!/usr/bin/env node

// Script to update the Chrome extension with the API key from .env file
const fs = require('fs');
const path = require('path');

// Read the .env file
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Extract the API key
const apiKeyMatch = envContent.match(/OPENAI_API_KEY=(.+)/);
if (!apiKeyMatch) {
    console.error('❌ Could not find OPENAI_API_KEY in .env file');
    process.exit(1);
}

const apiKey = apiKeyMatch[1].trim();
console.log('✅ Found API key in .env file');

// Copy template to content.js first
const templatePath = path.join(__dirname, 'chrome-extension', 'content.js.template');
const contentJsPath = path.join(__dirname, 'chrome-extension', 'content.js');
fs.copyFileSync(templatePath, contentJsPath);

// Update the content.js file
let contentJs = fs.readFileSync(contentJsPath, 'utf8');

// Replace the API key in the content script
const apiKeyRegex = /const apiKey = 'REPLACE_WITH_API_KEY_FROM_ENV';/;
const newApiKeyLine = `const apiKey = '${apiKey}';`;

if (apiKeyRegex.test(contentJs)) {
    contentJs = contentJs.replace(apiKeyRegex, newApiKeyLine);
    fs.writeFileSync(contentJsPath, contentJs);
    console.log('✅ Updated Chrome extension with API key from .env');
} else {
    console.error('❌ Could not find API key line in content.js');
    process.exit(1);
}

// Create a new zip file with updated extension
const { execSync } = require('child_process');
try {
    execSync('cd chrome-extension && zip -r ../essayforge-extension-updated.zip .', { stdio: 'inherit' });
    console.log('✅ Created updated extension zip file: essayforge-extension-updated.zip');
} catch (error) {
    console.error('❌ Error creating zip file:', error.message);
}

console.log('🎉 Extension updated successfully!');
console.log('📦 Ready to share: essayforge-extension-updated.zip');
