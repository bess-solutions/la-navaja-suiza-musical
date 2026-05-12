const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const apiKey = "AIzaSyAxg9pvy8AsYX2Ojh9jrc159vZ8TtjbFLM";
const ai = new GoogleGenAI({ apiKey: apiKey });

async function robot() {
  console.log("> [video-generator] Iniciando Director de Video con Veo 3.1...");
  
  const sharedPath = path.resolve('./content/shared');
  const outputPath = path.resolve('./content/v3_narrativo');
  const scriptPath = path.join(sharedPath, 'script.json');

  if (!fs.existsSync(scriptPath)) {
    console.error("> [video-generator] ❌ Error: Faltan script.json en content/shared/. Ejecuta el guionista primero.");
    return;
  }

  const lyrics = JSON.parse(fs.readFileSync(scriptPath, 'utf8'));
  console.log(`> [video-generator] Guion Técnico cargado con ${lyrics.length} escenas.`);

  for (let i = 0; i < lyrics.length; i++) {
    const scene = lyrics[i];
    const clipPath = path.join(outputPath, `clip_${i}.mp4`);
    
    if (fs.existsSync(clipPath)) {
      console.log(`> [video-generator] Clip ${i} ya existe. Saltando...`);
      continue;
    }

    console.log(`\n> [video-generator] 🎬 Filmando Escena ${i}/${lyrics.length}: "${scene.text}"`);
    console.log(`> [video-generator] 📜 Prompt: ${scene.prompt}`);
    
    const prompt = scene.prompt;
    
    let success = false;
    let attempts = 0;

    while (!success && attempts < 3) {
      try {
        console.log(`> [video-generator] Enviando orden a Google Veo 3.1 (Intento ${attempts + 1})...`);
        let operation = await ai.models.generateVideos({
          model: "veo-3.1-generate-preview",
          prompt: prompt,
          config: {
            aspectRatio: "16:9",
          },
        });

        while (!operation.done) {
          console.log(`> [video-generator] Renderizando clip ${i}... (esperando 15s)`);
          await new Promise((resolve) => setTimeout(resolve, 15000));
          operation = await ai.operations.getVideosOperation({
            operation: operation,
          });
        }

        console.log(`> [video-generator] ✅ Clip ${i} generado. Descargando...`);
        if (!operation.response || !operation.response.generatedVideos || !operation.response.generatedVideos[0]) {
          console.error("> [video-generator] DETALLES DE RESPUESTA:", JSON.stringify(operation, null, 2));
          throw new Error("La respuesta de Veo no contiene generatedVideos. (Posible bloqueo de seguridad por el prompt 'aggressive').");
        }
        await ai.files.download({
          file: operation.response.generatedVideos[0].video,
          downloadPath: clipPath,
        });
        
        console.log(`> [video-generator] 💾 Guardado como clip_${i}.mp4`);
        success = true;
        
        // "Iteración tranquila" para evitar Rate Limits
        console.log("> [video-generator] Descansando 30 segundos antes de la siguiente escena para respetar límites de cuota...");
        await new Promise((resolve) => setTimeout(resolve, 30000));
        
      } catch (error) {
        console.error(`> [video-generator] ❌ Error en escena ${i}:`, error.message);
        attempts++;
        if (error.message.includes("429") || error.message.includes("quota")) {
          console.log("> [video-generator] ⏳ Límite de cuota alcanzado. Esperando 2 minutos antes de reintentar...");
          await new Promise((resolve) => setTimeout(resolve, 120000)); // Esperar 2 minutos
        } else {
          console.log("> [video-generator] ⏳ Esperando 30 segundos antes de reintentar...");
          await new Promise((resolve) => setTimeout(resolve, 30000));
        }
      }
    }
    
    if (!success) {
      console.error(`> [video-generator] 🚨 Abortando. No se pudo generar la escena ${i} después de 3 intentos.`);
      break; // Salir si falla mucho para no gastar recursos
    }
  }
}

module.exports = robot;
