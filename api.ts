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
      try {
        const provider = providers.selectProvider();
        const modifiedRequest =
          provider.requestCallback?.(request, provider) ?? request;
        const llm = new OpenAI({
          baseURL: provider.baseURL,
          apiKey: "dummyKey",
        });

        const args = modifiedRequest.body as ChatCompletionCreateParams;
        const headers = { ...modifiedRequest.headers } as Headers;
        const response = llm.chat.completions.create(args, { headers });

        const modifiedResponse =
          provider.responseCallback?.(response) ?? request;
        reply.send(modifiedResponse.data);
      } catch (error: any) {
        console.log(error.message);
        fastify.log.error(error.message);
        reply.status(500).send("Internal Server Error");
      }
    }
  );

  return fastify;
}
