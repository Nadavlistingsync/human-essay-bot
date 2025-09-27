const fs = require('fs');
const path = require('path');

class WritingStyleAnalyzer {
  constructor() {
    this.stylePatterns = {
      vocabulary: {},
      sentenceStructure: {},
      tone: {},
      commonPhrases: {},
      paragraphStructure: {}
    };
  }

  async analyzeFile(filePath) {
    try {
      const content = await this.readFile(filePath);
      return this.analyzeContent(content);
    } catch (error) {
      console.error('Error analyzing file:', error);
      throw new Error(`Failed to analyze file: ${error.message}`);
    }
  }

  async readFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.txt':
        return fs.readFileSync(filePath, 'utf8');
      case '.md':
        return fs.readFileSync(filePath, 'utf8');
      default:
        throw new Error(`Unsupported file format: ${ext}`);
    }
  }

  analyzeContent(content) {
    const analysis = {
      vocabulary: this.analyzeVocabulary(content),
      sentenceStructure: this.analyzeSentenceStructure(content),
      tone: this.analyzeTone(content),
      commonPhrases: this.analyzeCommonPhrases(content),
      paragraphStructure: this.analyzeParagraphStructure(content),
      overallStyle: this.generateOverallStyle(content)
    };

    return analysis;
  }

  analyzeVocabulary(content) {
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    const wordCount = {};
    
    // Count word frequency
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Calculate vocabulary metrics
    const uniqueWords = Object.keys(wordCount).length;
    const totalWords = words.length;
    const vocabularyRichness = uniqueWords / totalWords;

    // Find most common words (excluding common stop words)
    const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
    
    const commonWords = Object.entries(wordCount)
      .filter(([word]) => !stopWords.has(word) && word.length > 3)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20);

    return {
      richness: vocabularyRichness,
      commonWords: commonWords,
      averageWordLength: words.reduce((sum, word) => sum + word.length, 0) / words.length
    };
  }

  analyzeSentenceStructure(content) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
    const averageLength = sentenceLengths.reduce((sum, len) => sum + len, 0) / sentenceLengths.length;
    
    // Analyze sentence complexity
    const complexSentences = sentences.filter(s => {
      const words = s.trim().split(/\s+/);
      return words.length > 20 || /[,;:]/.test(s);
    }).length;

    const complexity = complexSentences / sentences.length;

    // Analyze sentence starters
    const starters = sentences.map(s => s.trim().split(/\s+/)[0].toLowerCase())
      .filter(word => word.length > 0);
    
    const starterCounts = {};
    starters.forEach(starter => {
      starterCounts[starter] = (starterCounts[starter] || 0) + 1;
    });

    return {
      averageLength,
      complexity,
      commonStarters: Object.entries(starterCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
    };
  }

  analyzeTone(content) {
    // Analyze formal vs informal language
    const formalWords = ['therefore', 'furthermore', 'moreover', 'consequently', 'nevertheless', 'subsequently'];
    const informalWords = ['gonna', 'wanna', 'gotta', 'yeah', 'okay', 'cool', 'awesome'];
    
    const formalCount = formalWords.reduce((count, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      return count + (content.match(regex) || []).length;
    }, 0);

    const informalCount = informalWords.reduce((count, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      return count + (content.match(regex) || []).length;
    }, 0);

    // Analyze punctuation usage
    const exclamationCount = (content.match(/!/g) || []).length;
    const questionCount = (content.match(/\?/g) || []).length;
    const totalSentences = content.split(/[.!?]+/).length - 1;

    return {
      formality: formalCount > informalCount ? 'formal' : 'informal',
      enthusiasm: exclamationCount / totalSentences,
      questioning: questionCount / totalSentences,
      formalWordCount: formalCount,
      informalWordCount: informalCount
    };
  }

  analyzeCommonPhrases(content) {
    // Find common 2-3 word phrases
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    const phrases = {};
    
    // 2-word phrases
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = `${words[i]} ${words[i + 1]}`;
      phrases[phrase] = (phrases[phrase] || 0) + 1;
    }

    // 3-word phrases
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      phrases[phrase] = (phrases[phrase] || 0) + 1;
    }

    // Filter out common phrases that appear frequently
    const commonPhrases = Object.entries(phrases)
      .filter(([, count]) => count >= 2)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15);

    return commonPhrases;
  }

  analyzeParagraphStructure(content) {
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    const paragraphLengths = paragraphs.map(p => p.trim().split(/\s+/).length);
    const averageParagraphLength = paragraphLengths.reduce((sum, len) => sum + len, 0) / paragraphLengths.length;

    // Analyze paragraph starters
    const starters = paragraphs.map(p => p.trim().split(/\s+/)[0].toLowerCase())
      .filter(word => word.length > 0);

    const starterCounts = {};
    starters.forEach(starter => {
      starterCounts[starter] = (starterCounts[starter] || 0) + 1;
    });

    return {
      averageLength: averageParagraphLength,
      paragraphCount: paragraphs.length,
      commonStarters: Object.entries(starterCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8)
    };
  }

  generateOverallStyle(content) {
    const analysis = {
      vocabulary: this.analyzeVocabulary(content),
      sentenceStructure: this.analyzeSentenceStructure(content),
      tone: this.analyzeTone(content)
    };

    // Generate style summary
    let styleDescription = '';
    
    if (analysis.tone.formality === 'formal') {
      styleDescription += 'Formal, academic writing style. ';
    } else {
      styleDescription += 'Conversational, informal writing style. ';
    }

    if (analysis.sentenceStructure.complexity > 0.3) {
      styleDescription += 'Uses complex sentence structures. ';
    } else {
      styleDescription += 'Prefers simpler, more direct sentences. ';
    }

    if (analysis.vocabulary.richness > 0.7) {
      styleDescription += 'Rich vocabulary with varied word choice.';
    } else {
      styleDescription += 'Straightforward vocabulary usage.';
    }

    return {
      description: styleDescription,
      complexity: analysis.sentenceStructure.complexity,
      formality: analysis.tone.formality,
      vocabularyLevel: analysis.vocabulary.richness
    };
  }
}

module.exports = { WritingStyleAnalyzer };
