import Fastify, { type FastifyRequest, type FastifyReply } from "fastify";

import type ProviderManager from "./ProviderManager";
import OpenAI from "openai";
import type { ChatCompletionCreateParams } from "openai/resources/chat/completions.mjs";
import type { Headers } from "openai/core";
import type {
  EmbeddingCreateParams,
  CreateEmbeddingResponse,
} from "openai/resources/embeddings.mjs";

import { zFetch } from "./zFetch";
import { OllamaEmbeddingsResponse } from "./types";

export function getApi(
  providers: Awaited<ReturnType<ProviderManager["build"]>>
) {
  const fastify = Fastify({ logger: true });
  fastify.post(
    "/v1/chat/completions",
    async (
      request: FastifyRequest<{ Body: ChatCompletionCreateParams }>,
      reply: FastifyReply
    ) => {
      let provider;
      try {
        provider = providers.selectProvider(request.body);
        if (!provider) {
          const availableProviders = providers
            .getProviders()
            .map(({ models, providerName }) => ({ providerName, models }));
          reply
            .headers({ "x-llm-proxy-forwarded-to": JSON.stringify(provider) })
            .status(400)
            .send(
              `No Provider available for '${request.body.model}': ${JSON.stringify(availableProviders)}`
            );
          return;
        }

        const modifiedRequest =
          provider.requestCallback?.(request, provider) ?? request;
        const llm = new OpenAI({
          baseURL: provider.baseURL,
          apiKey: "dummyKey",
        });
        const args = modifiedRequest.body as ChatCompletionCreateParams;
        const { host, ...headers } = modifiedRequest.headers as Headers;

        if (!provider.models.includes(args.model)) {
          reply
            .headers({ "x-llm-proxy-forwarded-to": JSON.stringify(provider) })
            .status(400)
            .send(
              `Provider: '${args.model}' Model not found. Available Models: ${JSON.stringify(provider.models)}`
            );
          return;
        }

        const response = (await llm.chat.completions.create(args, {
          headers,
        })) as unknown as FastifyReply;
        const modifiedResponse =
          provider.responseCallback?.(response) ?? response;

        reply
          .headers({ "x-llm-proxy-forwarded-to": JSON.stringify(provider) })
          .send(modifiedResponse);
      } catch (error: any) {
        fastify.log.error(error.message);
        reply
          .headers({ "x-llm-proxy-forwarded-to": JSON.stringify(provider) })
          .status(500)
          .send(`Internal Server Error: ${error.message}`);
      }
    }
  );

  fastify.post(
    "/v1/embeddings",
    async (
      request: FastifyRequest<{ Body: EmbeddingCreateParams }>,
      reply: FastifyReply
    ) => {
      const provider = providers.selectProvider(request.body);

      // FIXME  move this ollama specific code into the provider
      const baseUrl = provider.baseURL.endsWith("/v1")
        ? provider.baseURL.replace(/\/v1(\/.*)?$/, "")
        : provider.baseURL;

      // TODO what to do about the other params of request body
      // TODO do we want to hand enumber arrays for inpuot too?
      const { input, model } = request.body;

      if (typeof input == "object" && input.length > 1) {
        throw "Provider - Ollama does not support more than one input string";
      }

      const res = await zFetch(
        OllamaEmbeddingsResponse,
        baseUrl + "/api/embeddings",
        {
          method: "POST",
          body: JSON.stringify({
            model: "" + model,
            prompt: typeof input == "string" ? input : input[0],
          }),
        }
      );

      // const llm = new OpenAI({
      //   baseURL: provider.baseURL,
      //   apiKey: "dummyKey",
      // });
      // const res = await llm.embeddings.create(request.body);

      const openAiResponse: CreateEmbeddingResponse = {
        data: [{ embedding: res.embedding, index: 0, object: "embedding" }],
        model: request.body.model,
        object: "list",
        usage: { prompt_tokens: 1, total_tokens: 1 }, // TODO how to get these from ollama
      };

      reply.send(openAiResponse);
    }
  );

  return fastify;
}
