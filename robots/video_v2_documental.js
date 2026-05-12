const path = require('path')
const fs = require('fs')
const spawn = require('child_process').spawn
const rootPath = path.resolve(__dirname, '..')
const fromRoot = relPath => path.resolve(rootPath, relPath)

async function robot() {
  console.log('> [video-v2-documental] Iniciando Motor de Animación Cinemática 2D (Ken Burns)...')
  
  const ffmpegPath = require('ffmpeg-static')
  const sharedDir = fromRoot('./content/shared')
  const outputDir = fromRoot('./content/v2_documental')
  const lyricsPath = path.join(sharedDir, 'lyrics.json')
  
  const files = fs.readdirSync(sharedDir)
  const audioFile = files.find(f => f.toLowerCase().endsWith('.wav') || f.toLowerCase().endsWith('.mp3'))
  const audioPath = audioFile ? path.join(sharedDir, audioFile) : null

  if (!fs.existsSync(lyricsPath) || !audioPath) {
    console.error('> [video-v2-documental] ❌ Error: Faltan lyrics.json o el audio en content/shared.')
    return
  }

  const images = files.filter(f => f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.png') || f.toLowerCase().endsWith('.jpeg'))
  if (images.length === 0) {
    console.error('> [video-v2-documental] ❌ Error: No hay imágenes en la carpeta content/shared/.')
    return
  }
  
  console.log(`> [video-v2-documental] ¡Encontradas ${images.length} fotos base para animar!`)

  const lyrics = JSON.parse(fs.readFileSync(lyricsPath, 'utf8'))
  const listFilePath = path.join(outputDir, 'concat_list.txt')
  const subFilePath = path.join(outputDir, 'subtitles.srt')
  
  let srtContent = ''
  let concatList = ''
  let clipCount = 0

  for (let i = 0; i < lyrics.length; i++) {
    const scene = lyrics[i]
    const imageToUse = images[i % images.length]
    const imagePath = path.join(sharedDir, imageToUse)
    const clipPath = path.join(outputDir, `animated_${i}.mp4`)
    
    let duration = (scene.end - scene.start).toFixed(2)
    if (parseFloat(duration) <= 0.1) duration = "5.00";
    
    console.log(`> [video-v2-documental] Animando foto [${imageToUse}] para la escena ${i} (${duration}s)...`)
    await animateImage(ffmpegPath, imagePath, clipPath, duration, i)
    
    concatList += `file '${clipPath.replace(/\\/g, '/')}'\n`
    clipCount++

    const startSrt = formatTime(scene.start)
    const endSrt = formatTime(scene.end)
    srtContent += `${i + 1}\n${startSrt} --> ${endSrt}\n${scene.text.toUpperCase()}\n\n`
  }

  fs.writeFileSync(listFilePath, concatList)
  fs.writeFileSync(subFilePath, srtContent)

  console.log('> [video-v2-documental] 🎬 Uniendo pistas de video, audio original y quemando Subtítulos Karaoke...')
  const finalOutputPath = path.join(outputDir, 'FINAL_MUSIC_VIDEO_DOCUMENTAL.mp4')
  const srtRelative = subFilePath.replace(/\\/g, '/').replace('C:', 'C\\:')
  
  await new Promise((resolve, reject) => {
    const ffmpegArgs = [
      '-y',
      '-f', 'concat',
      '-safe', '0',
      '-i', listFilePath,
      '-i', audioPath,
      '-vf', `subtitles='${srtRelative}':force_style='Fontname=Impact,FontSize=42,PrimaryColour=&H0000FFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=3'`,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '18',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-shortest',
      finalOutputPath
    ]

    const ffmpegProcess = spawn(ffmpegPath, ffmpegArgs)

    ffmpegProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`\n> [video-v2-documental] 🎉 ¡VIDEOCLIP CREADO CON ÉXITO! Guardado en: ${finalOutputPath}`)
        resolve()
      } else {
        console.error(`> [video-v2-documental] ❌ Error en render final FFmpeg.`)
        reject(new Error(`FFmpeg exited with code ${code}`))
      }
    })
  })
}

function animateImage(ffmpegPath, inputImage, outputVideo, duration, index) {
  return new Promise((resolve, reject) => {
    const frames = Math.ceil(parseFloat(duration) * 25);
    const effects = [
      `zoompan=z='min(zoom+0.0015,1.5)':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'`,
      `zoompan=z='max(1.5-0.0015*on,1)':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'`,
      `zoompan=z=1.2:d=${frames}:x='x+1':y='ih/2-(ih/zoom/2)'`,
      `zoompan=z=1.2:d=${frames}:x='iw/2-(iw/zoom/2)':y='y+1'`
    ];
    
    const selectedEffect = effects[index % effects.length];

    const ffmpegArgs = [
      '-y',
      '-loop', '1',
      '-i', inputImage,
      '-t', duration,
      '-vf', `scale=8000:-1,${selectedEffect},scale=1920:1080,crop=1920:1080`,
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-pix_fmt', 'yuv420p',
      outputVideo
    ]

    const ffmpegProcess = spawn(ffmpegPath, ffmpegArgs)
    ffmpegProcess.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`Animation failed for ${inputImage}`))
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
