// src/services/MockDataProducer.ts
import { KafkaClient, Producer } from 'kafka-node';
import config from '../config';

export class MockDataProducer {
    private producer: Producer;
    private readonly sampleHashtags = [
        '#technology', '#coding', '#javascript', '#typescript',
        '#webdev', '#programming', '#react', '#nodejs',
        '#frontend', '#backend', '#fullstack', '#development'
    ];

    constructor() {
        const client = new KafkaClient({ kafkaHost: config.kafka.brokers });
        this.producer = new Producer(client);
        
        this.producer.on('ready', () => {
            console.log('Kafka Producer is ready');
            this.startProducing();
        });

        this.producer.on('error', (error: Error) => {
            console.error('Kafka Producer Error:', error);
        });
    }

    private generateMockPost(): string {
        const numHashtags = Math.floor(Math.random() * 3) + 1;
        const selectedHashtags = new Set<string>();
        
        while (selectedHashtags.size < numHashtags) {
            const randomIndex = Math.floor(Math.random() * this.sampleHashtags.length);
            selectedHashtags.add(this.sampleHashtags[randomIndex]);
        }

        const mockText = [
            "Just working on a new project",
            "Learning something new today",
            "Building amazing things",
            "Coding time!",
            "Making progress"
        ];

        const randomText = mockText[Math.floor(Math.random() * mockText.length)];
        return `${randomText} ${Array.from(selectedHashtags).join(' ')}`;
    }

    private startProducing(): void {
        // Generate a new post every 2 seconds
        setInterval(() => {
            const mockPost = this.generateMockPost();
            const payloads = [{
                topic: config.kafka.topic,
                messages: mockPost
            }];

            this.producer.send(payloads, (error: Error, data: any) => {
                if (error) {
                    console.error('Error sending message:', error);
                } else {
                    console.log('Mock post sent:', mockPost);
                }
            });
        }, 2000);
    }
}