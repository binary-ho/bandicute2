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

  async processNewBlogPost(
    parsedPost: ParsedBlogPost,
    study: Study,
    member: Member,
  ): Promise<BlogPost> {
    try {
      // 1. Save blog post
      const { data: savedPost, error } = await supabase
        .from('blog_posts')
        .insert({
          member_id: member.id,
          title: parsedPost.title,
          url: parsedPost.url,
          content: parsedPost.content,
          published_at: parsedPost.publishedAt.toISOString(),
          guid: parsedPost.guid,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // 2. Create empty post summary
      const { error: summaryError } = await supabase
        .from('post_summaries')
        .insert([{
          blog_post_id: savedPost.id,
          summary: '',
          is_summarized: false,
        }, { ignoreDuplicates: true }]);

      if (summaryError) {
        throw summaryError;
      }

      // 3. Create empty pull request
      const { error: prError } = await supabase
        .from('pull_requests')
        .insert([{
          blog_post_id: savedPost.id,
          study_id: study.id,
          is_opened: false,
          pr_url: null,
        }, { ignoreDuplicates: true }]);

      if (prError) {
        throw prError;
      }

      // 4. Generate summary with GPT
      const summaryPrompt = await this.loadTemplate<SummaryPromptTemplate>('summary-prompt');
      const prompt = this.replaceTemplateVars(summaryPrompt.template, {
        title: parsedPost.title,
        content: parsedPost.content,
      });

      const summary = await this.openAIService.generateSummary(prompt);

      // 5. Update summary
      const { error: updateSummaryError } = await supabase
        .from('post_summaries')
        .update({ 
          summary,
          is_summarized: true,
        })
        .eq('blog_post_id', savedPost.id);

      if (updateSummaryError) {
        throw updateSummaryError;
      }

      // 6. Generate PR content
      const prTemplate = await this.loadTemplate<PRTemplate>('pr-template');
      const prBody = this.generatePRBody(prTemplate, {
        title: parsedPost.title,
        url: parsedPost.url,
        summary,
        publishedAt: parsedPost.publishedAt.toISOString(),
      });

      // 7. Create PR
      const prUrl = await this.githubPRService.createPR({
        post: savedPost,
        study,
        member,
        description: prBody,
      });

      // 8. Update pull request
      const { error: updatePRError } = await supabase
        .from('pull_requests')
        .update({ 
          pr_url: prUrl,
          is_opened: true,
        })
        .eq('blog_post_id', savedPost.id)
        .eq('study_id', study.id);

      if (updatePRError) {
        throw updatePRError;
      }

      return savedPost;
    } catch (error) {
      console.error('Failed to process blog post:', error);
      throw error;
    }
  }

  private generatePRBody(template: PRTemplate, vars: Record<string, string>): string {
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

    return sections.join('');
  }
}
