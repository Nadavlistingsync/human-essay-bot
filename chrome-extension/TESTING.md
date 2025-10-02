# Testing Guide for EssayForge Chrome Extension

## 🧪 Test Checklist

### Pre-Installation Tests
- [ ] Verify all required files exist:
  - `manifest.json`
  - `popup.html`, `popup.css`, `popup.js`
  - `content.js`, `content.css`
  - `background.js`
  - Icons: `icons/icon16.png`, `icons/icon32.png`, `icons/icon48.png`, `icons/icon128.png`

### Installation Tests
- [ ] Load extension in Chrome (`chrome://extensions/`)
- [ ] Extension appears in extension list
- [ ] No errors in extension details
- [ ] Extension icon appears when on Google Docs page
- [ ] Extension icon is disabled on non-Google Docs pages

### UI Tests
- [ ] Popup opens when clicking extension icon
- [ ] All form elements are visible and styled correctly:
  - Essay prompt textarea
  - Typing speed dropdown
  - Essay length dropdown
  - API key input field
  - Save API Key button
  - Start Writing Essay button
- [ ] Status indicator shows correct initial state

### API Key Management Tests
- [ ] Enter invalid API key (not starting with 'sk-')
  - [ ] Error message displays
- [ ] Enter valid API key format
  - [ ] Success message displays
  - [ ] API key is saved
- [ ] Reload extension popup
  - [ ] API key persists (shown in input field)
- [ ] Try to start writing without API key
  - [ ] Error message displays

### Typing Simulation Tests (Use test-google-docs.html)
- [ ] Open `test-google-docs.html` in browser
- [ ] Click extension icon
- [ ] Enter test prompt: "Write a short paragraph about AI"
- [ ] Select "Fast" speed, "Short" length
- [ ] Click "Start Writing Essay"
- [ ] Verify:
  - [ ] Progress bar appears and updates
  - [ ] Text appears in the editor
  - [ ] Typing happens character by character
  - [ ] Status updates show progress

### Google Docs Integration Tests
- [ ] Open a real Google Doc
- [ ] Click extension icon
- [ ] Extension detects Google Docs correctly
- [ ] Enter essay prompt
- [ ] Select settings
- [ ] Click "Start Writing Essay"
- [ ] Verify:
  - [ ] AI generates essay content
  - [ ] Text appears in Google Doc
  - [ ] Typing is realistic and human-like
  - [ ] Progress updates correctly
  - [ ] Completion notification appears

### Edge Cases & Error Handling
- [ ] Test with no internet connection
  - [ ] Appropriate error message
- [ ] Test with invalid/expired API key
  - [ ] API error message displays
- [ ] Test stopping mid-write
  - [ ] Click "Stop Writing" button
  - [ ] Writing stops immediately
  - [ ] Status updates correctly
- [ ] Test on read-only Google Doc
  - [ ] Appropriate error or graceful handling
- [ ] Test with very long prompt
  - [ ] Extension handles it correctly
- [ ] Test with special characters in prompt
  - [ ] Extension handles it correctly

### Performance Tests
- [ ] Test "Slow" typing speed
  - [ ] Realistic human-like delays
- [ ] Test "Medium" typing speed
  - [ ] Balanced speed
- [ ] Test "Fast" typing speed
  - [ ] Quick but still natural
- [ ] Test "Short" essay length
  - [ ] ~300-500 words generated
- [ ] Test "Medium" essay length
  - [ ] ~500-800 words generated
- [ ] Test "Long" essay length
  - [ ] ~800-1200 words generated

### Browser Console Tests
- [ ] Open browser console (F12)
- [ ] No JavaScript errors during normal operation
- [ ] Appropriate log messages for debugging
- [ ] No warnings about deprecated APIs

### Storage & Persistence Tests
- [ ] Save API key and settings
- [ ] Close popup
- [ ] Reopen popup
  - [ ] API key persists
  - [ ] Settings persist
- [ ] Restart browser
  - [ ] Settings still persist

### Security Tests
- [ ] Verify API key is stored securely (check Chrome storage)
- [ ] Verify no API key in console logs
- [ ] Verify HTTPS used for all API calls
- [ ] Verify extension only runs on Google Docs

## 🔍 Manual Test Scenarios

### Scenario 1: First-Time User
1. Install extension
2. Open Google Doc
3. Click extension icon
4. See prompt to enter API key
5. Enter and save API key
6. Enter essay prompt
7. Start writing
8. Verify complete flow works

### Scenario 2: Experienced User
1. Open Google Doc
2. Click extension icon (API key already saved)
3. Enter prompt
4. Adjust settings
5. Start writing
6. Stop mid-write
7. Restart with different settings
8. Verify all works smoothly

### Scenario 3: Error Recovery
1. Enter invalid API key
2. Try to write essay
3. See error
4. Correct API key
5. Retry
6. Verify success

## 🐛 Known Issues to Test For

- Google Docs iframe detection
- Typing event compatibility
- API rate limiting
- Network timeout handling
- Browser compatibility (Chrome versions)

## 📊 Test Results Template

```
Test Date: ___________
Chrome Version: ___________
OS: ___________

✅ Passed Tests: ___/___
❌ Failed Tests: ___/___
⚠️  Warnings: ___

Notes:
_________________________________
_________________________________
_________________________________
```

## 🚀 Automated Testing (Future)

Consider adding:
- Unit tests for utility functions
- Integration tests for API calls
- E2E tests with Puppeteer/Playwright
- CI/CD pipeline for automated testing

## 📝 Test Data

Use these sample prompts for testing:

**Short prompts:**
- "Write about AI in education"
- "Explain climate change"
- "Discuss the internet's impact"

**Medium prompts:**
- "Write an essay about the benefits and challenges of remote work in the modern workplace"
- "Analyze the role of social media in shaping public opinion and political discourse"

**Long prompts:**
- "Write a comprehensive essay examining the historical development of artificial intelligence, its current applications across various industries, potential future implications for society, and the ethical considerations that must be addressed"

## ✅ Final Verification

Before marking as complete:
- [ ] All critical tests pass
- [ ] No console errors
- [ ] All features work as expected
- [ ] Documentation is accurate
- [ ] Code is clean and commented
- [ ] Extension is ready for users

---

**Testing Status:** 
- [ ] Not Started
- [ ] In Progress
- [ ] Completed
- [ ] Issues Found (see notes)

