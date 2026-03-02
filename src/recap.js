import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

function getGitAuthor() {
  try {
    return execSync('git config user.name', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return null;
  }
}

function isGitRepo(dir) {
  try {
    execSync('git rev-parse --git-dir', { cwd: dir, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function getRepoName(dir) {
  // Try remote URL first
  try {
    const remote = execSync('git remote get-url origin', {
      cwd: dir,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    const name = remote.split('/').pop().replace(/\.git$/, '');
    if (name) return name;
  } catch {}

  // Fall back to directory name
  try {
    const toplevel = execSync('git rev-parse --show-toplevel', {
      cwd: dir,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    return toplevel.split(/[/\\]/).filter(Boolean).pop() || 'unknown';
  } catch {
    return dir.split(/[/\\]/).filter(Boolean).pop() || 'unknown';
  }
}

function getCommits(dir, since, until, author) {
  const authorFilter = author ? `--author="${author}"` : '';
  const sinceFilter = since ? `--since="${since}"` : '';
  const untilFilter = until ? `--until="${until}"` : '';

  try {
    const raw = execSync(
      `git log --oneline --no-merges ${authorFilter} ${sinceFilter} ${untilFilter} --format="%H|%s|%ai|%an|%ae"`,
      { cwd: dir, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    ).trim();

    if (!raw) return [];

    return raw
      .split('\n')
      .filter(Boolean)
      .map(line => {
        const [hash, subject, date, authorName, authorEmail] = line.split('|');
        return { hash: hash?.substring(0, 7), subject, date, author: authorName, email: authorEmail };
      });
  } catch {
    return [];
  }
}

function getStats(dir, since, until, author) {
  const authorFilter = author ? `--author="${author}"` : '';
  const sinceFilter = since ? `--since="${since}"` : '';
  const untilFilter = until ? `--until="${until}"` : '';

  try {
    const statsRaw = execSync(
      `git log --no-merges ${authorFilter} ${sinceFilter} ${untilFilter} --numstat --format=""`,
      { cwd: dir, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    ).trim();

    let additions = 0;
    let deletions = 0;
    let filesChanged = new Set();

    if (statsRaw) {
      statsRaw.split('\n').filter(Boolean).forEach(line => {
        const parts = line.trim().split('\t');
        if (parts.length === 3) {
          const [add, del, file] = parts;
          if (add !== '-') additions += parseInt(add) || 0;
          if (del !== '-') deletions += parseInt(del) || 0;
          if (file) filesChanged.add(file);
        }
      });
    }

    return { additions, deletions, filesChanged: filesChanged.size };
  } catch {
    return { additions: 0, deletions: 0, filesChanged: 0 };
  }
}

function getBranches(dir, since, until, author) {
  const authorFilter = author ? `--author="${author}"` : '';
  try {
    const raw = execSync(
      `git log --no-merges ${authorFilter} --since="${since || '24 hours ago'}" --until="${until || 'now'}" --format="%D"`,
      { cwd: dir, encoding: 'utf8', stdio: 'pipe' }
    ).trim();

    const branches = new Set();
    raw.split('\n').filter(Boolean).forEach(refs => {
      refs.split(',').forEach(ref => {
        const trimmed = ref.trim();
        if (trimmed && !trimmed.startsWith('HEAD') && !trimmed.startsWith('origin/HEAD') && !trimmed.startsWith('tag:')) {
          const branch = trimmed.replace(/^origin\//, '').replace(/^HEAD -> /, '');
          if (branch) branches.add(branch);
        }
      });
    });
    return [...branches];
  } catch {
    return [];
  }
}

function categorizeSommits(commits) {
  const categories = {
    feat: [],
    fix: [],
    refactor: [],
    test: [],
    docs: [],
    chore: [],
    other: [],
  };

  const patterns = {
    feat: /^feat[(:]/i,
    fix: /^fix[(:]/i,
    refactor: /^refactor[(:]/i,
    test: /^test[(:]/i,
    docs: /^docs?[(:]/i,
    chore: /^chore[(:]/i,
  };

  commits.forEach(commit => {
    let categorized = false;
    for (const [cat, pattern] of Object.entries(patterns)) {
      if (pattern.test(commit.subject)) {
        categories[cat].push(commit);
        categorized = true;
        break;
      }
    }
    if (!categorized) categories.other.push(commit);
  });

  return categories;
}

function getDateRange(days, since, until) {
  const now = new Date();
  const sinceDate = since || (() => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  })();
  const untilDate = until || 'now';
  return { sinceDate, untilDate };
}

export async function generateRecap({ days, author, format, allRepos, since, until, isPro }) {
  const resolvedAuthor = author || getGitAuthor();
  const { sinceDate, untilDate } = getDateRange(days, since, until);

  const repos = [];

  if (allRepos && isPro) {
    // Scan current directory for git repos (Pro feature)
    const { readdirSync, statSync } = await import('fs');
    const cwd = process.cwd();
    try {
      const entries = readdirSync(cwd);
      for (const entry of entries) {
        const fullPath = join(cwd, entry);
        try {
          if (statSync(fullPath).isDirectory() && isGitRepo(fullPath)) {
            repos.push(fullPath);
          }
        } catch {}
      }
    } catch {}
    if (repos.length === 0 && isGitRepo(cwd)) repos.push(cwd);
  } else {
    if (isGitRepo(process.cwd())) {
      repos.push(process.cwd());
    }
  }

  if (repos.length === 0) {
    throw new Error('Not in a git repository. Run git-recap from inside a git project.');
  }

  const repoRecaps = [];

  for (const repoDir of repos) {
    const commits = getCommits(repoDir, sinceDate, untilDate, resolvedAuthor);
    if (commits.length === 0) continue;

    const stats = getStats(repoDir, sinceDate, untilDate, resolvedAuthor);
    const branches = getBranches(repoDir, sinceDate, untilDate, resolvedAuthor);
    const categories = categorizeSommits(commits);
    const repoName = getRepoName(repoDir);

    repoRecaps.push({
      repoName,
      repoDir,
      commits,
      stats,
      branches,
      categories,
      commitCount: commits.length,
    });
  }

  return {
    author: resolvedAuthor,
    period: { sinceDate, untilDate, days },
    repos: repoRecaps,
    totalCommits: repoRecaps.reduce((sum, r) => sum + r.commitCount, 0),
    totalAdditions: repoRecaps.reduce((sum, r) => sum + r.stats.additions, 0),
    totalDeletions: repoRecaps.reduce((sum, r) => sum + r.stats.deletions, 0),
    totalFiles: repoRecaps.reduce((sum, r) => sum + r.stats.filesChanged, 0),
    generatedAt: new Date().toISOString(),
  };
}
