require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const socketio = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection Configuration
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      ssl: true,
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit process with failure
  }
};

// Call the connect function
connectDB();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: 'Internal Server Error', error: err.message });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/loads', require('./routes/loads'));
app.use('/api/bids', require('./routes/bids'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/benefits', require('./routes/benefits'));
app.use('/api/transactions', require('./routes/transactions'));

const PORT = process.env.PORT || 5000;

const startServer = async (port) => {
  try {
    const server = await new Promise((resolve, reject) => {
      const server = app.listen(port)
        .once('listening', () => resolve(server))
        .once('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is busy, trying ${port + 1}...`);
            server.close();
            resolve(startServer(port + 1));
          } else {
            reject(err);
          }
        });
    });

    console.log(`Server running on port ${server.address().port}`);

    // Socket.io Setup for real-time load tracking
    const io = socketio(server, {
      cors: { origin: process.env.CLIENT_URL }
    });

    io.on('connection', (socket) => {
      console.log('New WebSocket connection');
      socket.on('updateLocation', (data) => {
        io.emit('locationUpdate', data);
      });
    });

    return server;
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer(PORT);
