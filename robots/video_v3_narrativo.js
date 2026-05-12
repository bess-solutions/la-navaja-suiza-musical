const path = require('path')
const fs = require('fs')
const spawn = require('child_process').spawn
const rootPath = path.resolve(__dirname, '..')
const fromRoot = relPath => path.resolve(rootPath, relPath)

async function robot() {
  console.log('> [video-robot] Iniciando Renderizador Musical IA...')
  
  const ffmpegPath = require('ffmpeg-static')
  const sharedDir = fromRoot('./content/shared')
  const outputDir = fromRoot('./content/v3_narrativo')
  const lyricsPath = path.join(sharedDir, 'script.json')
  
  const files = fs.readdirSync(sharedDir)
  const audioFile = files.find(f => f.toLowerCase().endsWith('.wav') || f.toLowerCase().endsWith('.mp3'))
  const audioPath = audioFile ? path.join(sharedDir, audioFile) : null

  if (!fs.existsSync(lyricsPath) || !audioPath) {
    console.error('> [video-robot] ❌ Error: Faltan script.json o la pista de audio (.wav/.mp3).')
    return
  }

  const lyrics = JSON.parse(fs.readFileSync(lyricsPath, 'utf8'))
  const listFilePath = path.join(outputDir, 'concat_list.txt')
  
  let concatList = ''
  let clipCount = 0;

  for (let i = 0; i < lyrics.length; i++) {
    const scene = lyrics[i]
    const clipPath = path.join(outputDir, `clip_${i}.mp4`)
    
    if (!fs.existsSync(clipPath)) {
      console.warn(`> [video-robot] ⚠️ Faltan escenas. El clip_${i}.mp4 no existe. Renderizaremos hasta la escena ${i-1}.`)
      break;
    }
    
    let duration = (scene.end - scene.start).toFixed(2)
    if (parseFloat(duration) <= 0.1) duration = "5.00";

    const trimmedClipPath = path.join(outputDir, `trimmed_${i}.mp4`)
    
    console.log(`> [video-robot] Ajustando y recortando clip ${i} a ${duration} segundos...`)
    await trimAndScaleVideo(ffmpegPath, clipPath, trimmedClipPath, duration)
    
    concatList += `file '${trimmedClipPath.replace(/\\/g, '/')}'\n`
    clipCount++
  }

  if (clipCount === 0) {
    console.error('> [video-robot] ❌ No hay clips generados. Ejecuta video_generator primero.')
    return
  }

  fs.writeFileSync(listFilePath, concatList)

  console.log('> [video-robot] 🎬 Fusionando clips + audio WAV original (sin subtítulos)...')
  const finalOutputPath = path.join(outputDir, 'FINAL_MUSIC_VIDEO_NARRATIVO_v2.mp4')
  
  await new Promise((resolve, reject) => {
    const ffmpegArgs = [
      '-y',
      '-f', 'concat',
      '-safe', '0',
      '-i', listFilePath,    // input 0: video clips
      '-i', audioPath,        // input 1: WAV original
      '-map', '0:v:0',        // tomar SOLO el video del concat
      '-map', '1:a:0',        // tomar SOLO el audio del WAV
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '18',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-shortest',
      finalOutputPath
    ]

    const ffmpegProcess = spawn(ffmpegPath, ffmpegArgs)

    ffmpegProcess.stderr.on('data', (data) => {})

    ffmpegProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`\n> [video-robot] 🎉 ¡OBRA MAESTRA CREADA! El video musical está listo en: ${finalOutputPath}`)
        resolve()
      } else {
        console.error(`> [video-robot] ❌ Error en el render final de FFmpeg. Código: ${code}`)
        reject(new Error(`FFmpeg exited with code ${code}`))
      }
    })
  })
}

function trimAndScaleVideo(ffmpegPath, input, output, duration) {
  return new Promise((resolve, reject) => {
    const ffmpegArgs = [
      '-y',
      '-i', input,
      '-t', duration,
      '-vf', 'scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080',
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-c:a', 'aac',
      output
    ]

    const ffmpegProcess = spawn(ffmpegPath, ffmpegArgs)
    ffmpegProcess.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`Trim failed for ${input}`))
    })
  })
}

function formatTime(secondsStr) {
  const totalSeconds = parseFloat(secondsStr)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)
  const milliseconds = Math.floor((totalSeconds % 1) * 1000)

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(milliseconds, 3)}`
}

function pad(num, size = 2) {
  let s = num + ""
  while (s.length < size) s = "0" + s
  return s
}

module.exports = robot
