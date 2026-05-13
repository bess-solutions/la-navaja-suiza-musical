const path = require('path')
const fs = require('fs')
const spawn = require('child_process').spawn
const rootPath = path.resolve(__dirname, '..')
const fromRoot = relPath => path.resolve(rootPath, relPath)

async function robot() {
  console.log('> [video-high-end] 🚀 Iniciando Motor de Renderizado de Alta Gama...')
  
  const ffmpegPath = require('ffmpeg-static')
  const sharedDir = fromRoot('./content/shared')
  const outputDir = fromRoot('./content/v2_documental')
  const lyricsPath = path.join(sharedDir, 'lyrics.json')
  
  const files = fs.readdirSync(sharedDir)
  const audioFile = files.find(f => f.toLowerCase().endsWith('.wav') || f.toLowerCase().endsWith('.mp3'))
  const audioPath = audioFile ? path.join(sharedDir, audioFile) : null

  if (!fs.existsSync(lyricsPath) || !audioPath) {
    console.error('> [video-high-end] ❌ Error: Faltan archivos necesarios.')
    return
  }

  const images = files.filter(f => f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.png') || f.toLowerCase().endsWith('.jpeg'))
  
  const data = JSON.parse(fs.readFileSync(lyricsPath, 'utf8'))
  const lyrics = data.lyrics || data
  const listFilePath = path.join(outputDir, 'concat_list.txt')
  const subFilePath = path.join(outputDir, 'subtitles.srt')
  
  let srtContent = ''
  let concatList = ''

  for (let i = 0; i < lyrics.length; i++) {
    const scene = lyrics[i]
    const imageToUse = images[i % images.length]
    const imagePath = path.join(sharedDir, imageToUse)
    const clipPath = path.join(outputDir, `high_end_${i}.mp4`)
    
    let duration = (scene.end - scene.start).toFixed(2)
    if (parseFloat(duration) <= 0.1) duration = "5.00";
    
    console.log(`> [video-high-end] Procesando escena ${i} con estética cinematográfica...`)
    await animateImageHighEnd(ffmpegPath, imagePath, clipPath, duration, i)
    
    concatList += `file '${clipPath.replace(/\\/g, '/')}'\n`
    srtContent += `${i + 1}\n${formatTime(scene.start)} --> ${formatTime(scene.end)}\n${scene.text.toUpperCase()}\n\n`
  }

  fs.writeFileSync(listFilePath, concatList)
  fs.writeFileSync(subFilePath, srtContent)

  console.log('> [video-high-end] 🎬 Ensamblaje final con Color Grading y Texturas...')
  const finalOutputPath = path.join(outputDir, 'HIGH_END_MUSIC_VIDEO.mp4')
  const srtRelative = subFilePath.replace(/\\/g, '/').replace('C:', 'C\\:')
  
  await new Promise((resolve, reject) => {
    const ffmpegArgs = [
      '-y',
      '-f', 'concat',
      '-safe', '0',
      '-i', listFilePath,
      '-i', audioPath,
      '-vf', `subtitles='${srtRelative}':force_style='Fontname=Oswald,FontSize=36,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=2'`,
      '-c:v', 'libx264',
      '-preset', 'slow',
      '-crf', '18',
      '-c:a', 'aac',
      '-b:a', '256k',
      '-shortest',
      finalOutputPath
    ]

    const ffmpegProcess = spawn(ffmpegPath, ffmpegArgs)
    ffmpegProcess.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`Final assembly failed`))
    })
  })
  console.log(`> [video-high-end] 🎉 ¡VIDEO DE ALTA GAMA LISTO! -> ${finalOutputPath}`)
}

function animateImageHighEnd(ffmpegPath, inputImage, outputVideo, duration, index) {
  return new Promise((resolve, reject) => {
    const frames = Math.ceil(parseFloat(duration) * 25);
    const effects = [
      `zoompan=z='min(zoom+0.001,1.3)':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'`,
      `zoompan=z='max(1.3-0.001*on,1)':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'`
    ];
    
    const selectedEffect = effects[index % effects.length];
    
    // Filtros de Alta Gama: Color Grading + Vignette + Grain
    const highEndFilters = [
      `scale=3840:-1`, // Super sampling
      selectedEffect,
      `scale=1920:1080,crop=1920:1080`,
      `curves=vintage`, // Color grading estilo vintage
      `vignette=PI/4`,  // Viñeteado cinematográfico
      `noise=alls=7:allf=t+u`, // Grano de película sutil
      `unsharp=3:3:1.5` // Enfoque extra
    ].join(',');

    const ffmpegArgs = [
      '-y',
      '-loop', '1',
      '-i', inputImage,
      '-t', duration,
      '-vf', highEndFilters,
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-pix_fmt', 'yuv420p',
      outputVideo
    ]

    const ffmpegProcess = spawn(ffmpegPath, ffmpegArgs)
    ffmpegProcess.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`Scene ${index} failed`))
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
