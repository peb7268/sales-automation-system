const { createServer } = require('http');
const { Server } = require('socket.io');
const { Kafka } = require('kafkajs');

// Create HTTP server
const httpServer = createServer();

// Create Socket.IO server with CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST']
  }
});

// Kafka configuration (optional - only if Kafka is running)
let kafka = null;
let consumer = null;

const initKafka = async () => {
  try {
    kafka = new Kafka({
      clientId: 'dashboard-websocket',
      brokers: ['localhost:9092']
    });

    consumer = kafka.consumer({ groupId: 'dashboard-group' });
    await consumer.connect();
    
    // Subscribe to relevant topics
    await consumer.subscribe({ topics: [
      'pipeline.research.started',
      'pipeline.research.completed',
      'pipeline.prospect.qualified',
      'caller.call.initiated',
      'caller.call.completed'
    ], fromBeginning: false });

    // Forward Kafka messages to WebSocket clients
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const payload = JSON.parse(message.value.toString());
        
        // Map Kafka topics to WebSocket events
        const eventMap = {
          'pipeline.research.started': 'research:started',
          'pipeline.research.completed': 'research:completed',
          'pipeline.prospect.qualified': 'prospect:qualified',
          'caller.call.initiated': 'call:initiated',
          'caller.call.completed': 'call:ended'
        };

        const wsEvent = eventMap[topic];
        if (wsEvent) {
          io.emit(wsEvent, payload);
        }
      }
    });

    console.log('✅ Kafka consumer connected and listening');
  } catch (error) {
    console.log('⚠️  Kafka not available - running without event streaming');
  }
};

// Track connected clients
const clients = new Map();

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  clients.set(socket.id, {
    connectedAt: new Date(),
    lastActivity: new Date()
  });

  // Send welcome message
  socket.emit('system:alert', {
    level: 'info',
    message: 'Connected to Sales Dashboard WebSocket Server',
    timestamp: new Date().toISOString()
  });

  // Handle custom messages
  socket.on('message', (data) => {
    console.log('Received message:', data);
    clients.get(socket.id).lastActivity = new Date();
    
    // Broadcast to all clients except sender
    socket.broadcast.emit('message', data);
  });

  // Simulate research progress (for demo)
  socket.on('research:start', (data) => {
    console.log('Starting research simulation for:', data.prospectId);
    let progress = 0;
    
    const interval = setInterval(() => {
      progress += 10;
      socket.emit('research:progress', {
        prospectId: data.prospectId,
        stage: progress < 30 ? 'Gathering data' : progress < 60 ? 'Analyzing' : 'Finalizing',
        progress,
        timestamp: new Date().toISOString()
      });

      if (progress >= 100) {
        clearInterval(interval);
        socket.emit('research:completed', {
          prospectId: data.prospectId,
          success: true,
          timestamp: new Date().toISOString()
        });
      }
    }, 1000);
  });

  // Simulate call updates (for demo)
  socket.on('call:start', (data) => {
    console.log('Starting call simulation for:', data.prospectId);
    
    // Emit call initiated
    socket.emit('call:initiated', {
      callId: `call-${Date.now()}`,
      prospectId: data.prospectId,
      timestamp: new Date().toISOString()
    });

    // Simulate call connection after 3 seconds
    setTimeout(() => {
      socket.emit('call:connected', {
        callId: `call-${Date.now()}`,
        duration: 0,
        timestamp: new Date().toISOString()
      });
    }, 3000);

    // Simulate call end after 10 seconds
    setTimeout(() => {
      socket.emit('call:ended', {
        callId: `call-${Date.now()}`,
        outcome: Math.random() > 0.5 ? 'interested' : 'not_interested',
        duration: 7,
        timestamp: new Date().toISOString()
      });
    }, 10000);
  });

  // Send periodic metrics
  const metricsInterval = setInterval(() => {
    socket.emit('system:metric', {
      name: 'active_connections',
      value: clients.size,
      timestamp: new Date().toISOString()
    });
  }, 30000);

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    clients.delete(socket.id);
    clearInterval(metricsInterval);
  });
});

// Start the server
const PORT = process.env.WS_PORT || 3001;
httpServer.listen(PORT, async () => {
  console.log(`
╔═══════════════════════════════════════════╗
║   Sales Dashboard WebSocket Server        ║
║   Running on port ${PORT}                    ║
╠═══════════════════════════════════════════╣
║   Status: ✅ Active                       ║
║   Clients: ${clients.size} connected                   ║
║   Kafka: Attempting connection...         ║
╚═══════════════════════════════════════════╝
  `);
  
  // Try to connect to Kafka
  await initKafka();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down WebSocket server...');
  
  if (consumer) {
    await consumer.disconnect();
  }
  
  io.close(() => {
    console.log('WebSocket server closed');
    process.exit(0);
  });
});