# 🤖 Human Essay Bot

An AI-powered desktop application that writes essays in Google Docs with human-like typing patterns and writing styles.

## ✨ Features

- **Human-like Typing**: Realistic typing speeds, pauses, and occasional typos with corrections
- **Writing Style Learning**: Upload your past writings to learn and mimic your unique writing style
- **Seamless Integration**: Works directly in Google Docs using your account
- **Anti-Detection**: Natural behavior patterns that appear completely human
- **Easy Interface**: Simple drag-and-drop prompt input with one-click operation

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed
- OpenAI API key
- Google account access

### Installation

1. **Clone or download** this repository
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Get your OpenAI API key** from [OpenAI Platform](https://platform.openai.com/api-keys)

4. **Run the application**:
   ```bash
   npm start
   ```

## 📖 How to Use

### 1. Setup Writing Style (Optional)
- Drag and drop your past writings (`.txt` or `.md` files) into the upload area
- The AI will analyze your writing patterns, vocabulary, and style
- This ensures the generated essay matches your unique writing voice

### 2. Configure Settings
- **Typing Speed**: Choose between slow, human-like, or fast typing
- **OpenAI API Key**: Enter your API key (saved locally for future use)

### 3. Write Your Essay
- Enter your essay prompt in the text area
- Click "🚀 Start Writing Essay"
- The bot will:
  - Open Google Docs in your browser
  - Wait for you to log in (if needed)
  - Generate an essay using your writing style
  - Type it naturally into the document

### 4. Monitor Progress
- Watch real-time progress updates
- See current sentence being typed
- Stop anytime with the stop button

## 🛠️ Building Executables

### Build for All Platforms
```bash
npm run build
```

### Build for Specific Platform
```bash
# Windows
npm run build-win

# macOS
npm run build-mac

# Linux
npm run build-linux
```

Built executables will be in the `dist/` folder.

## 🔧 Technical Details

### Architecture
- **Electron**: Desktop application framework
- **Puppeteer**: Browser automation for Google Docs
- **OpenAI GPT-4**: Essay generation with style learning
- **Human Typing Simulation**: Realistic typing patterns and delays

### Anti-Detection Features
- Variable typing speeds (60-120 WPM)
- Natural pauses between sentences and words
- Occasional typos with backspace corrections
- Human-like mouse movements and clicks
- Realistic browsing patterns
- Session management that appears natural

### Writing Style Analysis
- Vocabulary richness and common words
- Sentence structure and complexity
- Tone analysis (formal vs informal)
- Common phrases and expressions
- Paragraph structure patterns

## ⚠️ Important Notes

- **Educational Use Only**: This tool is designed for educational purposes
- **Academic Integrity**: Always follow your institution's academic integrity guidelines
- **API Costs**: OpenAI API usage incurs costs based on token usage
- **Account Safety**: The bot uses your existing Google account - you maintain full control

## 🐛 Troubleshooting

### Common Issues

**"Failed to analyze writing style"**
- Ensure uploaded files are `.txt` or `.md` format
- Check that files contain readable text content

**"OpenAI API Error"**
- Verify your API key is correct and has credits
- Check your internet connection

**"Google Docs not loading"**
- Ensure you have a stable internet connection
- Try logging into Google manually first
- Check if Google Docs is accessible in your region

**"Typing not working"**
- Make sure you're logged into Google Docs
- Ensure the document editor is focused
- Try refreshing the page and restarting

## 📝 License

MIT License - See LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## ⚖️ Disclaimer

This software is provided for educational purposes only. Users are responsible for ensuring their use complies with academic integrity policies and applicable laws. The developers are not responsible for any misuse of this software.
