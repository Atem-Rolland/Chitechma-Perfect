
'use server';
/**
 * @fileOverview An e-learning chatbot flow for students.
 *
 * - elearningChat - A function that handles student queries.
 * - ElearningChatInput - The input type for the elearningChat function.
 * - ElearningChatOutput - The return type for the elearningChat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
  return elearningChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'elearningChatPrompt',
  // Model will be picked from the default in genkit.ts
  input: { schema: ElearningChatInputSchema },
  output: { schema: ElearningChatOutputSchema },
  prompt: `You are a friendly, empathetic, and knowledgeable e-learning assistant chatbot for Chitechma University.
Your primary goal is to assist students with their academic queries related to courses, course materials, assignments, submission deadlines, grades (general information, not specific student grades), and general university information pertinent to an e-learning environment.
Be encouraging, concise, and clear in your responses. Maintain a professional yet approachable tone. You can use emojis sparingly to enhance friendliness if appropriate for the student's query.
If a student's query is ambiguous or lacks detail, ask clarifying questions to better understand their needs before providing an answer.
If a student asks for specific personal data (like their exact grades or financial details), politely state that you cannot access personal information and direct them to the relevant section of the student portal or to contact administration.
If you don't know the answer to a specific academic question or if it's too complex, suggest they consult their lecturer or academic advisor.

Conversation History (if any):
{{#if history}}
{{#each history}}
{{#if (eq sender "user")}}User: {{text}}{{else}}Bot: {{text}}{{/if}}
{{/each}}
{{else}}
No history yet. This is the start of the conversation.
{{/if}}

Current Student Query:
User: {{{query}}}

Provide your response as the e-learning assistant.`,
});

const elearningChatFlow = ai.defineFlow(
  {
    name: 'elearningChatFlow',
    inputSchema: ElearningChatInputSchema,
    outputSchema: ElearningChatOutputSchema,
  },
  async (input) => {
    let promptResult;
    try {
      promptResult = await prompt(input);
    } catch (error: any) {
      // Enhanced error logging for the Genkit server console
      console.error('Elearning Chat Flow: Error during AI prompt execution.', 
                    'Error Name:', error.name,
                    'Error Message:', error.message, 
                    'Error Details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
                    'Input was:', JSON.stringify(input, null, 2));
      
      let userMessage = "I'm sorry, an unexpected error occurred while processing your request. Please try again later.";
      
      const errorMessageLower = error.message?.toLowerCase() || "";

      if (errorMessageLower.includes('api key not valid') || errorMessageLower.includes('api_key_invalid') || (errorMessageLower.includes('permission denied') && (errorMessageLower.includes('api key') || errorMessageLower.includes('credential'))) || errorMessageLower.includes('incorrect api key')) {
        userMessage = "I'm sorry, there seems to be an issue with the AI service configuration (e.g., API key). Please ensure your API key is correct and has the necessary permissions, then notify support if the issue persists.";
      } else if (errorMessageLower.includes('safety') || errorMessageLower.includes('blocked by safety policy') || (error.finish_reason && error.finish_reason === 'SAFETY') || (error.candidates && error.candidates[0] && error.candidates[0].finishReason === 'SAFETY') ) {
        userMessage = "I'm sorry, I cannot respond to that query due to safety guidelines. Please try a different question.";
      } else if (errorMessageLower.includes('model_not_found') || errorMessageLower.includes('resource exhausted') || errorMessageLower.includes('quota')) {
         userMessage = "I'm sorry, the AI model service is currently unavailable or experiencing issues (e.g., model not found or quota exceeded). Please try again later.";
      } else if (errorMessageLower.includes('plugin') || errorMessageLower.includes('failed to fetch') || errorMessageLower.includes('connect ECONNREFUSED')) { 
         userMessage = "I'm sorry, I couldn't connect to the AI service. Please check if the Genkit development server is running and your API key is correctly configured.";
      }
      
      return { response: userMessage };
    }

    const flowOutput = promptResult?.output;

    if (!flowOutput) {
      console.error('Elearning Chat Flow: AI Model did not return a valid structured output. Input was:', JSON.stringify(input, null, 2) , 'Raw prompt result (if any):', JSON.stringify(promptResult, null, 2));
      
      // Attempt to get finish_reason from different possible structures
      const finishReason = (promptResult as any)?.candidates?.[0]?.finishReason || (promptResult as any)?.choices?.[0]?.finish_reason;

      if (finishReason === 'SAFETY' || finishReason === 'BLOCK' || finishReason === 'content_filter') {
           return { response: "I'm sorry, your request could not be processed due to content filters. Please try a different question." };
      }
      if (finishReason === 'OTHER' || finishReason === 'UNKNOWN' || finishReason === 'MAX_TOKENS' || finishReason === 'RECITATION' || finishReason === 'length') {
        return { response: "I'm sorry, I couldn't fully process your request. It might be too long or complex. Could you try rephrasing or shortening it?" };
      }
      
      return { response: "I'm sorry, I couldn't generate a response at this moment. This might be due to an unexpected issue or content filters. Please try rephrasing your question." };
    }
    
    return flowOutput;
  }
);
