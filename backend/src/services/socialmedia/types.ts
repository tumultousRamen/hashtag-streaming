export interface SocialMediaPost {
    id: string;
    text: string;
    source: 'twitter' | 'mock' | 'instagram';
    timestamp: Date;
    hashtags: string[];
}

export interface SocialMediaAdapter {
    fetchPosts(): Promise<SocialMediaPost[]>;
    validatePost(post: any): boolean;
}