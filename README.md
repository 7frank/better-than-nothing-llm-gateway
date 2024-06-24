# llm-gateway

LLM-Gateway - put your configurations for ollama, openai, etc behind a gateway behind on

- For `/v1/chat/completion` any openai compatible Provider is supported
- For `/v1/embeddings` only ollama is supported, which should chang ein the future, when ollama adds its own openAI compatible endpoint

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.25. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

# Ideas

- svelte runes frontend to configure routes
- zod schema and openapi endpoint
  - https://github.com/elierotenberg/fastify-zod (too complicated for now)
- config file with zod validation
- loadbalancing
- resilience

# Questions

- what about "sticky" request headers that are currently in place in k8s to ensure that conversations are handled by the same container. Does this interfere with the load balancer approach?
