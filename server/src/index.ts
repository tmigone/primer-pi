import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs = require('fs');
import path = require('path');
import multer from 'multer';

const AUDIO_CONTENT_DIR = '/audio';
const DATABASE_FILE = 'db.json';
const INIT_DATABASE_FILE = 'db.init.json';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const upload = multer({ dest: AUDIO_CONTENT_DIR });

initDb();
let db = readDb();

app.use(express.static(path.join(__dirname, '..', 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});
// @ts-ignore
app.post('/upload', upload.single('filename'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const oldPath = req.file.path;
    const newPath = path.join(AUDIO_CONTENT_DIR, req.file.originalname);

    fs.rename(oldPath, newPath, (err) => {
        if (err) {
            console.error('Error moving uploaded file:', err);
            return res.status(500).send('Error saving file.');
        }
        res.status(200).json({ filename: req.file?.originalname, success: true });
    });
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

    socket.on('button-pressed', () => {
        socket.broadcast.emit('stop');
    });

    socket.on('encoder-rotated', (direction) => {
        socket.broadcast.emit('volume', direction);
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

    socket.on('get-audio-files', () => {
        fs.readdir(AUDIO_CONTENT_DIR, (err, files) => {
            if (err) {
                console.error('Error reading audio directory:', err);
            } else {
                const audioFiles = files.filter(file => {
                    const ext = path.extname(file).toLowerCase();
                    return ['.wav'].includes(ext);
                });
                socket.emit('audio-files', { files: audioFiles });
            }
        });
    })
});

console.log('--- Raspibox Server ---');
console.log(`Server listening on port 3000`);
httpServer.listen(3000);


// Database functions
function initDb() {
    const dbPath = path.join(AUDIO_CONTENT_DIR, DATABASE_FILE);
    if (!fs.existsSync(dbPath)) {
        const initDbPath = path.join(__dirname, INIT_DATABASE_FILE);
        fs.copyFileSync(initDbPath, dbPath);
        console.log(`Database initialized from ${initDbPath}`);
    }
}

function readDb() {
    const dbPath = path.join(AUDIO_CONTENT_DIR, DATABASE_FILE);
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    return db;
}

function writeDb(db: any) {
    const dbPath = path.join(AUDIO_CONTENT_DIR, DATABASE_FILE);
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}
