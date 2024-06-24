import Fastify, { type FastifyRequest, type FastifyReply } from "fastify";

import type ProviderManager from "./ProviderManager";
import OpenAI from "openai";
import type { ChatCompletionCreateParams } from "openai/resources/chat/completions.mjs";
import type { Headers } from "openai/core";
import type { EmbeddingCreateParams } from "openai/resources/embeddings.mjs";

export function getApi(providers: ProviderManager) {
  const fastify = Fastify({ logger: true });
  fastify.post(
    "/v1/chat/completions",
    async (
      request: FastifyRequest<{ Body: ChatCompletionCreateParams }>,
      reply: FastifyReply
    ) => {
      try {
        const provider = providers.selectProvider(request.body);
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
    { schema: {} },
    async (
      request: FastifyRequest<{ Body: EmbeddingCreateParams }>,
      reply: FastifyReply
    ) => {
      const provider = providers.selectProvider(request.body);

      const llm = new OpenAI({
        baseURL: provider.baseURL,
        apiKey: "dummyKey",
      });
      const res = await llm.embeddings.create(request.body);

      reply.send(res);
    }
  );

  return fastify;
}
