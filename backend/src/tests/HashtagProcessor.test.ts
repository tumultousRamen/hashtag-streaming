import { HashtagProcessor } from '../services/HashtagProcessor';

describe('HashtagProcessor', () => {
    let processor: HashtagProcessor;

    beforeEach(() => {
        jest.useFakeTimers();
        processor = new HashtagProcessor();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('processMessage', () => {
        it('should process valid messages', () => {
            const trends = processor.processMessage('Hello #world #test');
            expect(trends).toBeDefined();
            expect(trends.length).toBeGreaterThan(0);
        });

        it('should handle empty messages', () => {
            const trends = processor.processMessage('');
            expect(trends).toEqual([]);
        });

        it('should handle invalid input', () => {
            const trends = processor.processMessage(null as any);
            expect(trends).toEqual([]);
        });

        it('should handle maximum message size', () => {
            const longMessage = 'a'.repeat(281) + ' #test';
            const trends = processor.processMessage(longMessage);
            expect(trends).toEqual([]);
        });

        it('should handle maximum hashtags per message', () => {
            const manyHashtags = Array(31).fill('#test').join(' ');
            const trends = processor.processMessage(manyHashtags);
            expect(trends.length).toBeLessThanOrEqual(30);
        });
    });

    describe('cleanup', () => {
        it('should clean up old posts', () => {

            processor.processMessage('#test');
        
            jest.advanceTimersByTime(3600001); 
            
            processor['cleanupOldPosts'](); 
            
            const trends = processor.getTopTrends();
            expect(trends).toEqual([]);
        });
    });
});