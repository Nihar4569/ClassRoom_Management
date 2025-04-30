// File location: socket-server/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(cors({
  origin: process.env.CLIENT_URL || '*', // Allow requests from classroom app
  methods: ['GET', 'POST']
}));

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Room management
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join a room
  socket.on('join-room', (data) => {
    const { roomId, name, isTeacher, userId } = data;
    
    if (!roomId) {
      console.error('No room ID provided');
      return;
    }
    
    // Create room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        participants: new Map(),
        createdAt: new Date()
      });
    }
    
    // Add participant to room
    const room = rooms.get(roomId);
    room.participants.set(socket.id, {
      id: socket.id,
      name: name || 'Anonymous',
      isTeacher: isTeacher || false,
      userId: userId || null,
      joinedAt: new Date(),
      isScreenSharing: false
    });
    
    // Join socket.io room
    socket.join(roomId);
    socket.roomId = roomId;
    
    // Broadcast participant count update
    const participants = Array.from(room.participants.values());
    io.to(roomId).emit('participants', {
      count: participants.length,
      participants: participants
    });
    
    console.log(`User ${socket.id} joined room ${roomId}`);
  });
  
  // Signal relay for WebRTC
  socket.on('signal', (data) => {
    const { to, from, signal, metadata } = data;
    
    if (to && from && signal) {
      console.log(`Relaying signal from ${from} to ${to}`);
      io.to(to).emit('signal', { from, signal, metadata });
    }
  });
  
  // Update screen sharing status
  socket.on('screen-share-status', (data) => {
    const { roomId, isSharing } = data;
    
    if (!roomId || !rooms.has(roomId)) return;
    
    const room = rooms.get(roomId);
    const participant = room.participants.get(socket.id);
    
    if (participant) {
      participant.isScreenSharing = isSharing;
      
      // Broadcast updated participant list
      const participants = Array.from(room.participants.values());
      io.to(roomId).emit('participants', {
        count: participants.length,
        participants: participants
      });
    }
  });
  
  // Ready to receive screen share
  socket.on('ready-to-receive', (data) => {
    const { roomId } = data;
    
    if (!roomId || !rooms.has(roomId)) return;
    
    // Emit to all sharing participants that this client is ready
    const room = rooms.get(roomId);
    room.participants.forEach((participant, participantId) => {
      if (participant.isScreenSharing) {
        io.to(participantId).emit('viewer-ready', { viewerId: socket.id });
      }
    });
  });
  
  // Leave room
  socket.on('leave-room', (data) => {
    const { roomId } = data;
    leaveRoom(socket, roomId);
  });
  
  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.roomId) {
      leaveRoom(socket, socket.roomId);
    }
  });
  
  // Helper function to handle leaving a room
  function leaveRoom(socket, roomId) {
    if (!roomId || !rooms.has(roomId)) return;
    
    const room = rooms.get(roomId);
    
    // Remove from room participants
    room.participants.delete(socket.id);
    
    // Notify other participants
    socket.to(roomId).emit('peer-disconnected', socket.id);
    
    // Leave the socket.io room
    socket.leave(roomId);
    socket.roomId = null;
    
    // Broadcast updated participant count
    const participants = Array.from(room.participants.values());
    io.to(roomId).emit('participants', {
      count: participants.length,
      participants: participants
    });
    
    // Clean up empty rooms
    if (room.participants.size === 0) {
      rooms.delete(roomId);
      console.log(`Room ${roomId} deleted (empty)`);
    }
    
    console.log(`User ${socket.id} left room ${roomId}`);
  }
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});

// Basic health check endpoint
app.get('/', (req, res) => {
  res.send('Screen sharing signaling server is running');
});

// Show rooms status endpoint (only in development)
if (process.env.NODE_ENV === 'development') {
  app.get('/status', (req, res) => {
    const status = {
      rooms: [...rooms.entries()].map(([roomId, room]) => ({
        roomId,
        participants: [...room.participants.values()].map(p => ({
          id: p.id,
          name: p.name,
          isTeacher: p.isTeacher,
          isScreenSharing: p.isScreenSharing
        })),
        createdAt: room.createdAt
      }))
    };
    
    res.json(status);
  });
}