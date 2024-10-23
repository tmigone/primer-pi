const nodaryEncoder = require('nodary-encoder');
const onoff = require('onoff');
const socketIO = require('socket.io-client')

const Gpio = onoff.Gpio;
const SERVER_URL = 'http://server:3000'

const button = new Gpio(17, 'in', 'rising', { debounceTimeout: 10 });
const encoder = nodaryEncoder(22, 27);
const io = socketIO(SERVER_URL);

console.log("-- Rotary Encoder --");

button.watch((err, value) => {
    if (err) {
        throw err;
    }

    io.emit('button-pressed')
    console.log(`Button pressed: ${value}`)
});

encoder.on('rotation', async (direction) => {
    io.emit('encoder-rotated', direction)
});

process.on('SIGINT', _ => {
    button.unexport();
});