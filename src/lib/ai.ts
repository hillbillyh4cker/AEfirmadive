import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

export type AIProvider = "gemini" | "openai" | "anthropic";

export async function analyzeFirmwareData(data: string, apiKey: string, provider: AIProvider) {
  if (!apiKey) {
    throw new Error(`${provider.toUpperCase()} API Key is missing. Please set it in Settings.`);
  }

  const prompt = `
    You are a firmware security expert analyzing a firmware binary using tools like Firmadyne, FirmAE, binwalk, and strings.
    
    Data to analyze:
    ${data}
    
    Provide a professional, concise security report in markdown format. 
    Focus on:
    1. Identification (What OS/Filesystem likely is this?)
    2. Potential vulnerabilities or interesting files/paths.
    3. Any hardcoded credentials, keys, or IPs found.
    4. Next steps for dynamic emulation or exploitation.
  `;

  try {
    if (provider === "gemini") {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } else if (provider === "openai") {
      const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
      });
      return completion.choices[0].message.content || "";
    } else if (provider === "anthropic") {
      // Anthropic requires API requests to go through a backend for browser, unless we bypass with dangerouslyAllowBrowser (which Anthropic TS SDK doesn't natively expose well without headers or fetch overrides, wait, anthropic SDK has a similar option `dangerouslyAllowBrowser: true`.)
      const anthropic = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
      const msg = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      });
      // @ts-ignore
      return msg.content[0].text || "";
    }
    
    throw new Error("Invalid Provider Selected");
  } catch (error: any) {
    throw new Error(`[${provider.toUpperCase()}] Analysis failed: ${error.message}`);
  }
}
