# git-recap

> Generate beautiful standup reports from your git history

```
npx git-recap
```

Zero config. Runs in any git repo. Know what you shipped today.

---

## Quick Start

```bash
# Run once (no install)
npx git-recap

# Install globally
npm install -g git-recap

# Then use anywhere
git-recap
git-recap week
git-recap --days 3
```

## Commands

```bash
git-recap              # Today's commits (default)
git-recap week         # This week's commits
git-recap --days 3     # Last 3 days
git-recap --author "Jane"    # Filter by author
git-recap --format markdown  # Output as Markdown
git-recap --format html      # HTML report (Pro)
git-recap --all-repos        # Scan all repos in dir (Pro)
git-recap --since "2026-03-01" --until "2026-03-02"  # Date range
git-recap upgrade      # Unlock Pro features
```

## Output

**Terminal** (default) — color-coded, grouped by commit type:

```
📋 Standup Report — Today
Author: Furkan Mamuk
Period: 2026-03-02 → now

Summary
  +847 -312  23 files  8 commits

  ✨ Features
    a3f7c2b  Add streaming response support
    9d2e851  Implement retry logic with backoff

  🐛 Bug Fixes
    f1a4e90  Fix race condition in WebSocket handler

  ♻️ Refactors
    2e8f9a1  Extract auth middleware into module
```

**Markdown** — paste into Slack/Notion/Jira:

```bash
git-recap --format markdown > standup.md
```

**HTML** — beautiful dark-theme report (Pro):

```bash
git-recap today --format html  # Opens in browser
```

## Free vs Pro

| Feature | Free | Pro |
|---------|------|-----|
| Terminal output | ✅ | ✅ |
| Markdown export | ✅ | ✅ |
| Custom date ranges | ✅ | ✅ |
| Author filtering | ✅ | ✅ |
| HTML reports | — | ✅ |
| Multi-repo scanning | — | ✅ |
| CSV/JSON export | — | ✅ |
| Team summaries | — | ✅ |
| **Price** | **Free** | **$9 one-time** |

**[Get Pro →](https://git-recap.lemonsqueezy.com/buy/pro)**

## Activate Pro

After purchase, you'll receive a license key by email:

```bash
git-recap activate GR-XXXXXXXX-XXXXXXXX
```

## Privacy

git-recap runs entirely locally. It only reads your git history using standard `git log` commands. **No data leaves your machine.**

## License

MIT (free tier) — © 2026 Furkan Mamuk
