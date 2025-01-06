import { HashtagAI } from '../services/HashtagAI';
import { SocialMediaPost } from '../services/socialmedia/types';

describe('HashtagAI', () => {
    let hashtagAI: HashtagAI;

    beforeEach(() => {
        hashtagAI = new HashtagAI();
    });

    describe('extractHashtags', () => {
        it('should extract basic hashtags', () => {
            const text = 'Hello #world #test123';
            const hashtags = hashtagAI.extractHashtags(text);
            expect(hashtags).toEqual(['#world', '#test123']);
        });

        it('should handle empty input', () => {
            const hashtags = hashtagAI.extractHashtags('');
            expect(hashtags).toEqual([]);
        });

        it('should handle input with no hashtags', () => {
            const hashtags = hashtagAI.extractHashtags('Hello world');
            expect(hashtags).toEqual([]);
        });

        it('should handle multiple hashtags with spaces', () => {
            const hashtags = hashtagAI.extractHashtags('#one #two   #three');
            expect(hashtags).toEqual(['#one', '#two', '#three']);
        });

        it('should normalize hashtag case', () => {
            const hashtags = hashtagAI.extractHashtags('#Test #TEST #test');
            expect(hashtags).toEqual(['#test', '#test', '#test']);
        });

        it('should handle special characters correctly', () => {
            const hashtags = hashtagAI.extractHashtags('#hello! #world@ #test$');
            expect(hashtags).toEqual(['#hello', '#world', '#test']);
        });
    });

    describe('analyzeTrends', () => {
        it('should calculate basic trend scores', () => {
            const posts: SocialMediaPost[] = [
                {
                    id: '1',
                    text: '#test',
                    hashtags: ['#test'],
                    timestamp: new Date(),
                    source: 'test'
                },
                {
                    id: '2',
                    text: '#test #another',
                    hashtags: ['#test', '#another'],
                    timestamp: new Date(),
                    source: 'test'
                }
            ];

            const trends = hashtagAI.analyzeTrends(posts);
            expect(trends.get('#test')).toBeGreaterThan(trends.get('#another') || 0);
        });

        it('should handle empty post list', () => {
            const trends = hashtagAI.analyzeTrends([]);
            expect(trends.size).toBe(0);
        });

        it('should apply time decay correctly', () => {
            const now = new Date();
            const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            
            const posts: SocialMediaPost[] = [
                {
                    id: '1',
                    text: '#test',
                    hashtags: ['#test'],
                    timestamp: now,
                    source: 'test'
                },
                {
                    id: '2',
                    text: '#old',
                    hashtags: ['#old'],
                    timestamp: hourAgo,
                    source: 'test'
                }
            ];

            const trends = hashtagAI.analyzeTrends(posts);
            expect(trends.get('#test')).toBeGreaterThan(trends.get('#old') || 0);
        });
    });
});