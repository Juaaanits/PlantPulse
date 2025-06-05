// server.ts - Main Express Server
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { sensorRoutes } from './routes/sensorRoute';
import { plantRoutes } from './routes/plantRoute';
import { alertRoutes } from './routes/alertRoute';
import { SensorService } from './services/SensorService';
import { AlertService } from './services/AlertService';

const app = express();
const server = createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/sensors', sensorRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/alerts', alertRoutes);

// Services
const sensorService = new SensorService();
const alertService = new AlertService();

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('subscribe-plant', (plantId: string) => {
    socket.join(`plant-${plantId}`);
    console.log(`Client subscribed to plant: ${plantId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Real-time data simulation
setInterval(() => {
  const sensorData = sensorService.generateRealtimeData();
  const alerts = alertService.checkAlerts(sensorData);
  
  // Emit to all connected clients
  io.emit('sensor-data', sensorData);
  
  if (alerts.length > 0) {
    io.emit('alerts', alerts);
  }
}, 3000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});