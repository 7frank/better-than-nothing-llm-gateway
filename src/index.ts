import * as dotenv from "dotenv";
import { z } from "zod";
import { getApi } from "./api";
import providers from "./providers";

dotenv.config();
const p =await providers.build()
const fastify = getApi(p);
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
