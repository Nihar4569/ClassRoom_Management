const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('signal', (data) => {
    io.to(data.to).emit('signal', data);
  });

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(5000, () => console.log('Server listening on port 5000'));
