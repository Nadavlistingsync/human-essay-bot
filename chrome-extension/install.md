# EssayForge Chrome Extension - Installation Guide

## 📦 Installation Steps

### Step 1: Download the Extension

1. Download or clone this repository to your local machine
2. Locate the `chrome-extension` folder

### Step 2: Load Extension in Chrome

1. Open Google Chrome browser
2. Navigate to `chrome://extensions/` in the address bar
3. Enable **Developer mode** by clicking the toggle in the top-right corner
4. Click the **"Load unpacked"** button
5. Navigate to and select the `chrome-extension` folder
6. The extension should now appear in your extensions list

### Step 3: Pin the Extension (Optional but Recommended)

1. Click the puzzle piece icon (🧩) in Chrome's toolbar
2. Find "EssayForge - AI Essay Writer"
3. Click the pin icon (📌) to pin it to your toolbar

### Step 4: Configure Your API Key

1. Click the EssayForge extension icon in your toolbar
2. In the Settings section, enter your OpenAI API key
   - Get your API key from: https://platform.openai.com/api-keys
   - The key should start with `sk-`
3. Click "Save API Key"
4. You should see a success message

### Step 5: Test the Extension

1. Open a new Google Doc: https://docs.google.com/
2. Create a new document
3. Click the EssayForge extension icon
4. Enter a test prompt like: "Write a short essay about technology"
5. Select your preferred settings
6. Click "Start Writing Essay"
7. Watch the AI write in your document!

## 🔧 Troubleshooting

### Extension Won't Load
- Make sure all files are in the `chrome-extension` folder
- Check that `manifest.json` exists in the folder
- Try reloading the extension from `chrome://extensions/`

### Icon Not Visible
- The extension only shows on Google Docs pages
- Make sure you're on `https://docs.google.com/document/...`
- Try refreshing the page

### API Key Not Saving
- Check browser console for errors (F12)
- Make sure you have Chrome Sync enabled
- Try clearing browser cache and reloading extension

### Typing Not Working
- Ensure the Google Doc is fully loaded
- Click inside the document editor before starting
- Check that the document is not in read-only mode
- Try the test page: `chrome-extension/test-google-docs.html`

## 🔐 Security Notes

- Your API key is stored locally using Chrome's secure storage
- The extension only runs on Google Docs pages
- No data is sent to any server except OpenAI's API
- All communication uses HTTPS encryption

## 🚀 Next Steps

Once installed and configured:

1. Open any Google Doc
2. Use the extension to write essays on any topic
3. Customize typing speed and length to your preferences
4. Enjoy AI-powered essay writing!

## 📝 Getting an OpenAI API Key

1. Visit https://platform.openai.com/
2. Sign up or log in
3. Go to API Keys section
4. Click "Create new secret key"
5. Copy the key (save it somewhere safe, you won't see it again!)
6. Add billing information if needed
7. Paste the key into the extension settings

## 💡 Tips

- **Testing**: Use the included `test-google-docs.html` file to test locally
- **Speed**: Start with "Medium" speed for best balance
- **Length**: Try "Short" essays first to test functionality
- **Prompts**: Be specific in your prompts for better results

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review browser console logs (F12 → Console)
3. Ensure OpenAI API key has available credits
4. Try disabling other extensions that might interfere
5. Reload the extension from `chrome://extensions/`

## 🔄 Updating the Extension

When updates are available:

1. Download the latest version
2. Go to `chrome://extensions/`
3. Remove the old version
4. Load the new version using "Load unpacked"
5. Your API key and settings will be preserved

## ✅ Verification Checklist

Before using:
- [ ] Extension loaded in Chrome
- [ ] Developer mode enabled
- [ ] Extension icon visible/pinned
- [ ] OpenAI API key entered and saved
- [ ] Tested on a Google Doc
- [ ] Typing simulation works

Congratulations! You're ready to use EssayForge! 🎉
