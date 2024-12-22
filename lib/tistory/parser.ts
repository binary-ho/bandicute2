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
      throw new Error('RSS 피드에서 포스트를 찾을 수 없습니다.');
    }

    return {
      title: latestPost.title || '',
      url: latestPost.link || '',
      content: latestPost.content || latestPost['content:encoded'] || '',
      publishedAt: latestPost.pubDate || new Date().toISOString(),
    };
  } catch (error) {
    console.error('블로그 포스트 파싱 실패:', error);
    
    if (error instanceof Error) {
      throw new Error(`블로그 포스트 파싱 실패: ${error.message}`);
    }
    throw new Error('블로그 포스트 파싱 중 알 수 없는 오류가 발생했습니다.');
  }
}
