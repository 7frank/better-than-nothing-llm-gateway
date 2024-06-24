import { array, z } from "zod";

import type {
  EmbeddingCreateParams,
  CreateEmbeddingResponse,
} from "openai/resources/embeddings.mjs";

export const OllamaEmbeddingsResponse = z.object({
  embedding: z.number().array(),
});

export const OllamaEmbeddings = z.object({
  model: z.string(),
  prompt: z.string(),
  keep_alive: z.number().optional(),
});

export const OpenAiChatResponse = z.object({
  choices: z.object({ message: z.object({ content: z.string() }) }).array(),
});

// Define the schema for the inner object in the data array
const EmbeddingData = z.object({
  embedding: z.number().array(), // Assuming embedding can be of any type. Adjust as needed.
  index: z.number(),
  object: z.literal("embedding"),
});

export const OpenAiEmbeddingResponse = z.object({
  data: z.array(EmbeddingData),
  model: z.string(),
  object: z.literal("list"),
  usage: z.object({
    prompt_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

// // Infer the TypeScript type from the Zod schema
// type OpenAiEmbeddingResponseType = z.infer<typeof OpenAiEmbeddingResponse>;

// // Ensure the inferred type satisfies the CreateEmbeddingResponse interface
// const response: OpenAiEmbeddingResponseType =
//   {} as OpenAiEmbeddingResponseType satisfies CreateEmbeddingResponse;
