
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

Your response should be:
Bot: `,
});

const elearningChatFlow = ai.defineFlow(
  {
    name: 'elearningChatFlow',
    inputSchema: ElearningChatInputSchema,
    outputSchema: ElearningChatOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

