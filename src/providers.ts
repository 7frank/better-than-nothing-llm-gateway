import ProviderManager, { requestLogger } from "./ProviderManager";
import { getOllamaModels } from "./services/getOllamaModels";

const providerManager = new ProviderManager()
  .addProvider(async () => {
    const availableModels = await getOllamaModels(
      "http://ollama.kong.7frank.internal.jambit.io"
    );

    return {
      models: availableModels ?? [],
      providerName: "Ollama-GPU",
      baseURL: "http://ollama.kong.7frank.internal.jambit.io/v1",
      headers: {},
      weight: 1,
      requestCallback: requestLogger,
    };
  })
  .addProvider(async () => {
    const availableModels = await getOllamaModels("http://localhost:11434");
    return {
      models: availableModels ?? [],
      providerName: "Ollama-Local",
      baseURL: "http://localhost:11434/v1",
      headers: {},
      weight: 1,
    };
  });

export default providerManager;
