
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local if it exists, otherwise fall back to .env
// This makes it consistent with Next.js behavior for local development
const envPath = path.resolve(process.cwd(), '.env.local');
const defaultConfig = dotenv.config(); // Tries to load .env
const localConfig = dotenv.config({ path: envPath });

if (localConfig.error && defaultConfig.error) {
  console.warn(
    "No .env or .env.local file found. Ensure API keys are set in the environment if you're not using an env file."
  );
} else if (localConfig.error) {
  console.log("Loaded environment variables from .env");
} else {
  console.log("Loaded environment variables from .env.local");
}


// Flows will be imported for their side effects in this file.
import './flows/elearning-chat-flow';
