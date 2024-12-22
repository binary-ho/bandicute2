import { Octokit } from 'octokit';
import type { Member, Study } from '@/types';
import { RequestError } from '@octokit/request-error';

interface CreatePRParams {
  post: {
    title: string;
    url: string;
    content: string;
    published_at: string;
  };
  study: Study;
  member: Member;
  description: string;
}

export class GitHubPRService {
  private readonly octokit: Octokit;

  constructor() {
    const token = process.env.GITHUB_ACCESS_TOKEN;
    if (!token) {
      throw new Error('GitHub access token is not set. Please set GITHUB_ACCESS_TOKEN in your environment variables.');
    }
    this.octokit = new Octokit({
      auth: token,
    });
  }

  private parseGitHubRepo(repoUrl: string): { owner: string; repo: string } {
    // owner/repo 형식 처리
    const parts = repoUrl.split('/');
    if (parts.length === 2) {
      return { owner: parts[0], repo: parts[1] };
    }
    
    throw new Error(`Invalid GitHub repository format: ${repoUrl}`);
  }

  private isRequestError(error: unknown): error is RequestError {
    return error instanceof Error && 'status' in error;
  }

  async createPR({
    post,
    study,
    member,
    description,
  }: CreatePRParams): Promise<string> {
    try {
      const { owner, repo } = this.parseGitHubRepo(study.github_repo);
      const branchName = `blog-post/${member.name}/${Date.now()}`;
      const formattedDate = new Date(post.published_at).toISOString().split('T')[0];
      const fileName = `[요약] ${member.name} - ${post.title.replace(/[<>:"/\\|?*]/g, '')} (${formattedDate}).md`;
      const filePath = `${study.directory}/${fileName}`;

      // 1. Fork the repository
      const { data: fork } = await this.octokit.rest.repos.createFork({
        owner,
        repo,
      });

      // Wait for fork to be ready
      const maxAttempts = 10;
      let attempts = 0;
      while (attempts < maxAttempts) {
        try {
          await this.octokit.rest.repos.get({
            owner: fork.owner.login,
            repo: fork.name,
          });
          break;
        } catch {
          attempts++;
          if (attempts === maxAttempts) {
            throw new Error('Fork creation timeout');
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // 2. Get default branch of forked repo
      const { data: defaultBranch } = await this.octokit.rest.repos.get({
        owner: fork.owner.login,
        repo: fork.name,
      });

      const { data: ref } = await this.octokit.rest.git.getRef({
        owner: fork.owner.login,
        repo: fork.name,
        ref: `heads/${defaultBranch.default_branch}`,
      });

      // 3. Create new branch in forked repo
      await this.octokit.rest.git.createRef({
        owner: fork.owner.login,
        repo: fork.name,
        ref: `refs/heads/${branchName}`,
        sha: ref.object.sha,
      });

      // 4. Create file in forked repo
      await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: fork.owner.login,
        repo: fork.name,
        path: filePath,
        message: `Add blog post: ${post.title}`,
        content: Buffer.from(description).toString('base64'),
        branch: branchName,
      });

      // 5. Create PR from fork to original repository
      const { data: pr } = await this.octokit.rest.pulls.create({
        owner,
        repo,
        title: post.title,
        body: description,
        head: `${fork.owner.login}:${branchName}`,
        base: study.branch || defaultBranch.default_branch,
      });

      // Add reviewer
      try {
        await this.octokit.rest.pulls.requestReviewers({
          owner,
          repo,
          pull_number: pr.number,
          reviewers: [member.name],
        });
      } catch (error) {
        // 리뷰어 추가 실패는 치명적이지 않으므로 무시
        console.error('Failed to add reviewer:', error);
      }

      return pr.html_url;
    } catch (error) {
      console.error('Failed to create PR:', error);

      if (this.isRequestError(error)) {
        if (error.status === 401) {
          throw new Error('GitHub 인증에 실패했습니다. GITHUB_ACCESS_TOKEN이 올바르게 설정되어 있는지 확인해주세요.');
        }
        if (error.status === 404) {
          throw new Error(`GitHub 레포지토리를 찾을 수 없습니다: ${study.github_repo}\n레포지토리 URL을 확인해주세요.`);
        }
      }

      if (error instanceof Error && error.message === 'Fork creation timeout') {
        throw new Error('Fork 생성 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.');
      }

      throw new Error('PR 생성 중 오류가 발생했습니다.');
    }
  }
}
