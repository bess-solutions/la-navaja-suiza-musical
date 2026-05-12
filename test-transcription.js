import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const apiKey = "AIzaSyAxg9pvy8AsYX2Ojh9jrc159vZ8TtjbFLM";
const ai = new GoogleGenAI({ apiKey: apiKey });

async function run() {
  console.log("Subiendo archivo de audio a Gemini...");
  try {
    const uploadResult = await ai.files.upload({
      file: "./content/CADA_VEZ_QUE_ESCRIBO_CON_SCRATCH.wav",
      mimeType: "audio/wav",
    });
    console.log("Archivo subido:", uploadResult.name);

    console.log("Pidiendo transcripción a Gemini 1.5 Pro...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { fileData: { fileUri: uploadResult.uri, mimeType: uploadResult.mimeType } },
        { text: "Escucha esta canción de rap/hip hop. Escribe la letra completa, dividida en segmentos de aproximadamente 5 a 8 segundos. Devuelve ÚNICAMENTE un JSON array válido. Cada objeto del array debe tener: 'start' (número en segundos), 'end' (número en segundos), y 'text' (la frase). No incluyas markdown ni explicaciones, solo el JSON puro." }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    console.log("¡Transcripción recibida!");
    console.log(response.text);
    
    // Guardamos el JSON
    fs.writeFileSync("./content/lyrics.json", response.text);
    console.log("Guardado en content/lyrics.json");

  } catch (error) {
    console.error("Error al usar Gemini:", error.message || error);
  }
}

run();
