const path = require('path')
const { nodewhisper } = require('nodejs-whisper')

async function test() {
  const audioPath = path.resolve(__dirname, 'content/CADA_VEZ_QUE_ESCRIBO_CON_SCRATCH.wav')
  console.log(`> Transcribing audio: ${audioPath}`)
  
  try {
    const transcript = await nodewhisper(audioPath, {
      modelName: 'base', // The language is Spanish, so we shouldn't use .en
      autoDownloadModelName: 'base',
      whisperOptions: {
        outputInText: true,
        outputInVtt: true, // VTT gives timestamps!
        language: 'es'
      }
    })
    console.log('> Transcription successful!')
    console.log(transcript)
  } catch (error) {
    console.error('> Transcription failed:', error)
  }
}

test()
