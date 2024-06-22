import type { FastifyRequest, FastifyReply } from "fastify";
import chalk from "chalk"
interface ProviderConfig {
  models: string[];
  providerName: string;
  baseURL: string;
  headers: Record<string, string>;
  requestCallback?: (
    req: FastifyRequest,
    config: ProviderConfig
  ) => FastifyRequest;
  responseCallback?: (res: any) => any;
  weight: number;
  currentWeight?: number;
}

export const requestLogger = (
  req: FastifyRequest,
  provider: ProviderConfig
) => {
  console.log(chalk.bgBlue("Request"), chalk.underline(req.routerPath), chalk.bgBlue("Handler"), chalk.underline(provider.providerName));
  return req;
};

class ProviderManager {
  private providers: ProviderConfig[] = [];
  private currentIndex: number = -1;
  private currentWeight: number = 0;

  async addProvider(
    configFunc: () => Promise<ProviderConfig>
  ): Promise<ProviderConfig> {
    const config = await configFunc();
    config.currentWeight = config.weight;
    this.providers.push(config);
    return config;
  }

  getProviders(): ProviderConfig[] {
    return this.providers;
  }

  selectProvider(): ProviderConfig {
    if (this.providers.length === 0) {
      throw new Error("No providers available");
    }

    while (true) {
      this.currentIndex = (this.currentIndex + 1) % this.providers.length;
      if (this.currentIndex === 0) {
        this.currentWeight = this.currentWeight - 1;
        if (this.currentWeight <= 0) {
          this.currentWeight = Math.max(...this.providers.map((p) => p.weight));
          if (this.currentWeight === 0) {
            // FIXME
            return null;
          }
        }
      }

      if (this.providers[this.currentIndex].weight >= this.currentWeight) {
        return this.providers[this.currentIndex];
      }
    }
  }
}

export default ProviderManager;
