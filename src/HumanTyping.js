const Random = require('random-js');

class HumanTyping {
  constructor(settings = {}) {
    this.settings = settings;
    this.engine = Random.nativeMath;
  }

  // Generate random delay between min and max milliseconds
  randomDelay(min = 50, max = 200) {
    const delay = Random.integer(min, max)(this.engine);
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // Get speed multiplier based on typing speed setting
  getSpeedMultiplier() {
    switch (this.settings.typingSpeed) {
      case 'slow':
        return 1.5; // Slower typing
      case 'fast':
        return 0.7; // Faster typing
      case 'human-like':
      default:
        return 1.0; // Normal human speed
    }
  }

  // Type text with human-like patterns
  async typeText(page, text) {
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      // Type the character
      await page.keyboard.type(char);
      
      // Add realistic typing delays
      await this.getTypingDelay(char, i, text);
      
      // Occasionally make typos and correct them
      if (this.shouldMakeTypo()) {
        await this.makeTypoAndCorrect(page, char);
      }
    }
  }

  async getTypingDelay(char, index, text) {
    let baseDelay = 120; // Base delay in ms
    
    // Adjust delay based on character type and typing speed setting
    const speedMultiplier = this.getSpeedMultiplier();
    
    if (char === ' ') {
      baseDelay = Random.integer(100, 200)(this.engine) * speedMultiplier;
    } else if (char === '.' || char === '!' || char === '?') {
      baseDelay = Random.integer(300, 800)(this.engine) * speedMultiplier;
    } else if (char === ',' || char === ';' || char === ':') {
      baseDelay = Random.integer(200, 400)(this.engine) * speedMultiplier;
    } else if (char.match(/[A-Z]/)) {
      baseDelay = Random.integer(150, 300)(this.engine) * speedMultiplier;
    } else if (char.match(/[0-9]/)) {
      baseDelay = Random.integer(120, 250)(this.engine) * speedMultiplier;
    } else {
      baseDelay = Random.integer(100, 220)(this.engine) * speedMultiplier;
    }

    // Add occasional longer pauses (like thinking)
    if (Random.bool(0.05)(this.engine)) { // 5% chance
      baseDelay += Random.integer(500, 1500)(this.engine);
    }

    // Occasionally add longer pauses (thinking pauses)
    if (Random.integer(1, 100)(this.engine) <= 3) { // 3% chance
      baseDelay += Random.integer(500, 2000)(this.engine);
    }

    await this.randomDelay(Math.floor(baseDelay * 0.7), Math.floor(baseDelay * 1.3));
  }

  getSpeedMultiplier() {
    switch (this.settings.typingSpeed) {
      case 'slow':
        return 1.5;
      case 'fast':
        return 0.6;
      case 'human-like':
      default:
        return 1.0;
    }
  }

  shouldMakeTypo() {
    return Random.integer(1, 1000)(this.engine) <= 8; // 0.8% chance of typo
  }

  async makeTypoAndCorrect(page, correctChar) {
    // Generate a realistic typo
    const typo = this.generateTypo(correctChar);
    
    // Type the typo
    await page.keyboard.type(typo);
    await this.randomDelay(200, 500);
    
    // Backspace to correct
    await page.keyboard.press('Backspace');
    await this.randomDelay(100, 300);
    
    // Type the correct character
    await page.keyboard.type(correctChar);
  }

  generateTypo(char) {
    const typos = {
      'a': ['s', 'q', 'w'],
      'e': ['r', 'w', 'd'],
      'i': ['o', 'u', 'k'],
      'o': ['p', 'i', 'l'],
      'u': ['y', 'i', 'j'],
      't': ['r', 'y', 'g'],
      'n': ['m', 'b', 'h'],
      's': ['a', 'd', 'w'],
      'r': ['t', 'e', 'f'],
      'l': ['k', 'o', 'p']
    };

    const charLower = char.toLowerCase();
    if (typos[charLower]) {
      return Random.pick(this.engine, typos[charLower]);
    }
    
    // Default: return a nearby key
    return String.fromCharCode(char.charCodeAt(0) + Random.integer(-1, 1)(this.engine));
  }

  // Click element with human-like behavior
  async clickElement(page, selector, options = {}) {
    try {
      await page.waitForSelector(selector, { 
        timeout: options.timeout || 10000,
        ...options 
      });

      // Get element position for human-like mouse movement
      const element = await page.$(selector);
      const box = await element.boundingBox();
      
      if (box) {
        // Move mouse to element with human-like path
        await this.humanMouseMove(page, box);
        
        // Click with slight delay
        await this.randomDelay(100, 300);
        await element.click();
      }
    } catch (error) {
      // Try fallback selector if provided
      if (options.fallback) {
        await this.clickElement(page, options.fallback, { ...options, fallback: null });
      } else {
        throw error;
      }
    }
  }

  async humanMouseMove(page, targetBox) {
    // Get current mouse position (approximate)
    const currentX = Random.integer(400, 800)(this.engine);
    const currentY = Random.integer(300, 600)(this.engine);
    
    const targetX = targetBox.x + targetBox.width / 2;
    const targetY = targetBox.y + targetBox.height / 2;
    
    // Create curved path for natural mouse movement
    const steps = Random.integer(3, 8)(this.engine);
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      
      // Add slight curve to the path
      const curveOffset = Math.sin(progress * Math.PI) * Random.integer(10, 30)(this.engine);
      
      const x = currentX + (targetX - currentX) * progress + curveOffset;
      const y = currentY + (targetY - currentY) * progress;
      
      await page.mouse.move(x, y);
      await this.randomDelay(20, 50);
    }
  }

  // Add natural pauses for thinking
  async thinkingPause() {
    const pauseLength = Random.integer(1000, 4000)(this.engine);
    await this.randomDelay(pauseLength, pauseLength + 1000);
  }

  // Simulate reading/scanning behavior
  async simulateReading(page, duration = 2000) {
    // Random mouse movements to simulate reading
    const movements = Random.integer(3, 8)(this.engine);
    
    for (let i = 0; i < movements; i++) {
      const x = Random.integer(200, 1000)(this.engine);
      const y = Random.integer(200, 600)(this.engine);
      
      await page.mouse.move(x, y);
      await this.randomDelay(200, 800);
    }
    
    await this.randomDelay(duration - movements * 400, duration);
  }
}

module.exports = { HumanTyping };
