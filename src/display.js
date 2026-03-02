import { writeFileSync } from 'fs';

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';
const RED = '\x1b[31m';
const MAGENTA = '\x1b[35m';
const BG_BLUE = '\x1b[44m';
const WHITE = '\x1b[37m';

export function printBanner() {
  console.log(`\n${BOLD}${CYAN}  git-recap${RESET} ${DIM}v1.0.0${RESET}\n`);
}

export function printError(err) {
  console.error(`\n${RED}✗ Error:${RESET} ${err.message}\n`);
}

export async function printRecap(recap, format, outputFile, isPro) {
  if (format === 'terminal') {
    printTerminalRecap(recap, isPro);
  } else if (format === 'markdown') {
    const md = generateMarkdown(recap, isPro);
    if (outputFile) {
      writeFileSync(outputFile, md, 'utf8');
      console.log(`${GREEN}✓${RESET} Saved to ${outputFile}`);
    } else {
      console.log(md);
    }
  } else if (format === 'html') {
    if (!isPro) {
      console.log(`\n${YELLOW}HTML export is a Pro feature.${RESET}`);
      console.log(`Upgrade at: ${CYAN}https://git-recap.dev/upgrade${RESET}\n`);
      return;
    }
    const html = generateHTML(recap);
    const file = outputFile || 'git-recap.html';
    writeFileSync(file, html, 'utf8');
    console.log(`${GREEN}✓${RESET} HTML report saved to ${CYAN}${file}${RESET}`);
    try {
      const { default: open } = await import('open');
      await open(file);
    } catch {}
  }
}

function printTerminalRecap(recap, isPro) {
  const periodLabel = recap.period.days === 1 ? 'Today' :
    recap.period.days === 7 ? 'This Week' :
    `Last ${recap.period.days} Days`;

  console.log(`${BOLD}${BLUE}📋 Standup Report — ${periodLabel}${RESET}`);
  if (recap.author) {
    console.log(`${DIM}Author: ${recap.author}${RESET}`);
  }
  console.log(`${DIM}Period: ${recap.period.sinceDate} → ${recap.period.untilDate}${RESET}\n`);

  if (recap.totalCommits === 0) {
    console.log(`${YELLOW}No commits found in this period.${RESET}\n`);
    console.log(`${DIM}Tips:${RESET}`);
    console.log(`  • Try ${CYAN}git-recap --days 7${RESET} to look back a week`);
    console.log(`  • Try ${CYAN}git-recap --author "Your Name"${RESET} to filter by author\n`);
    return;
  }

  // Summary stats
  console.log(`${BOLD}Summary${RESET}`);
  console.log(`  ${GREEN}+${recap.totalAdditions}${RESET} ${RED}-${recap.totalDeletions}${RESET}  ${recap.totalFiles} files  ${recap.totalCommits} commits`);
  if (recap.repos.length > 1) {
    console.log(`  ${recap.repos.length} repositories`);
  }
  console.log('');

  // Per-repo breakdown
  for (const repo of recap.repos) {
    if (recap.repos.length > 1) {
      console.log(`${BOLD}${MAGENTA}⬡ ${repo.repoName}${RESET}  ${DIM}${repo.commitCount} commits${RESET}`);
    }

    // Branches
    if (repo.branches.length > 0) {
      console.log(`  ${DIM}Branches: ${repo.branches.join(', ')}${RESET}`);
    }

    // Categories with commits
    const categoryLabels = {
      feat: { icon: '✨', label: 'Features', color: GREEN },
      fix: { icon: '🐛', label: 'Bug Fixes', color: RED },
      refactor: { icon: '♻️', label: 'Refactors', color: BLUE },
      test: { icon: '✅', label: 'Tests', color: CYAN },
      docs: { icon: '📝', label: 'Docs', color: YELLOW },
      chore: { icon: '🔧', label: 'Chores', color: DIM },
      other: { icon: '📌', label: 'Other', color: RESET },
    };

    for (const [cat, { icon, label, color }] of Object.entries(categoryLabels)) {
      const commits = repo.categories[cat];
      if (!commits || commits.length === 0) continue;

      console.log(`\n  ${color}${icon} ${BOLD}${label}${RESET}`);
      commits.forEach(commit => {
        const subject = cleanSubject(commit.subject);
        console.log(`    ${DIM}${commit.hash}${RESET}  ${subject}`);
      });
    }

    console.log('');
  }

  // Pro upsell
  if (!isPro) {
    console.log(`${DIM}─────────────────────────────────────────${RESET}`);
    console.log(`${YELLOW}⚡ Unlock Pro — $9 one-time${RESET}`);
    console.log(`  • HTML reports with charts`);
    console.log(`  • Multi-repo scanning`);
    console.log(`  • Email standup reports`);
    console.log(`  • Team contribution summaries`);
    console.log(`  Run: ${CYAN}git-recap upgrade${RESET}\n`);
  }
}

