
'use server';
/**
 * @fileOverview An e-learning chatbot flow for students using OpenRouter.
 *
 * - elearningChat - A function that handles student queries.
 * - ElearningChatInput - The input type for the elearningChat function.
 * - ElearningChatOutput - The return type for the elearningChat function.
 */

import { z } from 'genkit'; // genkit/zod can be replaced with standard zod if genkit is fully removed

// Define a Zod schema for individual chat messages to be used in history
const ChatMessageSchema = z.object({
  sender: z.enum(['user', 'bot']).describe('Who sent the message.'),
  text: z.string().describe('The content of the message.'),
});

const ElearningChatInputSchema = z.object({
  query: z.string().describe("The student's current question or message."),
  history: z.array(ChatMessageSchema).optional().describe('The conversation history up to this point. Each object should have "sender" ("user" or "bot") and "text".'),
});
export type ElearningChatInput = z.infer<typeof ElearningChatInputSchema>;

const ElearningChatOutputSchema = z.object({
  response: z.string().describe("The chatbot's response to the student's query."),
});
export type ElearningChatOutput = z.infer<typeof ElearningChatOutputSchema>;

export async function elearningChat(input: ElearningChatInput): Promise<ElearningChatOutput> {
  const { query, history } = input;

  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"; // Default, user should set in .env.local
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Chitechma University"; // Default, user should set in .env.local

  if (!openRouterApiKey) {
    console.error("OpenRouter API key (OPENROUTER_API_KEY) is not configured in environment variables.");
    return { response: "Error: AI Chatbot service is not configured. API key missing." };
  }

  // Construct messages for OpenRouter API
  const messagesForApi: Array<{ role: "user" | "assistant" | "system"; content: string }> = [];
  
  messagesForApi.push({
    role: "system",
    content: `You are a friendly, empathetic, and knowledgeable e-learning assistant chatbot for Chitechma University.
Your primary goal is to assist students with their academic queries related to courses, course materials, assignments, submission deadlines, grades (general information, not specific student grades), and general university information pertinent to an e-learning environment.
Be encouraging, concise, and clear in your responses. Maintain a professional yet approachable tone. You can use emojis sparingly to enhance friendliness if appropriate for the student's query.
If a student's query is ambiguous or lacks detail, ask clarifying questions to better understand their needs before providing an answer.
If a student asks for specific personal data (like their exact grades or financial details), politely state that you cannot access personal information and direct them to the relevant section of the student portal or to contact administration.
If you don't know the answer to a specific academic question or if it's too complex, suggest they consult their lecturer or academic advisor.`
  });

  if (history) {
    // Limit history to avoid overly long contexts for the API
    const recentHistory = history.slice(-10); 
    recentHistory.forEach(msg => {
      messagesForApi.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      });
    });
  }
  messagesForApi.push({ role: 'user', content: query });

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "HTTP-Referer": siteUrl, // Optional, set in .env.local as NEXT_PUBLIC_SITE_URL
        "X-Title": siteName,     // Optional, set in .env.local as NEXT_PUBLIC_SITE_NAME
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "deepseek/deepseek-r1-0528:free", // As specified by the user
        "messages": messagesForApi
      })
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      console.error("OpenRouter API error:", response.status, errorData);
      const errorMessage = errorData?.error?.message || errorData?.message || response.statusText || "Unknown API error";
      return { response: `Sorry, I encountered an error communicating with the AI service: ${errorMessage}. Please try again later.` };
    }

    const data = await response.json();
    const botResponse = data.choices?.[0]?.message?.content;

    if (!botResponse) {
      console.error("No response content from OpenRouter:", data);
      return { response: "Sorry, I couldn't generate a response at this moment. The AI service returned an empty answer." };
    }

    return { response: botResponse.trim() };

  } catch (error: any) {
    console.error("Error calling OpenRouter API:", error);
    return { response: `Sorry, an unexpected error occurred while connecting to the AI service: ${error.message}. Please check your network connection and try again.` };
  }
}
