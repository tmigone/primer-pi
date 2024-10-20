const Mfrc522 = require('rc522-rpi');
const SoftSPI = require('rpi-softspi');
const socketIO = require('socket.io-client');

// Raspberry Pi GPIO pins
const GPIO_SCLK = 23;
const GPIO_MOSI = 19;
const GPIO_MISO = 21;
const GPIO_CS = 24;
const GPIO_RESET = 22;

const SERVER_URL = 'http://server:3000';
const RFID_SCAN_INTERVAL = 500;

console.log("-- RC522 RFID Reader --");
console.log("Scanning...");

const io = socketIO(SERVER_URL);
const softSPI = new SoftSPI({
    clock: GPIO_SCLK, // SCLK
    mosi: GPIO_MOSI, // MOSI
    miso: GPIO_MISO, // MISO
    client: GPIO_CS // CS
});
const mfrc522 = new Mfrc522(softSPI).setResetPin(GPIO_RESET);

setInterval(function () {
    mfrc522.reset();

    let response = mfrc522.findCard();
    if (!response.status) {
        return;
    }

    response = mfrc522.getUid();
    if (!response.status) {
        console.log("UID Scan Error");
        return;
    }

    const uid = response.data;
    const uidHex = uid.map(byte => byte.toString(16).padStart(2, '0')).join('');
    console.log("RFID detected with UID:", uidHex);
    io.emit('rfid-read', uidHex);

    mfrc522.stopCrypto();
}, RFID_SCAN_INTERVAL);
