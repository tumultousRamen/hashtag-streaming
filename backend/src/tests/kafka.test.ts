import { KafkaConsumer } from '../services/KafkaConsumer';
import { HashtagProcessor } from '../services/HashtagProcessor';

describe('Kafka Integration', () => {
    let consumer: KafkaConsumer;
    let processor: HashtagProcessor;

    beforeEach(() => {
        consumer = new KafkaConsumer();
        processor = new HashtagProcessor();
    });

    afterEach(() => {
        // Cleanup
    });

    it('should process messages from Kafka', (done) => {
        consumer.on('message', (message) => {
            const trends = processor.processMessage(message.value.toString());
            expect(trends).toBeDefined();
            done();
        });

        // Simulate Kafka message
        consumer.emit('message', { value: 'Test #kafka' });
    });

    it('should handle Kafka errors gracefully', (done) => {
        consumer.on('error', (error) => {
            expect(error).toBeDefined();
            done();
        });

        // Simulate error
        consumer.emit('error', new Error('Kafka connection lost'));
    });
});
