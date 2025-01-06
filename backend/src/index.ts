// src/index.ts
import app from './app';
import { MockDataProducer } from './services/MockDataProducer';
import config from './config';

const findAvailablePort = async (startPort: number): Promise<number> => {

    return new Promise((resolve) => {
        const server = app.listen(startPort)
            .on('listening', () => {
                const port = (server.address() as any).port;
                server.close(() => resolve(port));
            })
            .on('error', () => {

                resolve(findAvailablePort(startPort + 1));
            });
    });
};

const startServer = async () => {
    try {

        const port = await findAvailablePort(config.port);
        if (port !== config.port) {
            console.log(`Port ${config.port} was in use, using port ${port} instead`);
        }


        const server = app.listen(port, () => {
            console.log(`Server running on port ${port}`);
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


        if (process.env.NODE_ENV !== 'production') {
            console.log('Initializing mock data producer...');
            new MockDataProducer();
        }
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer().catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
});