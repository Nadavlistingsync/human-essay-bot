# EssayForge Chrome Extension - AI Essay Writer & Browser Control

A comprehensive Chrome extension that automatically writes essays in Google Docs using AI and provides full browser automation and control capabilities.

## Features

### Essay Writing
- 🤖 **AI-Powered Essay Writing**: Uses OpenAI GPT to generate high-quality essays
- 📝 **Direct Google Docs Integration**: Works directly within Google Docs
- ⚡ **Human-like Typing**: Simulates realistic typing patterns and speeds
- 🎯 **Customizable Settings**: Adjust typing speed and essay length

### Browser Control & Automation
- 🌐 **Full Browser Control**: Navigate, manage tabs, and interact with any webpage
- 📸 **Screenshot Capture**: Take screenshots of any page
- 🔖 **Bookmark Management**: Automatically bookmark pages
- 📑 **Tab Management**: Create, close, switch, and manage browser tabs
- 👆 **Element Interaction**: Click elements using CSS selectors
- 📝 **Form Automation**: Fill forms automatically
- ⬆️⬇️ **Page Navigation**: Scroll pages up and down
- 🔄 **Action Recording**: Record and playback browser actions
- 🧪 **Automated Testing**: Built-in testing framework with feedback loop
- 📊 **Performance Monitoring**: Monitor and optimize browser performance

### Security & Privacy
- 🔒 **Secure**: API key stored locally in browser
- 🛡️ **Privacy-First**: No data collection, all actions stay local
- 🔐 **Permission-Based**: Only requests necessary browser permissions

## Installation

### Method 1: Load as Unpacked Extension (Development)

1. **Download the extension files** to your computer
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable Developer mode** (toggle in top right)
4. **Click "Load unpacked"** and select the `chrome-extension` folder
5. **Pin the extension** to your toolbar for easy access

### Method 2: Install from Chrome Web Store (Coming Soon)

*The extension will be available on the Chrome Web Store soon.*

## Setup

### Getting Your OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to the API Keys section
4. Create a new API key
5. Copy the key (it starts with `sk-...`)

### Configuring the Extension

1. **Click the EssayForge extension icon** in your toolbar
2. **Enter your OpenAI API key** in the Settings section
3. **Click "Save API Key"**
4. You're ready to use the extension!

## How to Use

### Essay Writing
1. **Open Google Docs** in your browser
2. **Create a new document** or open an existing one
3. **Click the EssayForge extension icon** in your toolbar
4. **Enter your essay prompt** in the popup
5. **Choose your settings** (typing speed, essay length)
6. **Click "Start Writing Essay"**
7. **Watch the AI write your essay** in real-time!

### Browser Control
1. **Click the extension icon** on any webpage
2. **Use the Browser Control section** to:
   - Navigate (back, forward, refresh, new tab)
   - Take screenshots
   - Bookmark pages
   - Manage tabs
   - Scroll pages
   - Click elements using CSS selectors
   - Fill forms automatically
   - Record and playback actions

### Automation Features
1. **Start Recording**: Click "🔴 Start Recording" to capture your actions
2. **Perform Actions**: Navigate and interact with web pages normally
3. **Stop Recording**: Click "⏹️ Stop Recording" when done
4. **Playback**: Click "▶️ Playback" to replay recorded actions
5. **Monitor**: The extension automatically tests and provides feedback

## Settings

### Typing Speed
- **🐌 Slow**: Very human-like typing (200-400ms per character)
- **🚀 Medium**: Balanced speed (120-250ms per character)
- **⚡ Fast**: Quick but natural typing (80-150ms per character)

### Essay Length
- **📄 Short**: 300-500 words
- **📝 Medium**: 500-800 words
- **📚 Long**: 800-1200 words

## Privacy & Security

- **Your API Key**: Stored securely in your browser using Chrome's sync storage
- **No Data Collection**: We don't collect or store your essay content
- **Direct API Calls**: All AI requests go directly to OpenAI
- **Secure**: Uses HTTPS for all API communications
- **Local Storage**: All settings and data remain on your device

## Advanced Features

### Automated Testing & Feedback
The extension includes a comprehensive testing framework that:
- Automatically tests all browser control features
- Monitors performance and provides feedback
- Detects and reports issues
- Suggests optimizations
- Runs continuous testing every 5 minutes

### Browser Control API
The extension provides a powerful API for browser automation:

```javascript
// Navigate to a URL
chrome.runtime.sendMessage({
    action: 'navigate',
    url: 'https://example.com'
});

// Click an element
chrome.runtime.sendMessage({
    action: 'clickElement',
    selector: '#button'
});

// Fill a form
chrome.runtime.sendMessage({
    action: 'fillForm',
    data: {
        '#username': 'user@example.com',
        '#password': 'password123'
    }
});

// Take a screenshot
chrome.runtime.sendMessage({
    action: 'takeScreenshot'
});
```

## Troubleshooting

### Extension Not Working?
- Make sure you're on a webpage (for browser control) or Google Docs (for essay writing)
- Check that your API key is correctly set (for essay writing)
- Try refreshing the page
- Ensure you have an active internet connection
- Check browser permissions in `chrome://extensions/`

### API Issues?
- Make sure your OpenAI API key is correctly entered and saved
- Check that your API key has available credits
- Verify your internet connection is stable
- Check the browser console for specific error messages

### Browser Control Issues?
- Ensure the extension has necessary permissions
- Try reloading the extension in `chrome://extensions/`
- Check that the target elements exist on the page
- Verify CSS selectors are correct
- Check the browser console for error messages

### Performance Issues?
- The extension automatically monitors performance
- Check the test results in the browser console
- Use the automated testing framework to identify issues
- Consider reducing the frequency of automated actions

## Support

For issues or questions:
- Check the troubleshooting section above
- Review the console logs for error messages
- Ensure all requirements are met

## Development

To modify or extend the extension:

1. **Clone the repository**
2. **Make your changes** to the source files
3. **Reload the extension** in Chrome (`chrome://extensions/`)
4. **Test your changes** in Google Docs

### File Structure
```
chrome-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup interface
├── popup.css             # Popup styles
├── popup.js              # Popup functionality
├── content.js            # Google Docs integration
├── content.css           # Content script styles
├── background.js         # Background service worker with browser control
├── browser-control.js    # Browser control content script
├── auto-test.js          # Automated testing framework
├── icons/                # Extension icons
└── README.md             # This file
```

## License

This project is licensed under the MIT License.
