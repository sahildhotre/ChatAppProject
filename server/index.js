const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // Be more restrictive in production!
    methods: ['GET', 'POST'],
  },
});

// In-memory storage for message history and typing users
const messageHistory = [];
const typingUsers = new Set();

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // When a user logs in on the client, they emit this event
  socket.on('user joined', (username) => {
    socket.username = username; // Attach username to the socket instance for later use
    
    // Send existing message history to the newly connected user
    socket.emit('message history', messageHistory);

    // Announce to all other clients that a new user has joined
    const systemMessage = {
      id: uuidv4(),
      text: `${username} has joined the chat.`,
      isSystem: true,
    };
    socket.broadcast.emit('system message', systemMessage);
    messageHistory.push(systemMessage);
  });

  // Listen for a new chat message
  socket.on('chat message', (data) => {
    const fullMessage = {
      id: uuidv4(),
      text: data.text, // Basic sanitization can be done here
      sender: data.sender,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    console.log('📩 Message received:', fullMessage);
    messageHistory.push(fullMessage); // Add to history
    io.emit('chat message', fullMessage); // Broadcast to all clients
  });
  
  // Listen for typing events
  socket.on('typing', (username) => {
    typingUsers.add(username);
    socket.broadcast.emit('typing users', Array.from(typingUsers));
  });

  socket.on('stop typing', (username) => {
    typingUsers.delete(username);
    socket.broadcast.emit('typing users', Array.from(typingUsers));
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    if (socket.username) {
      typingUsers.delete(socket.username); // Clean up typing status
      const systemMessage = {
        id: uuidv4(),
        text: `${socket.username} has left the chat.`,
        isSystem: true,
      };
      io.emit('system message', systemMessage); // Announce departure
      messageHistory.push(systemMessage);
      io.emit('typing users', Array.from(typingUsers)); // Update typing list
    }
  });
});

const PORT = 3000;
const HOST = '192.168.0.102'; // Or '0.0.0.0'
server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
});