import Fastify, { type FastifyRequest, type FastifyReply } from "fastify";

import type ProviderManager from "./ProviderManager";
import OpenAI from "openai";
import type {
  ChatCompletionCreateParams,
  ChatCompletionCreateParamsNonStreaming,
} from "openai/resources/chat/completions.mjs";
import type { Headers } from "openai/core";

export function getApi(providers: ProviderManager) {
  const fastify = Fastify({ logger: true });
  fastify.post(
    "/v1/chat/completions",
    async (
      request: FastifyRequest<{ Body: ChatCompletionCreateParams }>,
      reply: FastifyReply
    ) => {
      let provider;
      try {
        provider = providers.selectProvider();
        const modifiedRequest =
          provider.requestCallback?.(request, provider) ?? request;

        const llm = new OpenAI({
          baseURL: "http://ollama.kong.7frank.internal.jambit.io/v1",
          apiKey: "dummyKey",
        });

        const args = modifiedRequest.body as ChatCompletionCreateParams;

        const { host, ...rest } = modifiedRequest.headers;

        const headers = rest as Headers;

        if (!provider.models.some((m) => m == args.model)) {
          reply
            .headers({ "x-llm-proxy-forwarded-to": JSON.stringify(provider) })
            .status(400)
            .send(
              `Provider: '${args.model}' Model not found. Available Models:` +
                JSON.stringify(provider.models)
            );
          return;
        }

        // TODO type conversion
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
          .send("Internal Server Error" + error.message);
      }
    }
  );

  return fastify;
}
