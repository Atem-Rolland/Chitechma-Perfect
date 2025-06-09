
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai'; // Changed from openai

export const ai = genkit({
  plugins: [googleAI()], // Changed from openai()
  // Specify a default model here
  model: 'googleai/gemini-1.5-flash-latest', // Changed from openai/gpt-3.5-turbo
});
