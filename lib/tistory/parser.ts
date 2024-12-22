import Parser from 'rss-parser';

export interface BlogPost {
  title: string;
  url: string;
  content: string;
  publishedAt: string;
}

export async function parseBlogPost(blogUrl: string): Promise<BlogPost> {
  try {
    const parser = new Parser({
      headers: {
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
    });
    
    const feed = await parser.parseURL(`${blogUrl}/rss`);
    
    // 최신 글 가져오기
    const latestPost = feed.items[0];
    if (!latestPost) {
      throw new Error('No posts found in RSS feed');
    }

    return {
      title: latestPost.title || '',
      url: latestPost.link || '',
      content: latestPost.content || latestPost['content:encoded'] || '',
      publishedAt: latestPost.pubDate || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to parse blog post:', error);
    throw new Error(`Failed to parse blog post: ${error.message}`);
  }
}
