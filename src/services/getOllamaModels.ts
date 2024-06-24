import { zFetch } from "../zFetch";
import * as dotenv from "dotenv";
import { OllamaApiTagsResponse } from "../types";

dotenv.config();

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
