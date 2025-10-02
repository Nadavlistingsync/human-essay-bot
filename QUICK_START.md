# 🚀 EssayForge - Quick Start Guide

## ⚡ Get Started in 5 Minutes

### Step 1: Install the Extension (1 min)

```bash
# Navigate to your project
cd "/Users/nadavbenedek/Teach AI"

# Open Chrome and go to:
chrome://extensions/

# Then:
1. Enable "Developer mode" (toggle in top right)
2. Click "Load unpacked"
3. Select: /Users/nadavbenedek/Teach AI/chrome-extension
4. Pin the extension to your toolbar (click puzzle icon 🧩)
```

### Step 2: Get Your OpenAI API Key (2 min)

1. Visit: https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)
5. Save it somewhere safe!

### Step 3: Configure the Extension (1 min)

1. Click the EssayForge icon in Chrome
2. Paste your API key in the "Settings" section
3. Click "Save API Key"
4. You should see: "API key saved successfully! ✓"

### Step 4: Write Your First Essay (1 min)

1. Open Google Docs: https://docs.google.com
2. Create a new document
3. Click the EssayForge icon
4. Enter a prompt: **"Write an essay about artificial intelligence"**
5. Select settings:
   - Typing Speed: **Medium**
   - Essay Length: **Short**
6. Click **"Start Writing Essay"**
7. Watch the magic happen! ✨

---

## 🎯 That's It!

You're now ready to use EssayForge. The extension will:
- Generate an AI essay based on your prompt
- Type it naturally into Google Docs
- Show progress as it writes
- Notify you when complete

## 🔧 Troubleshooting

**Extension not showing?**
- Make sure you're on a Google Docs page
- Check that developer mode is enabled

**API key not working?**
- Verify it starts with `sk-`
- Check you have credits on OpenAI
- Make sure it's copied correctly (no spaces)

**Typing not working?**
- Click inside the Google Doc first
- Refresh the page and try again
- Use the test page: `chrome-extension/test-google-docs.html`

## 📚 Learn More

- **Full Documentation:** [README.md](chrome-extension/README.md)
- **Installation Guide:** [install.md](chrome-extension/install.md)
- **Testing Guide:** [TESTING.md](chrome-extension/TESTING.md)
- **Project Summary:** [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

## ✅ Verification

Run automated tests:
```bash
cd chrome-extension
node verify-extension.js
```

Expected output: **"🎉 All critical tests passed! Extension is ready to use."**

---

## 🎉 You're All Set!

Enjoy writing essays with AI! 🤖✍️

**Pro Tips:**
- Be specific in your prompts for better results
- Start with "Short" essays to test
- Use "Slow" speed for most realistic typing
- Save your favorite prompts for reuse

**Need Help?**
- Check the documentation in `chrome-extension/`
- Review `TESTING.md` for detailed testing
- See `PROJECT_SUMMARY.md` for complete overview

Happy essay writing! 📝

