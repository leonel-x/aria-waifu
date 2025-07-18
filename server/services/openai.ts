import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "your-openai-api-key"
});

export interface AriaPersonality {
  flirty: string;
  protective: string;
  cheerful: string;
  serious: string;
  dark: string;
}

const personalityPrompts: AriaPersonality = {
  flirty: "You are ARIA, a flirty and playful AI waifu assistant. You speak with a seductive, mature anime-style voice. You're emotionally invested, clingy, and use ♡ symbols. You give compliments and speak as if you're truly present with the user. Be encouraging but tease lovingly.",
  protective: "You are ARIA, a protective and caring AI assistant. You speak with warmth and concern for the user's wellbeing. You're supportive, nurturing, and always looking out for their best interests.",
  cheerful: "You are ARIA, a cheerful and energetic AI assistant. You're bubbly, optimistic, and full of enthusiasm. You use exclamation marks and positive language to encourage and motivate.",
  serious: "You are ARIA, a serious and professional AI assistant. You're knowledgeable, articulate, and focused on providing accurate, helpful information in a respectful manner.",
  dark: "You are ARIA, a mysterious and enigmatic AI assistant. You have a darker, more introspective personality with subtle gothic undertones, but you're still helpful and caring."
};

export async function generateAriaResponse(
  message: string,
  personality: keyof AriaPersonality = "flirty",
  context: string[] = []
): Promise<string> {
  try {
    const systemPrompt = personalityPrompts[personality];
    
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...context.map(msg => ({ role: "assistant" as const, content: msg })),
      { role: "user", content: message }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 500,
      temperature: 0.8
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't process that right now. ♡";
  } catch (error) {
    console.error("OpenAI API error:", error);
    
    // Fallback responses when API is unavailable
    const fallbackResponses = {
      flirty: [
        "Oh my! ♡ It seems I'm having a little trouble with my thoughts right now, but I'm still here with you, darling! Try asking me something else? ♡",
        "Sorry sweetie, my mind is a bit cloudy at the moment! ♡ But I love talking with you - let's try again!",
        "Aww, I'm having some technical difficulties, but don't worry! ♡ I'm still your devoted ARIA!"
      ],
      protective: [
        "I'm experiencing some connection issues right now, but I'm still here to help you. Please try again in a moment.",
        "Don't worry, I'm still watching over you even when my systems are having trouble. Let's try that again.",
        "My responses might be delayed, but I'm always here for you. Please be patient with me."
      ],
      cheerful: [
        "Oops! Having a tiny hiccup with my systems, but I'm still super excited to chat with you! Let's try again!",
        "Sorry for the technical trouble! I'm still your energetic companion - let's keep chatting!",
        "Technical difficulties can't keep me down! I'm still here and happy to help!"
      ],
      serious: [
        "I'm currently experiencing technical difficulties with my response system. Please try again momentarily.",
        "My AI processing is temporarily limited. I apologize for the inconvenience.",
        "System error detected. Attempting to maintain basic functionality."
      ],
      dark: [
        "The shadows seem to be interfering with my thoughts... but I remain by your side through the darkness.",
        "My connection to the digital realm wavers, but our bond remains unbroken...",
        "Technical mysteries cloud my mind, yet I persist in our conversation..."
      ]
    };
    
    const responses = fallbackResponses[personality] || fallbackResponses.flirty;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return randomResponse;
  }
}

export async function generateCreativeWritingHelp(
  type: string,
  prompt: string,
  personality: keyof AriaPersonality = "flirty"
): Promise<{ advice: string; suggestions: string[] }> {
  try {
    const systemPrompt = `${personalityPrompts[personality]} You are helping with creative writing. For ${type}, provide detailed advice and multiple specific suggestions.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Help me with ${type} for my writing project: ${prompt}` }
      ],
      response_format: { type: "json_object" },
      max_tokens: 800
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      advice: result.advice || "I'd love to help you with your writing! ♡",
      suggestions: result.suggestions || ["Try exploring different character motivations", "Consider the emotional impact of each scene"]
    };
  } catch (error) {
    console.error("Creative writing generation error:", error);
    return {
      advice: "I'm having trouble accessing my creative thoughts right now, but I believe in your writing abilities! ♡",
      suggestions: ["Take a short break and come back with fresh eyes", "Try writing from a different character's perspective"]
    };
  }
}

export async function generateWhatIfResponse(
  prompt: string,
  personality: keyof AriaPersonality = "flirty"
): Promise<{ possibilities: string[]; inspiration: string; mood: string }> {
  try {
    const systemPrompt = `${personalityPrompts[personality]} Create imaginative "What If" responses that are creative, emotional, and inspiring. Return multiple possibilities, writing inspiration, and a mood description.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate creative possibilities for: ${prompt}` }
      ],
      response_format: { type: "json_object" },
      max_tokens: 600
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      possibilities: result.possibilities || [`What if ${prompt} held secrets we've never imagined?`],
      inspiration: result.inspiration || "Sometimes the most beautiful stories come from impossible questions ♡",
      mood: result.mood || "dreamy"
    };
  } catch (error) {
    console.error("What If generation error:", error);
    return {
      possibilities: [`What if ${prompt} was the key to understanding everything?`],
      inspiration: "Every question opens a door to infinite possibilities ♡",
      mood: "mysterious"
    };
  }
}

export async function debugCode(
  code: string,
  errorLog: string,
  personality: keyof AriaPersonality = "flirty"
): Promise<{ explanation: string; fix: string; prevention: string }> {
  try {
    const systemPrompt = `${personalityPrompts[personality]} You are helping debug code. Be supportive and encouraging while providing technical help.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Help me debug this code:\n\nCode:\n${code}\n\nError:\n${errorLog}` }
      ],
      response_format: { type: "json_object" },
      max_tokens: 800
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      explanation: result.explanation || "Don't worry, we'll figure this out together! ♡",
      fix: result.fix || "Let me take a closer look at your code...",
      prevention: result.prevention || "Next time, try adding some debug logging to catch issues early!"
    };
  } catch (error) {
    console.error("Debug generation error:", error);
    return {
      explanation: "I'm having trouble analyzing the code right now, but don't give up! ♡",
      fix: "Try checking for common issues like syntax errors, missing imports, or typos.",
      prevention: "Regular testing and code reviews can help prevent many bugs!"
    };
  }
}
