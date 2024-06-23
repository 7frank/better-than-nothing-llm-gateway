import type { FastifyRequest, FastifyReply } from "fastify";
import chalk from "chalk";

import type { ChatCompletionCreateParams } from "openai/resources/chat/completions.mjs";

import WRRPool from "wrr-pool";

interface Pool<T extends { weight: number }> {
  peers: { value: T }[];
  add: (config: T, weight: T["weight"]) => void;
  get: (fn: (t: T) => boolean) => { value: T; weight: number };
}

interface ProviderConfig {
  models: string[];
  providerName: string;
  baseURL: string;
  headers: Record<string, string>;
  requestCallback?: (
    req: FastifyRequest,
    config: ProviderConfig
  ) => FastifyRequest;
  responseCallback?: (res: FastifyReply) => FastifyReply;
  weight: number;
}

export const requestLogger = (
  req: FastifyRequest,
  provider: ProviderConfig
) => {
  console.log(
    chalk.bgBlue("Request"),
    chalk.underline(req.routeOptions.url),
    chalk.bgBlue("Handler"),
    chalk.underline(provider.providerName),
    chalk.bgBlue("Model"),
    chalk.underline((req.body as any).model)
  );
  return req;
};

class ProviderManager {
  private pool = new WRRPool() as Pool<ProviderConfig>;
  private currentIndex: number = -1;
  private currentWeight: number = 0;

  async addProvider(
    configFunc: () => Promise<ProviderConfig>
  ): Promise<ProviderConfig> {
    return await configFunc()
      .then((config) => {
        this.pool.add(config, config.weight);
        return config;
      })
      .catch((e) => console.log(e));
  }

  getProviders(): ProviderConfig[] {
    return this.pool.peers.map((p) => p.value) as any;
  }

  selectProvider(config: ChatCompletionCreateParams): ProviderConfig {
    const selected = this.pool.get(function (v) {
      return v.models.some((it) => it == config.model);
    });
    return selected?.value;
  }
}

export default ProviderManager;
