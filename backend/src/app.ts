// src/app.ts
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { KafkaConsumer } from './services/KafkaConsumer';
import { HashtagProcessor } from './services/HashTagProcessor';
import config from './config';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const hashtagProcessor = new HashtagProcessor();
const kafkaConsumer = new KafkaConsumer();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/trends', (req, res) => {
    const trends = hashtagProcessor.getTopTrends();
    res.json(trends);
});

// WebSocket connection
io.on('connection', (socket) => {
    console.log('Client connected');
    
    // Send initial trends
    const trends = hashtagProcessor.getTopTrends();
    socket.emit('trends', trends);

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Process Kafka messages
kafkaConsumer.on('message', (message) => {
    try {
        const trends = hashtagProcessor.processMessage(message.value.toString());
        io.emit('trends', trends);
    } catch (error) {
        console.error('Error processing message:', error);
    }
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Server terminated');
    });
});

export default app;