function cleanSubject(subject) {
  if (!subject) return '(no message)';
  // Remove conventional commit prefix if present
  return subject
    .replace(/^(feat|fix|chore|docs?|test|refactor|style|perf|ci|build|revert)(\(.+?\))?!?:\s*/i, '')
    .trim();
}

function generateMarkdown(recap, isPro) {
  const periodLabel = recap.period.days === 1 ? 'Today' :
    recap.period.days === 7 ? 'This Week' :
    `Last ${recap.period.days} Days`;

  const lines = [
    `# Git Recap — ${periodLabel}`,
    '',
    `**Author:** ${recap.author || 'All'}  `,
    `**Period:** ${recap.period.sinceDate} → ${recap.period.untilDate}  `,
    `**Generated:** ${new Date(recap.generatedAt).toLocaleString()}`,
    '',
    `## Summary`,
    '',
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Commits | ${recap.totalCommits} |`,
    `| Files Changed | ${recap.totalFiles} |`,
    `| Lines Added | +${recap.totalAdditions} |`,
    `| Lines Removed | -${recap.totalDeletions} |`,
  ];

  if (recap.repos.length > 1) {
    lines.push(`| Repositories | ${recap.repos.length} |`);
  }

  for (const repo of recap.repos) {
    lines.push('', `## ${recap.repos.length > 1 ? `Repository: ${repo.repoName}` : 'Commits'}`, '');

    if (repo.branches.length > 0) {
      lines.push(`**Branches:** ${repo.branches.join(', ')}`, '');
    }

    const categoryLabels = {
      feat: '✨ Features',
      fix: '🐛 Bug Fixes',
      refactor: '♻️ Refactors',
      test: '✅ Tests',
      docs: '📝 Documentation',
      chore: '🔧 Chores',
      other: '📌 Other',
    };

    for (const [cat, label] of Object.entries(categoryLabels)) {
      const commits = repo.categories[cat];
      if (!commits || commits.length === 0) continue;

      lines.push(`### ${label}`, '');
      commits.forEach(commit => {
        lines.push(`- \`${commit.hash}\` ${cleanSubject(commit.subject)}`);
      });
      lines.push('');
    }
  }

  if (!isPro) {
    lines.push(
      '---',
      '*Generated by [git-recap](https://git-recap.dev) — Upgrade to Pro for HTML reports, email standups & more.*',
      ''
    );
  }

  return lines.join('\n');
}

