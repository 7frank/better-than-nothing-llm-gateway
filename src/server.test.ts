import { describe, it, expect, beforeEach } from "bun:test";
import { zFetch } from "./zFetch";
import { z } from "zod";
import chalk from "chalk";

const ChatRequest = z.object({
  choices: z.object({ message: z.object({ content: z.string() }) }).array(),
});

describe("when getting chat completion", () => {
  let baseUrl: string;
  let headers: Record<string, string>;
  beforeEach(() => {
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

  it("with existing model, it will return valid response", async () => {
    const data = {
      stream: false,
      model: "deepseek-coder:instruct",
      messages: [{ role: "user", content: "2+2" }],
    };

    const result = await zFetch(ChatRequest, `${baseUrl}/chat/completions`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });
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

    const promise = zFetch(ChatRequest, `${baseUrl}/chat/completions`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });

    const regex = /^No Provider available for 'nope-123-model'/;
    expect(() => promise).toThrow(regex);
  });
});
