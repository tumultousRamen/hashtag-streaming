import { HashtagAI } from './HashtagAI';
import { HashtagTrend } from '../models/HashtagTrend';
import { SocialMediaPost } from './socialmedia/types';

export class HashtagProcessor {
    private hashtagAI: HashtagAI;
    private recentPosts: SocialMediaPost[];
    private readonly windowSize: number = 3600000; // 1 hour
    private readonly updateInterval: number = 10000; // 10 seconds
    private readonly MAX_MESSAGE_LENGTH = 280;
    private readonly MAX_HASHTAGS_PER_MESSAGE = 30;

    constructor() {
        this.hashtagAI = new HashtagAI();
        this.recentPosts = [];
        this.startCleanupInterval();
        console.log('HashtagProcessor initialized');
    }

    private startCleanupInterval(): void {
        setInterval(() => {
            const oldCount = this.recentPosts.length;
            this.cleanupOldPosts();
            const newCount = this.recentPosts.length;
            if (oldCount !== newCount) {
                console.log(`Cleaned up posts: ${oldCount} -> ${newCount}`);
            }
        }, this.updateInterval);
    }

    private cleanupOldPosts(): void {
        const cutoffTime = Date.now() - this.windowSize;
        this.recentPosts = this.recentPosts.filter(post => 
            post.timestamp.getTime() > cutoffTime
        );
    }

    private isValidMessage(message: string): boolean {
        if (!message || typeof message !== 'string') return false;
        if (message.length > this.MAX_MESSAGE_LENGTH) return false;
        
        const hashtags = this.hashtagAI.extractHashtags(message);
        if (hashtags.length > this.MAX_HASHTAGS_PER_MESSAGE) return false;
        
        return true;
    }

    public processMessage(message: string): HashtagTrend[] {
        console.log('Processing new message:', message);

        try {
            if (!this.isValidMessage(message)) {
                console.log('Invalid message:', message);
                return [];
            }

            const newPost: SocialMediaPost = {
                id: Date.now().toString(),
                text: message,
                source: 'mock',
                timestamp: new Date(),
                hashtags: this.extractHashtags(message)
            };

            console.log('Extracted hashtags:', newPost.hashtags);

            this.recentPosts.push(newPost);
            this.cleanupOldPosts(); // Ensure we clean up before processing
            
            console.log('Total posts in memory:', this.recentPosts.length);

            return this.getTopTrends();
        } catch (error) {
            console.error('Error processing message:', error);
            return [];
        }
    }

    private extractHashtags(text: string): string[] {
        const hashtags = this.hashtagAI.extractHashtags(text);
        console.log(`Extracted ${hashtags.length} hashtags from text:`, hashtags);
        return hashtags;
    }

    public getTopTrends(limit: number = 10): HashtagTrend[] {
        this.cleanupOldPosts(); // Ensure we clean up before getting trends

        if (this.recentPosts.length === 0) {
            console.log('No posts to analyze');
            return [];
        }

        const trendScores = this.hashtagAI.analyzeTrends(this.recentPosts);
        
        const trends = Array.from(trendScores.entries())
            .map(([tag, score]) => ({
                tag,
                count: Math.round(score * 100),
                timestamp: new Date()
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);

        console.log('Current trends:', trends);
        return trends;
    }
}