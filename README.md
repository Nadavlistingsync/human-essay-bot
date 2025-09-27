# Human Essay Bot - Web App

AI-powered essay writing bot that types like a human in Google Docs. This web application helps students write essays with natural, human-like typing patterns and integrates seamlessly with Google Docs.

## Features

- 🌐 **Web-Based Application**: No downloads required - runs directly in your browser
- 🤖 **AI-Powered Essay Generation**: Uses OpenAI's GPT-4 to generate high-quality essays
- ⌨️ **Human-Like Typing**: Simulates natural typing patterns with realistic delays, typos, and corrections
- 📝 **Google Docs Integration**: Types directly into existing Google Docs or creates new ones
- 🎨 **Writing Style Learning**: Analyzes your past writings to match your personal style
- ⚙️ **Customizable Settings**: Adjust typing speed and other preferences
- 💾 **Auto-Save Settings**: Remembers your preferences between sessions

## Quick Start

### For Students (Browser-Based - Recommended)

1. **Go to the Essay Bot page**:
   - Visit `http://localhost:3000` (if running locally)
   - Or use the GitHub Pages version: `https://nadavlistingsync.github.io/human-essay-bot`

2. **Install the Browser Extension**:
   - Drag the blue "🤖 Human Essay Bot" button to your bookmarks bar
   - Or copy the JavaScript code and paste it in your browser console

3. **Use on Google Docs**:
   - Go to your Google Doc
   - Click the bookmark to activate the Essay Bot
   - Enter your essay prompt and OpenAI API key
   - Click "Start Writing" and watch it type naturally!

### For Developers (Local Setup)

1. **Start the Web App**:
   ```bash
   npm start
   ```

2. **Open in Browser**:
   - Go to `http://localhost:3000`
   - No installation required!

3. **Set Up API Key** (One-time setup):
   ```bash
   cp env.example .env
   # Edit .env and add your OpenAI API key
   ```

## How to Use with Teacher's Document

### Browser-Based Method (Recommended for Students)

1. **Go to Your Google Doc**: 
   - Open the Google Doc your teacher assigned
   - Make sure you're logged into your Google account

2. **Activate the Essay Bot**:
   - Click the "🤖 Human Essay Bot" bookmark in your bookmarks bar
   - Or paste the JavaScript code in your browser console (F12)

3. **Write Your Essay**:
   - Enter your essay prompt in the blue panel that appears
   - Paste your OpenAI API key
   - Choose your typing speed
   - Click "🚀 Start Writing"
   - Watch as the bot types naturally into your document!

### Server-Based Method (For Advanced Users)

1. **Get the Google Doc URL**: 
   - Open the Google Doc your teacher assigned
   - Copy the URL from your browser's address bar
   - It should look like: `https://docs.google.com/document/d/1ABC.../edit`

2. **Paste in the Web App**:
   - Paste this URL in the "Google Doc URL" field
   - The bot will navigate to your document and type directly into it

3. **Start Writing**:
   - Enter your essay prompt
   - Click "Start Writing Essay"
   - The bot will open the document and begin typing like a human would

## Writing Style Learning

1. **Upload Past Writings**:
   - Drag and drop your previous essays or papers
   - Or click to upload .txt or .md files
   - The AI will analyze your writing style

2. **Style Analysis**:
   - The app detects your formality level
   - Analyzes sentence structure and vocabulary
   - Matches your personal writing tone

3. **Automatic Style Matching**:
   - New essays will be written in your style
   - Maintains consistency with your past work
   - Helps avoid AI detection

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# OpenAI API Configuration (Required)
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Custom settings
DEFAULT_TYPING_SPEED=human-like
DEFAULT_BROWSER_TIMEOUT=30000
```

### Typing Speed Options

- **Human-like** (Recommended): Natural typing with realistic pauses
- **Slow & Deliberate**: More thoughtful, slower typing
- **Fast Typist**: Quick typing for experienced typists

## Usage Instructions

1. **Enter Essay Prompt**: Describe what you want to write about
2. **Configure Settings**: Choose typing speed and upload writing samples
3. **Add Google Doc URL**: Paste your teacher's document link (optional)
4. **Start Writing**: Click the button and watch the magic happen!

## Technical Details

- **Backend**: Node.js with Express
- **Browser Automation**: Puppeteer for Google Docs interaction
- **AI**: OpenAI GPT-4 for essay generation
- **Frontend**: Vanilla JavaScript with modern CSS
- **File Handling**: Drag-and-drop support for style analysis

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd human-essay-bot

# Install dependencies
npm install

# Set up environment
cp env.example .env
# Edit .env with your OpenAI API key

# Start the web app
npm start
```

## Scripts

- `npm start` - Start the web application
- `npm run start-desktop` - Start the desktop Electron version
- `npm run build` - Build desktop app for distribution

## Important Notes

⚠️ **Educational Use Only**: This tool is designed for educational purposes. Always follow your institution's academic integrity policies.

🔐 **Privacy**: Your OpenAI API key is stored server-side and never shared. Your writing samples are analyzed locally.

🌐 **Browser Compatibility**: Works best with Chrome, Firefox, Safari, and Edge.

## Troubleshooting

### Common Issues

1. **"OpenAI API key not provided"**:
   - Make sure your `.env` file exists and contains a valid API key
   - Restart the server after adding the key

2. **Browser doesn't open**:
   - Check if Chrome/Chromium is installed
   - The app runs headless by default for security

3. **Google Docs access denied**:
   - Make sure you're logged into Google in your default browser
   - Check if the document URL is correct and accessible

### Getting Help

If you encounter issues:
1. Check the console logs in your browser (F12)
2. Check the server logs in your terminal
3. Ensure all dependencies are installed correctly

## License

MIT License - Use responsibly and follow academic integrity guidelines.

---

**Remember**: This tool is designed to help students learn and improve their writing skills. Always use it ethically and in accordance with your school's policies.
