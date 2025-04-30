import { OpenAI } from "openai";

export const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey:
    "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",
});
