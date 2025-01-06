import { SocialMediaAdapter, SocialMediaPost } from './types';
import { TwitterApi, TweetV2SearchResult } from 'twitter-api-v2';

export class TwitterAdapter implements SocialMediaAdapter {
    private client: TwitterApi;
    
    constructor(bearerToken: string) {
        this.client = new TwitterApi(bearerToken);
    }

    async fetchPosts(): Promise<SocialMediaPost[]> {
        try {
            const tweets: TweetV2SearchResult = await this.client.v2.search(
                'has:hashtags lang:en -is:retweet', 
                {
                    max_results: 100,
                    'tweet.fields': ['created_at', 'entities']
                }
            );

            if (!tweets.data) {
                return [];
            }

            return tweets.data.map(tweet => ({
                id: tweet.id,
                text: tweet.text,
                source: 'twitter' as const,
                timestamp: tweet.created_at ? new Date(tweet.created_at) : new Date(),
                hashtags: tweet.entities?.hashtags?.map(tag => tag.tag) || []
            }));
        } catch (error) {
            console.error('Error fetching Twitter data:', error);
            return [];
        }
    }

    validatePost(post: SocialMediaPost): boolean {
        return (
            typeof post.id === 'string' &&
            typeof post.text === 'string' &&
            post.text.length <= 280 && 
            Array.isArray(post.hashtags)
        );
    }
}