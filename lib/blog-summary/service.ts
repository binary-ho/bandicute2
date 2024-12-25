import { supabase } from '../supabase/client';
import { OpenAIService } from '../openai/service';
import { GitHubPRService } from '../github/pr-service';
import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';
import type { BlogPost, Member, Study } from '@/types';
import { parseBlogPost } from '../tistory/parser';

interface ParsedBlogPost {
  title: string;
  url: string;
  content: string;
  publishedAt: Date;
  guid: string;
}

interface TemplateSection {
  type: string;
  title?: string;
  content?: string;
  items?: string[];
}

interface PRTemplate {
  title: string;
  body: TemplateSection[];
}

interface SummaryPromptTemplate {
  template: string;
  variables: string[];
}

export class BlogSummaryService {
  private readonly templatesDir = path.join(process.cwd(), 'templates');
  private readonly xmlParser = new XMLParser();

  constructor(
    private readonly githubPRService: GitHubPRService,
    private readonly openAIService: OpenAIService,
  ) {}

  private async loadTemplate<T>(templateName: string): Promise<T> {
    const templatePath = path.join(this.templatesDir, `${templateName}.json`);
    const content = await fs.promises.readFile(templatePath, 'utf-8');
    return JSON.parse(content) as T;
  }

  private replaceTemplateVars(template: string, vars: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || '');
  }

  private async generateSummaryPrompt(blogPost: ParsedBlogPost): Promise<string> {
    const template = await this.loadTemplate<SummaryPromptTemplate>('summary-prompt');
    return this.replaceTemplateVars(template.template, {
      title: blogPost.title,
      content: blogPost.content,
    });
  }

  private async generatePRDescription(
    blogPost: ParsedBlogPost,
    member: Member,
    summary: string,
  ): Promise<{ title: string; body: string }> {
    const template = await this.loadTemplate<PRTemplate>('pr-template');
    const vars = {
      member_name: member.name,
      post_title: blogPost.title,
      published_at: blogPost.publishedAt.toLocaleString('ko-KR'),
      post_url: blogPost.url,
      summary,
    };

    const title = this.replaceTemplateVars(template.title, vars);
    const sections = template.body.map(section => {
      if (section.content) {
        section.content = this.replaceTemplateVars(section.content, vars);
      }
      if (section.items) {
        section.items = section.items.map(item => this.replaceTemplateVars(item, vars));
      }
      
      let sectionText = '';
      if (section.title) {
        sectionText += `## ${section.title}\n\n`;
      }
      if (section.content) {
        sectionText += `${section.content}\n\n`;
      }
      if (section.items) {
        sectionText += section.items.map(item => `- ${item}`).join('\n') + '\n\n';
      }
      return sectionText;
    });

    return {
      title,
      body: sections.join(''),
    };
  }

  private async parseBlogPost(url: string): Promise<ParsedBlogPost> {
    const blogPost = await parseBlogPost(url);
    return {
      title: blogPost.title,
      url: blogPost.url,
      content: blogPost.content,
      publishedAt: new Date(blogPost.publishedAt),
      guid: blogPost.url,
    };
  }

  async processNewBlogPost(url: string, member: Member, study: Study): Promise<BlogPost> {
    try {
      // 1. Parse blog post
      const parsedPost = await this.parseBlogPost(url);

      // 2. Check if post already exists
      const { data: existingPost } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('guid', parsedPost.guid)
        .single();

      if (existingPost) {
        throw new Error('이미 파싱된 블로그 포스트입니다.');
      }

      // 3. Generate summary
      const prompt = await this.generateSummaryPrompt(parsedPost);
      const summary = await this.openAIService.generateSummary(prompt);

      // 4. Save to database
      const { data: savedPost, error } = await supabase
        .from('blog_posts')
        .insert({
          member_id: member.id,
          title: parsedPost.title,
          url: parsedPost.url,
          content: parsedPost.content,
          summary,
          is_pull_requested: false,
          published_at: parsedPost.publishedAt.toISOString(),
          guid: parsedPost.guid,
        })
        .select()
        .single();

      // 5. Create PR
      const { body: prBody } = await this.generatePRDescription(parsedPost, member, summary);
      const prUrl = await this.githubPRService.createPR({
        post: {
          ...parsedPost,
          published_at: parsedPost.publishedAt.toISOString(),
        },
        study,
        member,
        description: prBody,
      });

      if (error || !prUrl) {
        throw error;
      }

      // 6. Insert pull_requstes
      const { error: insertError } = await supabase
        .from('pull_requests')
        .insert({
          blog_post_id: savedPost.id,
          study_id: study.id,
          pr_url: prUrl,
        });

      if (insertError) {
        throw insertError;
      }

      // 7. Update is_pull_requsted
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({ is_pull_requested: true })
        .eq('id', savedPost.id);
      
      if (updateError) {
        throw updateError;
      }
      
      return savedPost;
    } catch (error) {
      console.error('Failed to process blog post:', error);
      throw error;
    }
  }
}
