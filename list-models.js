import { GoogleGenAI } from "@google/genai";
const apiKey = "AIzaSyAxg9pvy8AsYX2Ojh9jrc159vZ8TtjbFLM";
const ai = new GoogleGenAI({ apiKey: apiKey });

async function run() {
  const models = await ai.models.list();
  for await (const model of models) {
    console.log(model.name);
  }
}
run();
