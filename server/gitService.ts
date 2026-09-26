import { execSync } from 'child_process';

export interface GitStatusInfo {
  success: boolean;
  branch: string;
  remoteUrl: string;
  aheadCount: number;
  aheadCommits: string[];
  behindCount: number;
  behindCommits: string[];
  latestCommit: string;
  isClean: boolean;
  hasEnvToken: boolean;
  message?: string;
}

export class GitService {
  private remoteUrl = 'https://github.com/aleesent/saarthi-solution-web.git';

  /**
   * Helper to execute shell git command safely
   */
  private runGit(cmd: string): string {
    return execSync(cmd, { cwd: process.cwd(), encoding: 'utf-8', timeout: 30000 }).trim();
  }

  /**
   * Helper to sanitize tokens from logs/messages
   */
  private redact(str: string): string {
    return str.replace(/https:\/\/[^@\s]+@github\.com/gi, 'https://***@github.com');
  }

  /**
   * Get git status, commits ahead/behind, branch name
   */
  public async getStatus(): Promise<GitStatusInfo> {
    try {
      // 1. Fetch remote silently
      try {
        this.runGit('git fetch origin');
      } catch (fetchErr) {
        console.warn('[GitService] git fetch origin warning:', fetchErr);
      }

      const branch = this.runGit('git rev-parse --abbrev-ref HEAD') || 'main';
      const statusPorcelain = this.runGit('git status --porcelain');
      const isClean = statusPorcelain.length === 0;

      let aheadCommits: string[] = [];
      let behindCommits: string[] = [];

      try {
        const aheadOut = this.runGit('git log origin/main..HEAD --oneline');
        if (aheadOut) aheadCommits = aheadOut.split('\n').filter(Boolean);
      } catch {
        // remote branch might not exist yet
      }

      try {
        const behindOut = this.runGit('git log HEAD..origin/main --oneline');
        if (behindOut) behindCommits = behindOut.split('\n').filter(Boolean);
      } catch {
        // ignore
      }

      let latestCommit = '';
      try {
        latestCommit = this.runGit('git log -1 --format="%h - %s (%cr)"');
      } catch {
        latestCommit = 'Initial';
      }

      const hasEnvToken = !!(process.env.GITHUB_TOKEN || process.env.GH_TOKEN);

      return {
        success: true,
        branch,
        remoteUrl: this.remoteUrl,
        aheadCount: aheadCommits.length,
        aheadCommits,
        behindCount: behindCommits.length,
        behindCommits,
        latestCommit,
        isClean,
        hasEnvToken,
        message: aheadCommits.length > 0
          ? `${aheadCommits.length} new commit(s) ready to push to GitHub`
          : 'Repository is up to date with origin/main'
      };
    } catch (err: any) {
      return {
        success: false,
        branch: 'main',
        remoteUrl: this.remoteUrl,
        aheadCount: 0,
        aheadCommits: [],
        behindCount: 0,
        behindCommits: [],
        latestCommit: '',
        isClean: true,
        hasEnvToken: !!(process.env.GITHUB_TOKEN || process.env.GH_TOKEN),
        message: this.redact(err.message)
      };
    }
  }

  /**
   * Pull and merge from remote origin/main
   */
  public async pull(): Promise<{ success: boolean; message: string; output?: string }> {
    try {
      const fetchOut = this.runGit('git fetch origin');
      const branch = this.runGit('git rev-parse --abbrev-ref HEAD') || 'main';
      
      const behindOut = this.runGit('git log HEAD..origin/main --oneline');
      if (!behindOut) {
        return { success: true, message: 'Already up to date with remote GitHub repository', output: fetchOut };
      }

      const mergeOut = this.runGit(`git merge origin/${branch}`);
      return {
        success: true,
        message: 'Successfully pulled and merged latest commits from GitHub',
        output: this.redact(mergeOut)
      };
    } catch (err: any) {
      return {
        success: false,
        message: this.redact(err.message)
      };
    }
  }

  /**
   * Push local commits to GitHub repository
   */
  public async push(userToken?: string): Promise<{
    success: boolean;
    requiresAuth?: boolean;
    message: string;
    output?: string;
    pushedCommits?: string[];
  }> {
    const token = (userToken || process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '').trim();

    if (!token) {
      return {
        success: false,
        requiresAuth: true,
        message:
          'GitHub authentication required. Please enter your GitHub Personal Access Token (classic or fine-grained with "repo" scope) or set GITHUB_TOKEN in your environment.'
      };
    }

    try {
      const branch = this.runGit('git rev-parse --abbrev-ref HEAD') || 'main';
      
      // Get list of commits that will be pushed
      let commitsToPush: string[] = [];
      try {
        const logAhead = this.runGit('git log origin/main..HEAD --oneline');
        if (logAhead) commitsToPush = logAhead.split('\n').filter(Boolean);
      } catch {
        // ignore
      }

      // Format push target with auth
      const pushTarget = `https://${encodeURIComponent(token)}@github.com/aleesent/saarthi-solution-web.git`;
      
      // Execute git push
      const output = this.runGit(`git push ${pushTarget} ${branch}`);

      // Ensure local tracking is up-to-date
      try {
        this.runGit('git fetch origin');
      } catch {
        // ignore
      }

      return {
        success: true,
        message: `Successfully pushed ${commitsToPush.length || 'all'} commit(s) to https://github.com/aleesent/saarthi-solution-web.git (${branch})`,
        output: this.redact(output),
        pushedCommits: commitsToPush
      };
    } catch (err: any) {
      const safeError = this.redact(err.message || String(err));
      console.error('[GitService] Push failed:', safeError);
      return {
        success: false,
        message: safeError.includes('403') || safeError.includes('Authentication failed') || safeError.includes('Bad credentials')
          ? 'GitHub authentication failed. Please verify your token has write ("repo") permissions for this repository.'
          : safeError
      };
    }
  }
}

export const gitService = new GitService();
