import natural from 'natural';
import { SocialMediaPost } from './socialmedia/types';

export class HashtagAI {
    private tokenizer: natural.WordTokenizer;
    private tfidf: natural.TfIdf;
    
    constructor() {
        this.tokenizer = new natural.WordTokenizer();
        this.tfidf = new natural.TfIdf();
    }

    analyzeTrends(posts: SocialMediaPost[]): Map<string, number> {
        // Convert posts to documents for TF-IDF analysis
        posts.forEach(post => {
            this.tfidf.addDocument(post.text);
        });

        // Extract and analyze hashtags
        const hashtagScores = new Map<string, number>();
        
        posts.forEach(post => {
            const hashtags = new Set(post.hashtags || this.extractHashtags(post.text));
            hashtags.forEach(tag => {
                const currentScore = hashtagScores.get(tag) || 0;
                const termFrequency = this.tfidf.tfidf(tag, 0);
                const viralityScore = this.calculateViralityScore(tag, posts);
                
                hashtagScores.set(tag, currentScore + termFrequency * viralityScore);
            });
        });

        return hashtagScores;
    }

    private extractHashtags(text: string): string[] {
        const words = this.tokenizer.tokenize(text) || [];
        return words.filter(word => word.startsWith('#')).map(tag => tag.toLowerCase());
    }

    private calculateViralityScore(hashtag: string, posts: SocialMediaPost[]): number {
        const timeWindowHours = 24;
        const now = new Date();
        const recentPosts = posts.filter(post => {
            const hoursDiff = (now.getTime() - post.timestamp.getTime()) / (1000 * 60 * 60);
            return hoursDiff <= timeWindowHours;
        });

        const hashtagPosts = recentPosts.filter(post => 
            (post.hashtags || []).includes(hashtag)
        );

        // Consider time decay in virality score
        return hashtagPosts.reduce((score, post) => {
            const hoursSincePost = (now.getTime() - post.timestamp.getTime()) / (1000 * 60 * 60);
            const timeDecay = Math.exp(-hoursSincePost / timeWindowHours);
            return score + timeDecay;
        }, 0);
    }
}