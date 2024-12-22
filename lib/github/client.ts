import { Octokit } from 'octokit';
import { RequestError } from '@octokit/request-error';

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
}

function isRequestError(error: unknown): error is RequestError {
  return error instanceof Error && 'status' in error;
}

export async function createPullRequest({
  owner,
  repo,
  title,
  body,
  head,
  base = 'main',
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

    return pr.html_url;
  } catch (error) {
    console.error('Failed to create pull request:', error);
    if (isRequestError(error)) {
      if (error.status === 401) {
        throw new Error('GitHub 인증에 실패했습니다. GITHUB_ACCESS_TOKEN이 올바르게 설정되어 있는지 확인해주세요.');
      }
      if (error.status === 404) {
        throw new Error(`GitHub 레포지토리를 찾을 수 없습니다: ${owner}/${repo}`);
      }
      if (error.status === 422) {
        throw new Error('PR 생성에 실패했습니다. 브랜치 정보를 확인해주세요.');
      }
    }
    throw new Error('PR 생성 중 오류가 발생했습니다.');
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
    if (isRequestError(error)) {
      if (error.status === 401) {
        throw new Error('GitHub 인증에 실패했습니다. GITHUB_ACCESS_TOKEN이 올바르게 설정되어 있는지 확인해주세요.');
      }
      if (error.status === 404) {
        throw new Error(`GitHub 레포지토리를 찾을 수 없습니다: ${owner}/${repo}`);
      }
    }
    throw new Error('레포지토리 포크 중 오류가 발생했습니다.');
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
    if (isRequestError(error)) {
      if (error.status === 401) {
        throw new Error('GitHub 인증에 실패했습니다. GITHUB_ACCESS_TOKEN이 올바르게 설정되어 있는지 확인해주세요.');
      }
      if (error.status === 404) {
        throw new Error(`GitHub 레포지토리를 찾을 수 없습니다: ${owner}/${repo}`);
      }
      if (error.status === 422) {
        throw new Error('파일 생성/수정에 실패했습니다. 브랜치와 파일 정보를 확인해주세요.');
      }
    }
    throw new Error('파일 생성/수정 중 오류가 발생했습니다.');
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
    if (isRequestError(error) && error.status === 404) {
      return null;
    }
    throw new Error('브랜치 정보 조회 중 오류가 발생했습니다.');
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
    if (isRequestError(error)) {
      if (error.status === 401) {
        throw new Error('GitHub 인증에 실패했습니다. GITHUB_ACCESS_TOKEN이 올바르게 설정되어 있는지 확인해주세요.');
      }
      if (error.status === 404) {
        throw new Error(`GitHub 레포지토리를 찾을 수 없습니다: ${owner}/${repo}`);
      }
      if (error.status === 422) {
        throw new Error('브랜치 생성에 실패했습니다. 브랜치 이름과 SHA를 확인해주세요.');
      }
    }
    throw new Error('브랜치 생성 중 오류가 발생했습니다.');
  }
}
