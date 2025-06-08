import {genkit} from 'genkit';
// import {openai} from '@genkit-ai/openai'; // Temporarily remove openai plugin

export const ai = genkit({
  plugins: [/* openai() */], // Temporarily remove openai()
  // model: 'openai/gpt-3.5-turbo', // Temporarily remove default model
});
