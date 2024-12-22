import { Octokit } from '@octokit/rest';

export class GitHubRepositoryService {
  private octokit: Octokit;

  constructor() {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error('GitHub token is not configured');
    }

    this.octokit = new Octokit({
      auth: token,
    });
  }

  /**
   * GitHub 저장소가 존재하는지 확인하고 접근 권한이 있는지 체크합니다.
   */
  async validateRepository(repoUrl: string): Promise<boolean> {
    try {
      // GitHub URL에서 owner와 repo 추출
      const [owner, repo] = this.parseRepositoryUrl(repoUrl);
      
      // 저장소 정보 조회 시도
      await this.octokit.repos.get({
        owner,
        repo,
      });

      return true;
    } catch (error) {
      console.error('Error validating repository:', error);
      return false;
    }
  }

  /**
   * GitHub 저장소에 브랜치를 생성합니다.
   */
  async createBranch(repoUrl: string, branchName: string, fromBranch: string = 'main'): Promise<boolean> {
    try {
      const [owner, repo] = this.parseRepositoryUrl(repoUrl);

      // 기준 브랜치의 최신 커밋 SHA 가져오기
      const { data: refData } = await this.octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${fromBranch}`,
      });

      // 새 브랜치 생성
      await this.octokit.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branchName}`,
        sha: refData.object.sha,
      });

      return true;
    } catch (error) {
      console.error('Error creating branch:', error);
      return false;
    }
  }

  /**
   * GitHub 저장소 URL에서 owner와 repo 이름을 추출합니다.
   */
  private parseRepositoryUrl(url: string): [string, string] {
    // GitHub URL 형식: https://github.com/owner/repo
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub repository URL');
    }

    return [match[1], match[2]];
  }
}
