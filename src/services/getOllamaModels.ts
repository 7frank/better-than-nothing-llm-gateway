import { zFetch } from "../zFetch";
import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

export const OllamaApiTagsResponse = z.object({
  models: z
    .object({
      name: z.string(),
    })
    .array(),
});

export async function getOllamaModels(
  baseUrl = "http://localhost:11434"
): Promise<string[]> {
  try {
    return await zFetch(OllamaApiTagsResponse, baseUrl + "/api/tags").then(
      (r) => r.models.map((m) => m.name)
    );
  } catch (e: any) {
    console.error(
      "Error: Could not retrieve models list - ",
      baseUrl,
      e.message
    );
    return [];
  }
}
