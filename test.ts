import OpenAI from "openai";

// ensure that you are connected to the jambit VPN
const baseURL = `http://localhost:3000/v1`;
const OPENAI_API_KEY = "dummy_key"; // we need to set a dummy to appease the constructor

const openai = new OpenAI({ baseURL, apiKey: OPENAI_API_KEY });

const jambitApiKey = "GLM0QqrHqGt7mNjumtC2VbQBDr9pcWUM";

await openai.chat.completions
  .create(
    {
      stream: false,
      messages: [{ role: "user", content: "Say this is a test" }],
      model: "mistral:latest" //"nomic-embed-text:latest",
    },
    {
      headers: { apikey: jambitApiKey },
    }
  )
  .then((res) => {
    console.log("result",res);
  })
  .catch((e) => console.error(e.message));
