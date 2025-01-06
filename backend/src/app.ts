// Backend: src/app.ts
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { KafkaConsumer } from './services/KafkaConsumer';
import { HashtagProcessor } from './services/HashtagProcessor';
import config from './config';
import { HashtagTrend } from './models/HashtagTrend';
import cors from 'cors';

const app = express();
app.use(cors({
    origin: "http://localhost:5173", // Vite's default port
    methods: ["GET", "POST"],
    credentials: true
}));

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
});

// Initialize services
const hashtagProcessor = new HashtagProcessor();
const kafkaConsumer = new KafkaConsumer();

// Track connected clients
let connectedClients = 0;

// Handle Kafka messages
kafkaConsumer.on('message', (message) => {
    try {
        const trends = hashtagProcessor.processMessage(message.value.toString());
        if (connectedClients > 0) {
            io.emit('trends', trends);
        }
    } catch (error) {
        console.error('Error processing Kafka message:', error);
    }
});

// REST endpoint for initial data
app.get('/api/trends', (req, res) => {
    try {
        const trends = hashtagProcessor.getTopTrends();
        res.json(trends);
    } catch (error) {
        console.error('Error fetching trends:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('Client connected, ID:', socket.id);
    connectedClients++;

    // Send initial trends
    try {
        const trends = hashtagProcessor.getTopTrends();
        console.log('Sending initial trends to new client:', trends);
        socket.emit('trends', trends);
    } catch (error) {
        console.error('Error sending initial trends:', error);
    }

    // Handle new Kafka messages
    kafkaConsumer.on('message', (message) => {
        try {
            console.log('Received message from Kafka:', message.value);
            const trends = hashtagProcessor.processMessage(message.value.toString());
            console.log('Processed trends:', trends);
            io.emit('trends', trends);
        } catch (error) {
            console.error('Error processing Kafka message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected, ID:', socket.id);
        connectedClients--;
    });
});

export { app, server };