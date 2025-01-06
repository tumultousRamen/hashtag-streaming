import { Consumer, KafkaClient, Message } from 'kafka-node';
import { EventEmitter } from 'events';
import config from '../config';

export class KafkaConsumer extends EventEmitter {
    private consumer: Consumer | undefined;

    constructor() {
        super();
        this.initializeConsumer();
    }

    private initializeConsumer(): void {
        try {
            const client = new KafkaClient({ kafkaHost: config.kafka.brokers });
            this.consumer = new Consumer(
                client,
                [{ topic: config.kafka.topic }],
                { 
                    autoCommit: true,
                    encoding: 'utf8'
                }
            );

            this.setupEventHandlers();
        } catch (error) {
            console.error('Failed to initialize KafkaConsumer:', error);
        }
    }

    private setupEventHandlers(): void {
        if (!this.consumer) {
            console.error('Cannot setup event handlers: consumer not initialized');
            return;
        }

        this.consumer.on('message', (message: Message) => {
            console.log('Received Kafka message:', message.value);
            this.emit('message', message);
        });

        this.consumer.on('error', (error: Error) => {
            console.error('Error in Kafka consumer:', error);
            this.emit('error', error);
        });

        this.consumer.on('offsetOutOfRange', (error: Error) => {
            console.error('Offset out of range:', error);
        });
    }
}