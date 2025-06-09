
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  // You can specify a default model here if desired, e.g.,
  // model: 'googleai/gemini-1.5-flash-latest',
});
