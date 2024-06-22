import * as dotenv from "dotenv";

import ProviderManager, { requestLogger } from "./ProviderManager";
import { getApi } from "./api";

dotenv.config();

const providerManager = new ProviderManager();

await providerManager.addProvider(async () => {
  const availableModels = await fetch(
    "http://ollama.kong.7frank.internal.jambit.io/api/tags"
  )
    .then((r) => r.json())
    .then((r) => r.models.map((m) => m.name));

  return {
    models: availableModels,
    providerName: "Ollama-GPU",
    baseURL: "http://ollama.kong.7frank.internal.jambit.io/v1",
    headers: {},
    weight: 1,
    requestCallback: requestLogger,
  };
});

await providerManager.addProvider(async () => ({
  models: ["nomic-embed-text:latest"],
  providerName: "Ollama-Local",
  baseURL: "http://localhost:11434/v1",
  headers: {},
  weight: 1,
}));

const fastify = getApi(providerManager);
const PORT = Number(process.env.PORT) || 3000;

const start = async () => {
  try {
    await fastify.listen({ port: PORT });
    fastify.log.info(`Server is running on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
