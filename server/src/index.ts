import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs = require('fs');
import path = require('path');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const dbPath = path.join(__dirname, 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

io.on("connection", (socket) => {
    socket.on('rfid-read', (uidHex: string) => {
        const audioFilePath = db[uidHex];

        if (audioFilePath) {
            console.log(`RFID ${uidHex} matched with audio file: ${audioFilePath}`);
            socket.broadcast.emit('play', audioFilePath);
        } else {
            console.log(`No audio file found for RFID ${uidHex}`);
            return;
        }

    });
});

console.log('--- Raspibox Server ---');
console.log(`Server listening on port 3000`);
httpServer.listen(3000);