function generateHTML(recap) {
  const periodLabel = recap.period.days === 1 ? 'Today' :
    recap.period.days === 7 ? 'This Week' :
    `Last ${recap.period.days} Days`;

  const reposHTML = recap.repos.map(repo => {
    const categoryHTML = Object.entries({
      feat: { icon: '✨', label: 'Features', color: '#22c55e' },
      fix: { icon: '🐛', label: 'Bug Fixes', color: '#ef4444' },
      refactor: { icon: '♻️', label: 'Refactors', color: '#3b82f6' },
      test: { icon: '✅', label: 'Tests', color: '#06b6d4' },
      docs: { icon: '📝', label: 'Documentation', color: '#f59e0b' },
      chore: { icon: '🔧', label: 'Chores', color: '#6b7280' },
      other: { icon: '📌', label: 'Other', color: '#8b5cf6' },
    }).filter(([cat]) => repo.categories[cat]?.length > 0)
      .map(([cat, { icon, label, color }]) => `
        <div class="category">
          <h3 style="color:${color}">${icon} ${label}</h3>
          <ul>
            ${repo.categories[cat].map(c =>
              `<li><code class="hash">${c.hash}</code> ${escapeHtml(cleanSubject(c.subject))}</li>`
            ).join('')}
          </ul>
        </div>
      `).join('');

    return `
      <div class="repo">
        ${recap.repos.length > 1 ? `<h2>⬡ ${escapeHtml(repo.repoName)}</h2>` : ''}
        ${repo.branches.length > 0 ? `<div class="branches">Branches: ${repo.branches.map(b => `<span class="branch">${escapeHtml(b)}</span>`).join('')}</div>` : ''}
        <div class="stats-mini">
          <span class="add">+${repo.stats.additions}</span>
          <span class="del">-${repo.stats.deletions}</span>
          <span>${repo.stats.filesChanged} files</span>
          <span>${repo.commitCount} commits</span>
        </div>
        ${categoryHTML}
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Git Recap — ${periodLabel}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; padding: 2rem; }
    .container { max-width: 900px; margin: 0 auto; }
    header { margin-bottom: 2rem; border-bottom: 1px solid #1e293b; padding-bottom: 1.5rem; }
    header h1 { font-size: 1.8rem; color: #38bdf8; }
    header .meta { color: #64748b; margin-top: 0.5rem; font-size: 0.9rem; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .stat-card { background: #1e293b; border-radius: 8px; padding: 1rem; text-align: center; }
    .stat-card .value { font-size: 1.6rem; font-weight: bold; }
    .stat-card .label { font-size: 0.8rem; color: #64748b; margin-top: 0.25rem; }
    .add { color: #22c55e; }
    .del { color: #ef4444; }
    .repo { background: #1e293b; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; }
    .repo h2 { font-size: 1.2rem; color: #a78bfa; margin-bottom: 1rem; }
    .branches { margin-bottom: 1rem; }
    .branch { background: #0f172a; border-radius: 4px; padding: 2px 8px; margin-right: 4px; font-size: 0.8rem; font-family: monospace; color: #38bdf8; }
    .stats-mini { display: flex; gap: 1rem; margin-bottom: 1rem; font-size: 0.9rem; color: #64748b; }
    .stats-mini .add { color: #22c55e; font-weight: bold; }
    .stats-mini .del { color: #ef4444; font-weight: bold; }
    .category { margin-bottom: 1rem; }
    .category h3 { font-size: 0.95rem; margin-bottom: 0.5rem; }
    .category ul { list-style: none; padding-left: 1rem; }
    .category li { padding: 3px 0; font-size: 0.9rem; color: #cbd5e1; }
    .hash { background: #0f172a; color: #64748b; padding: 1px 5px; border-radius: 3px; font-size: 0.8rem; margin-right: 6px; }
    footer { text-align: center; margin-top: 2rem; color: #334155; font-size: 0.8rem; }
    footer a { color: #38bdf8; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📋 Git Recap — ${escapeHtml(periodLabel)}</h1>
      <div class="meta">
        ${recap.author ? `Author: ${escapeHtml(recap.author)} &nbsp;·&nbsp; ` : ''}
        Period: ${recap.period.sinceDate} → ${recap.period.untilDate} &nbsp;·&nbsp;
        Generated: ${new Date(recap.generatedAt).toLocaleString()}
      </div>
    </header>

    <div class="summary-grid">
      <div class="stat-card">
        <div class="value">${recap.totalCommits}</div>
        <div class="label">Commits</div>
      </div>
      <div class="stat-card">
        <div class="value add">+${recap.totalAdditions}</div>
        <div class="label">Added</div>
      </div>
      <div class="stat-card">
        <div class="value del">-${recap.totalDeletions}</div>
        <div class="label">Removed</div>
      </div>
      <div class="stat-card">
        <div class="value">${recap.totalFiles}</div>
        <div class="label">Files</div>
      </div>
      ${recap.repos.length > 1 ? `<div class="stat-card"><div class="value">${recap.repos.length}</div><div class="label">Repos</div></div>` : ''}
    </div>

    ${reposHTML}

    <footer>
      Generated by <a href="https://git-recap.dev">git-recap</a> Pro
    </footer>
  </div>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
