const path = require('path');
const express = require('express');
const socket = require('socket.io');
const http = require('http');

const users = require('./data/user');

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

  io.emit('res-users', users);

  socket.on('add-user', (username, room) => {
    if (users.find((user) => user.name === username)) {
      socket.emit('user-found', username);
    } else {
      users.push({
        id: socket.id,
        name: username,
        room,
      });

      console.log(users);

      io.emit('res-users', users);
    }
  });

  socket.on('create-room', (room) => {
    socket.join(room);
  });

  socket.on('new-room', (username, oldRoom, newRoom) => {
    socket.to(oldRoom).emit('leave-room-notif', username);
    socket.leave(oldRoom);
    socket.join(newRoom);
  });

  socket.on('send-join-notif', (username, room) => {
    socket.to(room).emit('join-room-notif', username, room);
  });

  socket.on('send-message', (username, message, room) => {
    socket.to(room).emit('receive-message', username, message);
  });

  socket.on('disconnect', () => {
    const userIndex = users.map((user) => user.id).indexOf(socket.id);
    if (userIndex > -1) {
      const user = users.splice(userIndex, 1)[0];

      io.emit('res-users', users);
      io.emit('res-disc-username', user.name);
    }
  });

  socket.on('send-broadcast', (id) => {
    socket.emit('receive-broadcast', id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
