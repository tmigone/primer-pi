
const Pulse = require('pulseaudio2')
const wav = require('wav')
const fs = require('fs')
const socketIO = require('socket.io-client')

const SERVER_URL = 'http://server:3000'

console.log(`-- Audio player --`)
console.log(`PULSE_SERVER: ${process.env.PULSE_SERVER}`)
console.log(`PULSE_SINK: ${process.env.PULSE_SINK}`)

const io = socketIO(SERVER_URL);
const ctx = new Pulse()

let lastFile = null // The last file played
let currentFile = null // The file being played
let playbackStream = null // The PulseAudio playback stream being played

io.on('play', ({ file }) => {
    // If we are already playing the same file, ignore the request
    if (playbackStream !== null && file === currentFile) return;

    // If we are playing another file, stop it before playing the new file
    if (playbackStream !== null && file !== currentFile) stop(playbackStream);

    // Check if the audio file exists before attempting to play it
    if (!fs.existsSync(file)) {
        console.error(`Audio file not found: ${file}`);
        return;
    }

    play(ctx, file)
})

io.on('stop', () => {
    stop(playbackStream)
})

// Given a PulseAudio context and a WAV file, create a playback stream and play the file
function play(ctx, wavFile) {
    const reader = new wav.Reader()
    console.log(`Playing ${wavFile}`)
    fs.createReadStream(wavFile).pipe(reader)

    reader.pause()
    reader.on('format', (fmt) => {
        const play = ctx.createPlaybackStream({
            channels: fmt.channels,
            rate: fmt.sampleRate,
            format: (fmt.signed ? 'S' : 'U') + fmt.bitDepth + fmt.endianness,
        })
        playbackStream = play
        currentFile = wavFile
        lastFile = wavFile

        let duration = 0
        reader.on('data', (data) => {
            play.write(data)
            duration += data.length / (fmt.bitDepth / 8 * fmt.sampleRate * fmt.channels)
        })
        reader.on('end', () => {
            setTimeout(() => {
                stop(playbackStream)
            }, duration * 1000)
        })
        reader.resume()
    })
}

// Given a playback stream, stop it
function stop(playbackStream) {
    if (playbackStream !== null) {
        playbackStream.end()
        playbackStream = null
        currentFile = null
    }
}


