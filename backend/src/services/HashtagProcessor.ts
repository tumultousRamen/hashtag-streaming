import natural from 'natural';
import { HashtagTrend } from '../models/HashtagTrend';

interface TagData {
    count: number;
    lastUpdated: number;
}

export class HashtagProcessor {
    private trendingTags: Map<string, number>;
    private tagData: Map<string, TagData>;
    private readonly windowSize: number = 3600000;
    private readonly updateInterval: number = 10000;

    constructor() {
        this.trendingTags = new Map();
        this.tagData = new Map();
        this.startCleanupInterval();
    }

    private startCleanupInterval(): void {
        setInterval(() => {
            this.cleanupOldTags();
        }, this.updateInterval);
    }

    public processMessage(message: string): HashtagTrend[] {
        const hashtags = this.extractHashtags(message);
        
        hashtags.forEach(tag => {
            const currentCount = this.trendingTags.get(tag) || 0;
            this.trendingTags.set(tag, currentCount + 1);
        });

        return this.getTopTrends();
    }

    private extractHashtags(text: string): string[] {
        const tokenizer = new natural.WordTokenizer();
        const words = tokenizer.tokenize(text) || [];
        
        return words
            .filter(word => word.startsWith('#'))
            .map(tag => tag.toLowerCase());
    }

    private cleanupOldTags(): void {
        const cutoffTime = Date.now() - this.windowSize;
        
        for (const [tag, data] of this.tagData.entries()) {
            if (data.lastUpdated < cutoffTime) {
                this.tagData.delete(tag);
                this.trendingTags.delete(tag);
            }
        }
    }

    public getTopTrends(limit: number = 10): HashtagTrend[] {
        const trends: HashtagTrend[] = Array.from(this.trendingTags.entries())
            .map(([tag, count]): HashtagTrend => ({
                tag: tag.toString(),
                count,
                timestamp: new Date()
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);

        return trends;
    }
}