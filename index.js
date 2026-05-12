const robots = {
  scriptwriter: require('./robots/scriptwriter.js'),
  video_generator_v3: require('./robots/video_generator_v3.js'),
  video_v3_narrativo: require('./robots/video_v3_narrativo.js'),
  video_v2_documental: require('./robots/video_v2_documental.js')
}

async function start() {
  const args = process.argv.slice(2);
  const mode = args[0];

  if (!mode) {
    console.log(`
🚀 BIENVENIDO A LA NAVAJA SUIZA MUSICAL 🚀

Uso: node index.js [modo]

Modos disponibles:
  documental   -> Anima fotos reales con FFmpeg (Ken Burns) + Karaoke.
  narrativo    -> [NUEVO] Usa Inteligencia Artificial para crear trama y video (Google Veo 3.1).
  
Ejemplo: node index.js narrativo
    `);
    process.exit(1);
  }

  if (mode === 'documental') {
    console.log("🎬 EJECUTANDO MODO DOCUMENTAL (KEN BURNS) 🎬\n");
    await robots.video_v2_documental();
  } 
  else if (mode === 'narrativo') {
    console.log("🎬 EJECUTANDO MODO DIRECTOR DE CINE IA (GUION + VEO 3.1) 🎬\n");
    await robots.scriptwriter();
    await robots.video_generator_v3();
    await robots.video_v3_narrativo();
  } 
  else {
    console.error(`❌ Modo desconocido: ${mode}. Usa 'documental' o 'narrativo'.`);
  }
}

start();
