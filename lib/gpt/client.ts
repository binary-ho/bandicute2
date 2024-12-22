import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function truncateContent(content: string, maxLength: number = 4000): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
}

export async function generateSummary(content: string): Promise<string> {
  try {
    // 컨텐츠 길이 제한
    const truncatedContent = truncateContent(content);

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '당신은 블로그 포스트를 명확하고 간결하게 요약하는 전문가입니다.',
        },
        {
          role: 'user',
          content: `다음 블로그 포스트를 요약해주세요:\n\n${truncatedContent}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content || '요약을 생성할 수 없습니다.';
  } catch (error) {
    console.error('Failed to generate summary:', error);
    throw error;
  }
}
