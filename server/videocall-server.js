// File location: server/videocall-server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
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

// Function to get room participants
const getRoomParticipants = (roomId) => {
  if (!rooms.has(roomId)) {
    return [];
  }
  
  return Array.from(rooms.get(roomId).participants.values());
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join a room
  socket.on('join-room', (data) => {
    const { roomId, name, userId, isTeacher } = data;
    
    if (!roomId) {
      return socket.emit('error', { message: 'Room ID is required' });
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
      userId: userId || socket.id,
      isTeacher: isTeacher || false,
      joinedAt: new Date(),
      isScreenSharing: false
    });
    
    // Join socket.io room
    socket.join(roomId);
    socket.roomId = roomId;
    
    // Broadcast to all participants in room that a new user joined
    io.to(roomId).emit('participant-joined', {
      participant: room.participants.get(socket.id),
      participants: getRoomParticipants(roomId)
    });
    
    // Send existing participants to the new user
    socket.emit('existing-participants', {
      participants: getRoomParticipants(roomId).filter(p => p.id !== socket.id)
    });
    
    console.log(`User ${socket.id} joined room ${roomId}`);
  });
  
  // Handle WebRTC signaling
  socket.on('signal', (data) => {
    const { to, signal } = data;
    
    if (!to || !signal) {
      return socket.emit('error', { message: 'Invalid signaling data' });
    }
    
    // Include information about who sent the signal
    const fromData = socket.roomId ? 
      rooms.get(socket.roomId)?.participants.get(socket.id) : 
      { id: socket.id };
    
    // Forward the signal to the recipient
    io.to(to).emit('signal', {
      from: socket.id,
      signal,
      fromData
    });
  });
  
  // Handle screen sharing status updates
  socket.on('screen-sharing-status', (data) => {
    const { isSharing } = data;
    
    if (!socket.roomId || !rooms.has(socket.roomId)) {
      return;
    }
    
    const room = rooms.get(socket.roomId);
    const participant = room.participants.get(socket.id);
    
    if (participant) {
      participant.isScreenSharing = isSharing;
      
      // Broadcast updated participant status to all in room
      io.to(socket.roomId).emit('participant-updated', {
        participant,
        participants: getRoomParticipants(socket.roomId)
      });
    }
  });
  
  // Handle ICE candidates
  socket.on('ice-candidate', (data) => {
    const { to, candidate } = data;
    
    if (!to || !candidate) {
      return;
    }
    
    io.to(to).emit('ice-candidate', {
      from: socket.id,
      candidate
    });
  });
  
  // Handle leave room
  socket.on('leave-room', () => {
    handleDisconnect();
  });
  
  // Handle disconnections
  const handleDisconnect = () => {
    if (socket.roomId && rooms.has(socket.roomId)) {
      const room = rooms.get(socket.roomId);
      
      // Remove participant from room
      room.participants.delete(socket.id);
      
      // Notify other participants
      io.to(socket.roomId).emit('participant-left', {
        participantId: socket.id,
        participants: getRoomParticipants(socket.roomId)
      });
      
      // Clean up empty rooms
      if (room.participants.size === 0) {
        rooms.delete(socket.roomId);
        console.log(`Room ${socket.roomId} deleted (empty)`);
      }
      
      // Leave socket.io room
      socket.leave(socket.roomId);
      socket.roomId = null;
    }
  };
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    handleDisconnect();
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Video call signaling server running on port ${PORT}`);
});

// Basic health check endpoint
app.get('/', (req, res) => {
  res.send('Video call signaling server is running');
});

// Status endpoint for development
if (process.env.NODE_ENV === 'development') {
  app.get('/status', (req, res) => {
    const status = {
      rooms: [...rooms.entries()].map(([roomId, room]) => ({
        roomId,
        participants: [...room.participants.values()],
        createdAt: room.createdAt
      }))
    };
    
    res.json(status);
  });
}