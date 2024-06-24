import { createZodFetcher } from "zod-fetch";

var fetcher = async (...args: Parameters<typeof fetch>) => {
  const response = await fetch(...args);
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
};

export const zFetch = createZodFetcher(fetcher);
