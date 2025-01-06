import natural from 'natural';
import { SocialMediaPost } from './socialmedia/types';

export class HashtagAI {
    private tfidf: natural.TfIdf;
    
    constructor() {
        this.tfidf = new natural.TfIdf();
    }

    analyzeTrends(posts: SocialMediaPost[]): Map<string, number> {
        const hashtagScores = new Map<string, number>();
        
        // First pass: count raw occurrences
        posts.forEach(post => {
            const hashtags = new Set(post.hashtags || []);
            hashtags.forEach(tag => {
                const currentScore = hashtagScores.get(tag) || 0;
                hashtagScores.set(tag, currentScore + 1);
            });
        });

        // Second pass: apply time decay
        const now = Date.now();
        posts.forEach(post => {
            const hashtags = new Set(post.hashtags || []);
            hashtags.forEach(tag => {
                const baseScore = hashtagScores.get(tag) || 0;
                const hoursSincePost = (now - post.timestamp.getTime()) / (1000 * 60 * 60);
                const timeDecay = Math.exp(-hoursSincePost / 24); // 24-hour decay
                
                hashtagScores.set(tag, baseScore * timeDecay);
            });
        });

        return hashtagScores;
    }

    extractHashtags(text: string): string[] {
        // Use regex to extract hashtags instead of tokenizer
        const hashtagRegex = /#[\w\u0590-\u05ff]+/g;  // Matches #word pattern
        const matches = text.match(hashtagRegex) || [];
        
        // Clean and normalize hashtags
        return matches.map(tag => tag.toLowerCase().trim());
    }
}