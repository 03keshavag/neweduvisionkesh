/**
 * Groq client factory.
 *
 * The API key is read ONLY from the GROQ_API_KEY environment variable
 * (loaded from .env via dotenv). It is never imported into client-side
 * code or embedded in bundles.
 */
import 'dotenv/config';
import Groq from 'groq-sdk';

/** Thrown when the Groq API key is missing or misconfigured. */
export class GroqConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GroqConfigError';
  }
}

/** Model used when GROQ_MODEL is not set. Supports JSON output. */
export const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';

let cachedClient: Groq | null = null;

/**
 * Returns a lazily-created, cached Groq client.
 * Throws GroqConfigError if GROQ_API_KEY is not present in the environment.
 */
export function getGroqClient(): Groq {
  if (cachedClient) {
    return cachedClient;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new GroqConfigError(
      'GROQ_API_KEY is not set. Copy .env.example to .env and add your Groq API key.',
    );
  }

  cachedClient = new Groq({apiKey});
  return cachedClient;
}

/** Returns the model to use, honouring an optional GROQ_MODEL override. */
export function getGroqModel(): string {
  return process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL;
}
