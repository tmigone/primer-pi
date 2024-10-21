import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs = require('fs');
import path = require('path');

const DATABASE_FILE = 'db.json';
const INIT_DATABASE_FILE = 'db.init.json';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

initDb();
let db = readDb();

app.use(express.static(path.join(__dirname, '..', 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

io.on("connection", (socket) => {
    socket.on('rfid-read', (uidHex: string) => {
        socket.broadcast.emit('rfid-read', uidHex);

        const audioFilePath = db[uidHex];
        if (audioFilePath) {
            console.log(`RFID ${uidHex} matched with audio file: ${audioFilePath}`);
            socket.broadcast.emit('play', { uid: uidHex, file: audioFilePath });
        } else {
            console.log(`No audio file found for RFID ${uidHex}`);
            return;
        }
    });

    socket.on('get-db', () => {
        socket.emit('db-data', db);
    });

    socket.on('update-db', (data) => {
        if (data.filePath) {
            db[data.uid] = data.filePath;
        } else {
            delete db[data.uid];
        }
        writeDb(db);
        socket.emit('db-data', db);
    });
});

console.log('--- Raspibox Server ---');
console.log(`Server listening on port 3000`);
httpServer.listen(3000);


// Database functions
function initDb() {
    const dbPath = path.join(__dirname, DATABASE_FILE);
    if (!fs.existsSync(dbPath)) {
        const initDbPath = path.join(__dirname, INIT_DATABASE_FILE);
        fs.copyFileSync(initDbPath, dbPath);
        console.log(`Database initialized from ${INIT_DATABASE_FILE}`);
    }
}

function readDb() {
    const dbPath = path.join(__dirname, DATABASE_FILE);
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    return db;
}

function writeDb(db: any) {
    const dbPath = path.join(__dirname, DATABASE_FILE);
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}
