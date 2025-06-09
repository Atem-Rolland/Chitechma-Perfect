
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
  model: 'googleai/gemini-1.5-flash-latest', // Explicitly use a Google AI model
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
      // Attempt to get a response from the AI model using the defined prompt
      promptResult = await prompt(input);
    } catch (error) {
      // Log errors that occur during the execution of the prompt (e.g., API errors, network issues)
      console.error('Elearning Chat Flow: Error during prompt execution.', error, 'Input was:', JSON.stringify(input, null, 2));
      
      let userMessage = "I'm sorry, an unexpected error occurred while processing your request. Please try again later.";
      // Check if the error message indicates a safety-related issue
      if (error instanceof Error && error.message.toLowerCase().includes('safety')) {
        userMessage = "I'm sorry, I cannot respond to that query due to safety guidelines. Please try a different question.";
      } else if (error instanceof Error && error.message.toLowerCase().includes('blocked')) {
         userMessage = "I'm sorry, I cannot respond to that query as it may have been blocked. Please try rephrasing your question or ask something else.";
      } else if (error instanceof Error && error.message.toLowerCase().includes('plugin')) {
         userMessage = "I'm sorry, the AI model service is currently unavailable. Please try again later.";
      } else if (error instanceof Error) {
        // Log more details for debugging if it's a general error
        console.error('Detailed error message for prompt execution failure:', error.message);
        if (error.message.toLowerCase().includes('api key not valid')) {
          userMessage = "I'm sorry, there's an issue with the AI service configuration (API key). Please contact support.";
        }
      }
      return { response: userMessage };
    }

    // Extract the structured output from the prompt result
    // The 'output' field is expected based on Genkit's handling of prompts with an outputSchema
    const flowOutput = promptResult?.output;

    if (!flowOutput) {
      // This case handles scenarios where the prompt executed without throwing an error,
      // but the model's response was empty, blocked by safety filters post-generation,
      // or could not be successfully parsed into the ElearningChatOutputSchema.
      console.error('Elearning Chat Flow: Model did not return a valid structured output. Input was:', JSON.stringify(input, null, 2) , 'Raw prompt result (if any):', JSON.stringify(promptResult, null, 2));
      
      // Check if the prompt result itself indicates a finish reason related to safety
      const finishReason = (promptResult as any)?.candidates?.[0]?.finishReason;
      if (finishReason === 'SAFETY' || finishReason === 'BLOCK') {
           return { response: "I'm sorry, your request could not be processed due to safety content filters. Please try a different question." };
      }
      
      return { response: "I'm sorry, I couldn't generate a response at this moment. This might be due to content filters or an issue with understanding the request. Please try rephrasing your question." };
    }
    
    // If a valid structured output is received, return it
    return flowOutput;
  }
);
