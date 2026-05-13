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

  const data = JSON.parse(fs.readFileSync(lyricsPath, 'utf8'));
  const lyrics = data.lyrics;
  const voiceDescription = data.voice_description;
  console.log(`> [scriptwriter] Analizando ${lyrics.length} escenas de la letra...`);
  console.log(`> [scriptwriter] Voz detectada: ${voiceDescription}`);

  const systemInstruction = `
Eres un Director de Cine y Videoclips de vanguardia de nivel Hollywood.
Tu objetivo es analizar la letra y la descripción de la voz para crear un videoclip narrativo coherente y visualmente impactante.

VOZ DEL ARTISTA: ${voiceDescription}

PASO 1: Define al PROTAGONISTA MAESTRO:
- Crea una descripción física ULTRA-DETALLADA (etnia, edad, ropa específica, accesorios, rasgos faciales) que coincida con la voz. 
- Esta descripción DEBE repetirse en todos los prompts para mantener la consistencia.

PASO 2: Define el ESTILO VISUAL:
- Elige una estética cinematográfica (ej: Cyberpunk, Cine Noir, Vintage 70s, Realismo Épico) acorde al sentimiento de la letra.

PASO 3: Genera un guion técnico.
REGLA DE ORO 1: CONSISTENCIA. Cada "prompt" debe empezar describiendo al protagonista y el entorno para que la IA no invente personajes nuevos.
REGLA DE ORO 2: LIP SYNC (CLAVE). Identifica las escenas donde la letra es intensa o el cantante debería estar interpretando a cámara. 
    - Si "singing" es true, el prompt debe especificar "facing camera, singing, high detail on mouth".
REGLA DE ORO 3: IDIOMA. Los prompts deben estar en INGLÉS técnico de cine.

FORMATO DE SALIDA: Devuelve estrictamente un array JSON válido, donde cada elemento sea el objeto original pero añadiendo:
- "prompt": Instrucciones en inglés.
- "singing": boolean indicando si canta a cámara en ese clip.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: "user",
        parts: [
          { text: "Genera el guion técnico maestro basado en esta letra:\n\n" + JSON.stringify(lyrics) }
        ]
      }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      }
    });

    const scriptJson = JSON.parse(response.text);
    
    fs.writeFileSync(scriptPath, JSON.stringify(scriptJson, null, 2));
    console.log(`> [scriptwriter] ¡Guion técnico maestro escrito! Guardado en script.json.`);

  } catch (error) {
    console.error("> [scriptwriter] Error generando guion:", error);
  }
}

module.exports = robot;
