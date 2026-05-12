const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const apiKey = "AIzaSyAxg9pvy8AsYX2Ojh9jrc159vZ8TtjbFLM";
const ai = new GoogleGenAI({ apiKey: apiKey });

async function robot() {
  console.log('> [scriptwriter] Iniciando el Escritor de Guion Cinematográfico IA...');
  
  const contentPath = path.resolve(__dirname, '../content/shared');
  const lyricsPath = path.join(contentPath, 'lyrics.json');
  const scriptPath = path.join(contentPath, 'script.json');

  if (!fs.existsSync(lyricsPath)) {
    throw new Error("> [scriptwriter] No se encontró lyrics.json");
  }

  const lyrics = JSON.parse(fs.readFileSync(lyricsPath, 'utf8'));
  console.log(`> [scriptwriter] Analizando ${lyrics.length} escenas de la letra...`);

  const systemInstruction = `
Eres un Director de Videoclips de Hip Hop Underground de élite.
Tu objetivo es leer las letras de una canción y generar un guion técnico visual continuo y altamente detallado para un generador de video AI.
REGLA DE ORO 1: CONSISTENCIA DE PERSONAJE. El video sigue a un protagonista fijo para mantener la consistencia. Descríbelo en CADA prompt como: "The Protagonist: A 25-year-old gritty Latin American male underground rapper, short fade haircut, wearing a baggy black hoodie, a silver chain, and dark baggy jeans". NO uses nombres reales.
REGLA DE ORO 2: ESTILO VISUAL FIJO. Cada prompt debe terminar con el estilo: "Cinematic, raw 1990s underground hip-hop music video, shot on 16mm gritty film, heavy film grain, low budget street aesthetic, realistic Latin American urban decay. No glossy CGI, no modern neon."
REGLA DE ORO 3: NARRATIVA. Crea una historia que fluya. Empezamos en un callejón, luego él camina, luego rapea a la cámara, interactúa con el entorno, etc. Las acciones deben reflejar la emoción de la letra.
FORMATO: Devuelve estrictamente un array JSON válido, donde cada elemento sea el objeto original pero añadiendo la clave "prompt" con tus instrucciones de cámara y acción en inglés.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: "user",
        parts: [
          { text: "Aquí tienes el array JSON con la letra y los tiempos. Devuélvelo añadiendo el campo 'prompt' a cada objeto.\n\n" + JSON.stringify(lyrics) }
        ]
      }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      }
    });

    const outputText = response.text;
    const scriptJson = JSON.parse(outputText);
    
    fs.writeFileSync(scriptPath, JSON.stringify(scriptJson, null, 2));
    console.log(`> [scriptwriter] ¡Guion técnico maestro escrito! Guardado en script.json.`);

  } catch (error) {
    console.error("> [scriptwriter] Error generando guion:", error);
  }
}

module.exports = robot;
