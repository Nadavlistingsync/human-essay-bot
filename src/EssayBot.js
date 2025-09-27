const puppeteer = require('puppeteer');
const OpenAI = require('openai');
const { HumanTyping } = require('./HumanTyping');
const { WritingStyleAnalyzer } = require('./WritingStyleAnalyzer');

class EssayBot {
  constructor(settings = {}) {
    this.settings = {
      typingSpeed: settings.typingSpeed || 'human-like',
      writingStyle: settings.writingStyle || null,
      openaiApiKey: process.env.OPENAI_API_KEY, // Always use server-side key
      ...settings
    };
    
    this.browser = null;
    this.page = null;
    this.isWriting = false;
    this.humanTyping = new HumanTyping(this.settings);
    
    if (this.settings.openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: this.settings.openaiApiKey
      });
    }
  }

  async startWriting(prompt, progressCallback) {
    try {
      this.isWriting = true;
      
      // Launch browser with human-like settings
      this.browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [
          '--start-maximized',
          '--disable-blink-features=AutomationControlled',
          '--disable-features=VizDisplayCompositor'
        ]
      });

      this.page = await this.browser.newPage();
      
      // Hide automation indicators
      await this.page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });
      });

      progressCallback({ stage: 'launching', progress: 10 });

      // Navigate to Google Docs
      await this.navigateToGoogleDocs();
      progressCallback({ stage: 'navigating', progress: 25 });

      // Generate essay content
      const essayContent = await this.generateEssay(prompt);
      progressCallback({ stage: 'generating', progress: 50 });

      // Start typing the essay
      await this.typeEssay(essayContent, progressCallback);
      progressCallback({ stage: 'completed', progress: 100 });

      return { success: true, content: essayContent };

    } catch (error) {
      console.error('Error in startWriting:', error);
      throw error;
    }
  }

  async navigateToGoogleDocs() {
    // Navigate to Google Docs
    await this.page.goto('https://docs.google.com', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Wait for user to be logged in (we'll detect this)
    await this.waitForLogin();
    
    // Navigate to the specific document or create new one
    await this.navigateToDocument();
  }

  async waitForLogin() {
    // Wait for user to manually log in
    await this.page.waitForFunction(() => {
      // Check if user is logged in by looking for user profile or account indicators
      return document.querySelector('[data-testid="user-profile-menu"]') || 
             document.querySelector('[aria-label*="Account"]') ||
             document.querySelector('.gb_Dd');
    }, { timeout: 120000 }); // 2 minute timeout for login

    console.log('User is logged in, proceeding...');
  }

  async navigateToDocument() {
    // Check if user provided a specific document URL
    if (this.settings.documentUrl) {
      console.log('Navigating to specific document...');
      await this.page.goto(this.settings.documentUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // Wait for document to load and focus on editor
      await this.page.waitForSelector('[contenteditable="true"]', { timeout: 15000 });
      await this.page.click('[contenteditable="true"]');
      await this.page.waitForTimeout(1000);
    } else {
      // Create a new document as fallback
      await this.createNewDocument();
    }
  }

  async createNewDocument() {
    // Click on "Blank" to create new document
    await this.humanTyping.clickElement(this.page, '[data-testid="new-document-button"]', { 
      fallback: 'button[aria-label*="Blank"]',
      timeout: 10000 
    });

    // Wait for document to load
    await this.page.waitForSelector('[contenteditable="true"]', { timeout: 15000 });
    
    // Focus on the document editor
    await this.page.click('[contenteditable="true"]');
    await this.page.waitForTimeout(1000);
  }

  async generateEssay(prompt) {
    if (!this.openai) {
      throw new Error('OpenAI API key not provided');
    }

    const systemPrompt = this.buildSystemPrompt();
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error generating essay:', error);
      throw new Error('Failed to generate essay content');
    }
  }

  buildSystemPrompt() {
    let prompt = `You are an expert essay writer. Write in a natural, human-like style with the following characteristics:
- Use varied sentence lengths and structures
- Include natural transitions between ideas
- Write in a conversational yet academic tone
- Use appropriate vocabulary for the topic
- Include some personal insights or examples where relevant
- Write in a way that sounds like a real student wrote it`;

    if (this.settings.writingStyle) {
      prompt += `\n\nWrite in the following style based on the user's past writings:
${JSON.stringify(this.settings.writingStyle, null, 2)}`;
    }

    return prompt;
  }

  async typeEssay(content, progressCallback) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let typedCharacters = 0;
    const totalCharacters = content.length;

    for (let i = 0; i < sentences.length && this.isWriting; i++) {
      const sentence = sentences[i].trim() + (i < sentences.length - 1 ? '.' : '');
      
      // Type the sentence with human-like patterns
      await this.humanTyping.typeText(this.page, sentence);
      
      // Add natural pause after sentence
      await this.humanTyping.randomDelay(500, 2000);
      
      typedCharacters += sentence.length;
      const progress = Math.min(75 + (typedCharacters / totalCharacters) * 25, 95);
      
      progressCallback({ 
        stage: 'typing', 
        progress: Math.round(progress),
        currentSentence: sentence.substring(0, 50) + '...'
      });
    }
  }

  async stopWriting() {
    this.isWriting = false;
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}

module.exports = EssayBot;
