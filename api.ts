import Fastify, { type FastifyRequest, type FastifyReply } from "fastify";

import type ProviderManager from "./ProviderManager";
import OpenAI from "openai";
import type { ChatCompletionCreateParams } from "openai/resources/chat/completions.mjs";

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
          model: request.body.model,
          headers: modifiedRequest.headers,
        });

        const response = llm.chat.completions.create(
          modifiedRequest.body as ChatCompletionCreateParams
        );

        const modifiedResponse =
          provider.responseCallback?.(response) ?? request;
        reply.send(modifiedResponse.data);
      } catch (error: any) {
        fastify.log.error(
          "Error:",
          error.response ? error.response.data : error.message
        );
        reply.status(500).send("Internal Server Error");
      }
    }
  );

  return fastify;
}
