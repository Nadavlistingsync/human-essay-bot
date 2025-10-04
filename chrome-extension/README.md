# EssayForge Chrome Extension

A Chrome extension that automatically writes essays in Google Docs using AI.

## Features

- 🤖 **AI-Powered Essay Writing**: Uses OpenAI GPT to generate high-quality essays
- 📝 **Direct Google Docs Integration**: Works directly within Google Docs
- ⚡ **Human-like Typing**: Simulates realistic typing patterns and speeds
- 🎯 **Customizable Settings**: Adjust typing speed and essay length
- 🔒 **Secure**: API key stored locally in browser
- 📱 **Modern UI**: Clean, professional interface

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

1. **Open Google Docs** in your browser
2. **Create a new document** or open an existing one
3. **Click the EssayForge extension icon** in your toolbar
4. **Enter your essay prompt** in the popup
5. **Choose your settings** (typing speed, essay length)
6. **Click "Start Writing Essay"**
7. **Watch the AI write your essay** in real-time!

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

## Troubleshooting

### Extension Not Working?
- Make sure you're on a Google Docs page
- Check that your API key is correctly set
- Try refreshing the Google Docs page
- Ensure you have an active internet connection

### API Issues?
- Make sure your OpenAI API key is correctly entered and saved
- Check that your API key has available credits
- Verify your internet connection is stable
- Check the browser console for specific error messages

### Typing Not Working?
- Ensure the Google Docs editor is focused
- Try clicking in the document area first
- Check that the document is not in read-only mode

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
├── background.js         # Background service worker
├── icons/                # Extension icons
└── README.md             # This file
```

## License

This project is licensed under the MIT License.
