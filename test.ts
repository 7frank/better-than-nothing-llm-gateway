import OpenAI from "openai";

// ensure that you are connected to the jambit VPN
const baseURL = `http://localhost:3000/v1`;
const OPENAI_API_KEY = "dummy_key"; // we need to set a dummy to appease the constructor

const openai = new OpenAI({ baseURL, apiKey: OPENAI_API_KEY });

const jambitApiKey = "GLM0QqrHqGt7mNjumtC2VbQBDr9pcWUM";
const chatCompletion = await openai.chat.completions.create(
  {
    /**
     * Enable this option for streaming
     */
    stream: false,
    /**
     * Your messages
     */
    messages: [{ role: "user", content: "Say this is a test" }],
    /**
     * One of the available models. See http://ollama.kong.7frank.internal.jambit.io/api/tags which are currently installed on the server
     */
    model: "nomic-embed-text:latest",
  },
  {
    headers: { apikey: jambitApiKey },
  }
);

const res = chatCompletion.choices[0]?.message;
console.log(res);