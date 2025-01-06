import { app, server } from './app';
import { MockDataProducer } from './services/MockDataProducer';
import config from './config';

const startServer = async () => {
    try {
        server.listen(config.port, () => {
            console.log(`Server running on http://localhost:${config.port}`);
            
            if (process.env.NODE_ENV !== 'production') {
                console.log('Initializing mock data producer...');
                new MockDataProducer();
            }
        });

        const shutdown = () => {
            console.log('Shutting down server...');
            server.close(() => {
                console.log('Server shutdown complete');
                process.exit(0);
            });
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();