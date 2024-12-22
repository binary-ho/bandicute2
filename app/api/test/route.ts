import { NextResponse } from 'next/server';
import { BlogSummaryService } from '@/lib/blog-summary/service';
import { GitHubPRService } from '@/lib/github/pr-service';

// 테스트용 데이터
const testMember = {
  id: '123e4567-e89b-12d3-a456-426614174000', // UUID 형식
  name: 'binary-ho',
  email: 'dfghcvb11@naver.com',
  tistoryBlog: 'https://dwaejinho.tistory.com',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export async function GET() {
  try {
    const githubPRService = new GitHubPRService();
    const blogSummaryService = new BlogSummaryService(githubPRService);

    const result = await blogSummaryService.processNewBlogPost(
      testMember.tistoryBlog,  // RSS 피드에서 최신 글을 가져옵니다
      testMember
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
