import OpenAI from 'openai';

export class OpenAIService {
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  private truncateContent(content: string, maxLength: number = 4000): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }

  async generateSummary(prompt: string): Promise<string> {
    try {
      // 컨텐츠 길이 제한
      const truncatedPrompt = this.truncateContent(prompt);

      // TODO: content에 템플릿을 넣고, content에 진짜 blog content를 넣도록 변경
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '당신은 블로그 포스트를 명확하고 간결하게 요약하는 전문가입니다.',
          },
          {
            role: 'user',
            content: truncatedPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return response.choices[0]?.message?.content || '요약을 생성할 수 없습니다.';
    } catch (error) {
      console.error('OpenAI API 호출 중 오류:', error);
      throw new Error('블로그 포스트 요약 중 오류가 발생했습니다.');
    }
  }
}
