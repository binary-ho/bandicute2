import { Octokit } from 'octokit';

const githubToken = process.env.GITHUB_ACCESS_TOKEN!;

export const octokit = new Octokit({
  auth: githubToken,
});

interface CreatePRParams {
  owner: string;
  repo: string;
  title: string;
  body: string;
  head: string;
  base?: string;
  reviewers?: string[];
}

export async function createPullRequest({
  owner,
  repo,
  title,
  body,
  head,
  base = 'main',
  reviewers,
}: CreatePRParams) {
  try {
    const { data: pr } = await octokit.rest.pulls.create({
      owner,
      repo,
      title,
      body,
      head,
      base,
    });

    // TODO: 리뷰어 추가 기능 임시 비활성화
    // if (reviewers?.length) {
    //   await octokit.rest.pulls.requestReviewers({
    //     owner,
    //     repo,
    //     pull_number: pr.number,
    //     reviewers,
    //   });
    // }

    return pr.html_url;
  } catch (error) {
    console.error('Failed to create pull request:', error);
    throw error;
  }
}

export async function forkRepository(owner: string, repo: string) {
  try {
    const { data: fork } = await octokit.rest.repos.createFork({
      owner,
      repo,
    });
    return fork;
  } catch (error) {
    console.error('Failed to fork repository:', error);
    throw error;
  }
}

export async function createOrUpdateFile({
  owner,
  repo,
  path,
  message,
  content,
  branch,
  sha,
}: {
  owner: string;
  repo: string;
  path: string;
  message: string;
  content: string;
  branch: string;
  sha?: string;
}) {
  try {
    const { data } = await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: Buffer.from(content).toString('base64'),
      branch,
      sha,
    });
    return data;
  } catch (error) {
    console.error('Failed to create or update file:', error);
    throw error;
  }
}

export async function getBranch(owner: string, repo: string, branch: string) {
  try {
    const { data } = await octokit.rest.repos.getBranch({
      owner,
      repo,
      branch,
    });
    return data;
  } catch (error) {
    if ((error as any).status === 404) {
      return null;
    }
    throw error;
  }
}

export async function createBranch(owner: string, repo: string, branch: string, sha: string) {
  try {
    const { data } = await octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branch}`,
      sha,
    });
    return data;
  } catch (error) {
    console.error('Failed to create branch:', error);
    throw error;
  }
}
