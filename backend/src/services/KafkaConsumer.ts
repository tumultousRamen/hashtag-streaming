import { Consumer, KafkaClient, Message } from 'kafka-node';
import { EventEmitter } from 'events';
import config from '../config';

export class KafkaConsumer extends EventEmitter {
    private consumer: Consumer;

    constructor() {
        super();
        const client = new KafkaClient({ kafkaHost: config.kafka.brokers });
        this.consumer = new Consumer(
            client,
            [{ topic: config.kafka.topic }],
            { autoCommit: true }
        );

        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        this.consumer.on('message', (message: Message) => {
            this.emit('message', message);
        });

        this.consumer.on('error', (error: Error) => {
            console.error('Error in Kafka consumer:', error);
            this.emit('error', error);
        });
    }
}