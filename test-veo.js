require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("🚨 Error: GEMINI_API_KEY no definida en .env");
  process.exit(1);
}
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
      await new Promise((resolve) => setTimeout(resolve, 15000)); // Audit: 15s
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
    if (error.message.includes("429") || error.message.includes("403")) {
        process.exit(1); // Audit: Emergency stop
    }
  }
}

run();
