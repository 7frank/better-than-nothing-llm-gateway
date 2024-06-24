import { describe, it, expect, beforeAll } from "bun:test";
import { zFetch } from "./zFetch";
import { z } from "zod";
import chalk from "chalk";
import {
  OllamaEmbeddingsResponse,
  OpenAiChatResponse,
  OpenAiEmbeddingResponse,
} from "./types";

let baseUrl: string;
let headers: Record<string, string>;
beforeAll(() => {
  // Ensure VPN connection to jambit
  baseUrl = "http://localhost:3000/v1";
  // Dummy key for constructor appeasement
  const openaiApiKey = "dummy_key";

  // Setup the headers with the OpenAI API key
  const dummyAuthHeaders = {
    Authorization: `Bearer ${openaiApiKey}`,
  };

  // Specific headers for jambit's API
  const jambitApiKey = "GLM0QqrHqGt7mNjumtC2VbQBDr9pcWUM";
  const jambitHeaders = {
    apikey: jambitApiKey,
  };
  headers = {
    ...dummyAuthHeaders,
    ...jambitHeaders,
    "Content-Type": "application/json",
  };
});

describe("when getting chat completion", () => {
  it("with existing model, it will return valid response", async () => {
    const data = {
      stream: false,
      model: "deepseek-coder:instruct",
      messages: [{ role: "user", content: "2+2" }],
    };

    const result = await zFetch(
      OpenAiChatResponse,
      `${baseUrl}/chat/completions`,
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
      }
    );
    const msg = result.choices[0].message.content;
    console.log(chalk.bgGreen(msg));
    expect(msg).toBeTruthy();
  });

  it("with not existing model, it will return valid response", async () => {
    const data = {
      stream: false,
      model: "nope-123-model",
      messages: [{ role: "user", content: "2+2" }],
    };

    const promise = zFetch(OpenAiChatResponse, `${baseUrl}/chat/completions`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });

    const regex = /^No Provider available for 'nope-123-model'/;
    expect(() => promise).toThrow(regex);
  });
});

describe("when getting embeddings", () => {
  it("with existing model, it will return valid response", async () => {
    const data = {
      model: "deepseek-coder:instruct",
      input: ["2+2"],
    };

    const result = await zFetch(
      OpenAiEmbeddingResponse,
      `${baseUrl}/embeddings`,
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
      }
    );
    const msg = result.data[0].embedding.slice(0,10);
    msg.push("..." as any)
    console.log("returned Embedding Length:"+result.data[0].embedding.length);
    console.log(chalk.bgGreen(JSON.stringify(msg)));
    expect(msg).toBeTruthy();
  });
});
