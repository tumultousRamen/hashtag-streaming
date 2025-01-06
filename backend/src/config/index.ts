import dotenv from 'dotenv';

dotenv.config();

export default {
    kafka: {
        brokers: process.env.KAFKA_BROKERS || 'localhost:9092',
        topic: process.env.KAFKA_TOPIC || 'social-media-feed'
    },
    port: parseInt(process.env.PORT || '3000', 10)
};