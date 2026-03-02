# git-recap Marketing Posts

> Ready-to-paste posts for maximum visibility

---

## Reddit Posts

### r/programming (HIGHEST PRIORITY)

**Title**: I got tired of blanking during standups, so I built a CLI that reads my git history

**Body**:
```
Every single day I'd sit down for standup, someone asks "what are you working on?"
and my mind goes blank even though I literally just shipped a bunch of stuff.

So I built git-recap:

    npx git-recap

It reads your git log and generates a structured standup report:

📋 Standup Report — Today
Author: Furkan Mamuk

Summary
  +847 -312  23 files  8 commits

  ✨ Features
    a3f7c2b  Add streaming response support
    9d2e851  Implement retry logic with backoff

  🐛 Bug Fixes
    f1a4e90  Fix race condition in WebSocket handler

Works with any git repo, completely offline, no API keys or accounts needed.
Also exports to Markdown for async standups in Slack/Notion.

Free version: terminal output + markdown export
Pro ($9): HTML reports, multi-repo scanning

GitHub: https://github.com/furkanmamuk/git-recap
```

---

### r/devops (SECOND PRIORITY)

**Title**: CLI tool that auto-generates standup reports from git history

**Body**:
```
If you're tired of manually figuring out what you worked on for daily standups,
try this:

    npx git-recap today     # what I did today
    npx git-recap week      # this week's summary
    npx git-recap --format markdown > standup.md   # export for Slack

It reads git log and groups commits by type (feat/fix/refactor/etc),
shows diff stats, and works completely locally — no data sent anywhere.

Supports:
- Author filtering (--author "Name")
- Custom date ranges (--since "2026-03-01")
- Multiple output formats (terminal, markdown, HTML Pro)

GitHub: https://github.com/furkanmamuk/git-recap
```

---

### Hacker News — Show HN

**Title**: Show HN: git-recap – Standup reports from your git history

**Body**:
```
Hi HN,

I found myself spending 5+ minutes before every standup trying to remember
what I actually worked on. So I built git-recap.

    npx git-recap

It runs git log under the hood, groups commits by conventional commit type
(feat/fix/refactor/test/docs/chore), shows line diff stats, and outputs a
readable standup report.

A few things I think are interesting about the implementation:
- Zero config: works in any git repo, reads user.name from git config
- Completely offline: no telemetry, no API calls, all local git commands
- Conventional commit detection without being strict about it — commits that
  don't follow the format just show as "Other"
- Offline license key validation using a simple checksum (no license server
  needed after purchase)

Free tier: terminal + markdown output
Pro ($9): HTML reports with dark-theme charts, multi-repo scanning

GitHub: https://github.com/furkanmamuk/git-recap
```

---

### Twitter/X Thread

**Tweet 1** (hook):
```
I built a CLI that cures "standup brain":

npx git-recap

→ reads your git history
→ groups commits by type
→ shows diff stats
→ instant standup report

1/4 🧵
```

**Tweet 2** (demo):
```
Output looks like this:

📋 Standup — Today
+847 -312 │ 23 files │ 8 commits

✨ Features
  a3f7c2b Add streaming response support

🐛 Bug Fixes
  f1a4e90 Fix race condition in WebSocket handler

♻️ Refactors
  2e8f9a1 Extract auth middleware into module

2/4
```

**Tweet 3** (features):
```
Free: terminal output + markdown export
Pro ($9): HTML reports, multi-repo scanning

100% local, no API keys, works with any git repo.

3/4
```

**Tweet 4** (CTA):
```
Built over a weekend because I was tired of blanking during standups.

GitHub → https://github.com/furkanmamuk/git-recap

4/4
```

---

### Dev.to Article

**Title**: I built a CLI that reads my git history so I never blank during standups

**Intro**:
"There's a specific kind of embarrassment that hits when your team lead asks
'what did you work on yesterday?' and your mind goes completely blank despite
the fact that you literally shipped 8 commits yesterday. I got tired of it."

[Show the problem, show the solution, explain technical decisions, link to GitHub]

---

## Timing Strategy

Post in this order for maximum effect:
1. **Today**: Post to r/programming (peak hours: 12-3pm EST)
2. **Today**: Post to r/devops
3. **Today**: Submit Show HN (peak hours: 9am-12pm EST)
4. **Today**: Tweet the thread
5. **Tomorrow**: Write and post Dev.to article (links back to Reddit/HN for more upvotes)

## Target Communities
- r/programming (1.2M members)
- r/devops (500K)
- r/webdev (1.2M)
- r/commandline (200K)
- Hacker News
- Dev.to
- Twitter #buildinpublic #devtools
