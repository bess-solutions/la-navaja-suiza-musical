require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("🚨 Error: GEMINI_API_KEY no definida en .env");
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: apiKey });

async function run() {
  console.log("Subiendo archivo de audio a Gemini...");
  try {
    const uploadResult = await ai.files.upload({
      file: "./content/shared/cancion_test.mp3",
      mimeType: "audio/mpeg",
    });
    console.log("Archivo subido:", uploadResult.name);

    console.log("Pidiendo transcripción a Gemini 1.5 Pro...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Usamos 2.5 que está en la lista
      contents: [
        { fileData: { fileUri: uploadResult.uri, mimeType: uploadResult.mimeType } },
        { text: "Escucha esta canción. 1) Describe brevemente la voz del cantante (género, edad aproximada, tono, sentimiento predominante). 2) Escribe la letra completa, dividida en segmentos de aproximadamente 5 a 10 segundos para videoclips. Devuelve ÚNICAMENTE un JSON con este formato: { 'voice_description': '...', 'lyrics': [ { 'start': ..., 'end': ..., 'text': ... }, ... ] }. No incluyas markdown." }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    console.log("¡Transcripción recibida!");
    console.log(response.text);
    
    // Guardamos el JSON
    fs.writeFileSync("./content/shared/lyrics.json", response.text);
    console.log("Guardado en content/shared/lyrics.json");

  } catch (error) {
    console.error("Error al usar Gemini:", error.message || error);
  }
}

run();
