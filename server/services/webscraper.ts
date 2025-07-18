import axios from "axios";
import * as cheerio from "cheerio";

export interface WebsiteAnalysis {
  title: string;
  summary: string;
  keyPoints: string[];
  wordCount: number;
  readingTime: number;
}

export async function analyzeWebsite(url: string): Promise<WebsiteAnalysis> {
  try {
    // Validate URL
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error("Invalid URL protocol. Only HTTP and HTTPS are supported.");
    }

    // Fetch website content
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ARIA-Bot/1.0; +https://aria-assistant.app)'
      }
    });

    const $ = cheerio.load(response.data);
    
    // Extract title
    const title = $('title').text().trim() || $('h1').first().text().trim() || 'Untitled Page';
    
    // Remove script and style elements
    $('script, style, nav, footer, header, aside').remove();
    
    // Extract main content
    const contentSelectors = ['main', 'article', '.content', '.post', '.entry', 'body'];
    let content = '';
    
    for (const selector of contentSelectors) {
      const element = $(selector).first();
      if (element.length) {
        content = element.text();
        break;
      }
    }
    
    if (!content) {
      content = $('body').text();
    }
    
    // Clean up content
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim();
    
    // Calculate metrics
    const words = content.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words per minute
    
    // Extract key points (first few sentences and any bullet points)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const keyPoints: string[] = [];
    
    // Add first few meaningful sentences
    for (let i = 0; i < Math.min(3, sentences.length); i++) {
      const sentence = sentences[i].trim();
      if (sentence.length > 20 && sentence.length < 200) {
        keyPoints.push(sentence);
      }
    }
    
    // Look for list items
    $('li').each((_, element) => {
      const text = $(element).text().trim();
      if (text.length > 10 && text.length < 150 && keyPoints.length < 5) {
        keyPoints.push(text);
      }
    });
    
    // Generate summary (first 300 characters of content)
    const summary = content.length > 300 
      ? content.substring(0, 300) + "..."
      : content;
    
    return {
      title,
      summary: summary || "Unable to extract meaningful content from this page.",
      keyPoints: keyPoints.length > 0 ? keyPoints : ["No key points could be extracted from this page."],
      wordCount,
      readingTime
    };
    
  } catch (error) {
    console.error("Website analysis error:", error);
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ENOTFOUND') {
        throw new Error("Website not found. Please check the URL and try again.");
      } else if (error.response?.status === 403) {
        throw new Error("Access denied. This website blocks automated requests.");
      } else if (error.response?.status === 404) {
        throw new Error("Page not found. The URL may be incorrect or the page may have been removed.");
      } else if (error.code === 'ECONNABORTED') {
        throw new Error("Request timeout. The website took too long to respond.");
      }
    }
    
    throw new Error("Failed to analyze website. Please try again or check if the URL is accessible.");
  }
}

export function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}
