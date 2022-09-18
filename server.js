const path = require('path');
const express = require('express');
const socket = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socket(server, {
  cors: {
    origin: '*',
  },
});

// static file
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('New Ws Connection... | ' + socket.id);

  socket.on('create-room', (room) => {
    socket.join(room);
  });

  socket.on('new-room', (oldRoom, newRoom) => {
    socket.leave(oldRoom);
    socket.join(newRoom);
  });

  socket.on('send-join-notif', (username, room) => {
    socket.to(room).emit('join-room-notif', username, room);
  });

  socket.on('send-message', (username, message, room) => {
    socket.to(room).emit('receive-message', username, message);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
