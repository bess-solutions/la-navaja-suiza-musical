import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const apiKey = "AIzaSyAxg9pvy8AsYX2Ojh9jrc159vZ8TtjbFLM";
const ai = new GoogleGenAI({ apiKey: apiKey });

async function run() {
  console.log("Leyendo primera frase del JSON de letras...");
  const lyricsData = JSON.parse(fs.readFileSync('./content/lyrics.json', 'utf8'));
  const firstLine = lyricsData[0].text;
  
  console.log(`Frase elegida: "${firstLine}"`);
  const prompt = `A highly cinematic, professional hip-hop music video scene. Visuals perfectly match the feeling of the following lyric: "${firstLine}". Urban setting, dark mood, moody lighting, 4k, hyperrealistic, moving camera.`;
  
  console.log("Pidiendo generación de video a Veo 3.1...");
  
  try {
    let operation = await ai.models.generateVideos({
      model: "veo-3.1-generate-preview",
      prompt: prompt,
      config: {
        aspectRatio: "16:9",
      },
    });

    // Poll the operation status until the video is ready.
    while (!operation.done) {
      console.log("Esperando a que Veo 3.1 genere el video (esto puede tomar varios minutos)...");
      await new Promise((resolve) => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({
        operation: operation,
      });
    }

    console.log("¡Video generado con éxito!");
    // Download the generated video.
    await ai.files.download({
      file: operation.response.generatedVideos[0].video,
      downloadPath: "./content/clip_0.mp4",
    });

    console.log(`Video guardado en ./content/clip_0.mp4`);
  } catch (error) {
    console.error("Error al generar video:", error.message || error);
  }
}

run();
