# git-recap Launch Plan

## Status

- [x] Product built and tested
- [x] GitHub repo: https://github.com/furkanmamuk/git-recap
- [x] GitHub Release: https://github.com/furkanmamuk/git-recap/releases/tag/v1.0.0
- [x] Landing page: https://furkanmamuk.github.io/git-recap/ (building)
- [ ] **REQUIRED: Set up Lemon Squeezy product → replace URL in landing + code**
- [ ] npm publish (need npm account login)
- [ ] Post to communities

---

## Required: Payment Setup (10 minutes)

### 1. Create Lemon Squeezy Account
1. Go to https://app.lemonsqueezy.com/register
2. Sign up with GitHub (1 click)
3. Create a Store called "git-recap"
4. Create a Product: "git-recap Pro" - $9 one-time
5. Get the checkout URL from the product page

### 2. Update the checkout URL
Replace `https://git-recap.lemonsqueezy.com/buy/pro` in:
- `src/upgrade.js` line 5
- `landing/index.html` (2 places, search for "lemonsqueezy")

### 3. Set up Webhook (for license delivery)
1. In Lemon Squeezy: Settings → Webhooks → Add
2. URL: `https://your-license-server.railway.app/webhook/lemonsqueezy`
3. Event: `order_created`
4. Copy the signing secret

### 4. Deploy License Server to Railway (free)
1. Go to https://railway.app (GitHub login)
2. New Project → Deploy from GitHub → furkanmamuk/git-recap
3. Set start command: `node src/license-server.js`
4. Add env vars:
   - `LEMONSQUEEZY_WEBHOOK_SECRET=<from step 3>`
   - `RESEND_API_KEY=<from https://resend.com - free tier>`
   - `FROM_EMAIL=noreply@git-recap.dev`

### 5. Set up Resend for email delivery
1. https://resend.com → Sign up free (3000 emails/month)
2. Get API key → add to Railway env vars

---

## npm Publish (reaches more developers)

```bash
npm login  # Enter npm credentials
npm publish
```

After publishing, `npx git-recap` works immediately.

---

## Launch Posts

### Reddit r/programming / r/devops / r/webdev

```
Title: I built a CLI tool that generates standup reports from git history

I got tired of trying to remember what I worked on during standups.
So I built git-recap — it reads your git log and generates a structured
report grouped by commit type (features, fixes, refactors, etc.).

Usage: npx git-recap

Free features:
- Terminal output (color-coded)
- Markdown export for Slack/Notion
- Custom date ranges

Pro ($9): HTML reports, multi-repo scanning

GitHub: https://github.com/furkanmamuk/git-recap
```

### Hacker News Show HN

```
Show HN: git-recap – Standup reports from your git history

https://github.com/furkanmamuk/git-recap

One-liner: npx git-recap

I built this because I was spending 5+ minutes every morning trying to
remember what I worked on. Now I just run git-recap before standup.

It groups commits by type (feat/fix/refactor/etc), shows diffs stats,
and runs completely locally — no API keys, no data sent anywhere.

Pro version ($9 one-time) adds HTML reports and multi-repo scanning.
```

### Dev.to Post

Write a 400-word "how I built this in a weekend" article.

### X/Twitter

```
I got tired of forgetting what I worked on during standups.

Built git-recap: npx git-recap → instant standup report from git history.

- Groups commits by type (feat/fix/refactor)
- Shows diff stats
- Exports to Markdown or HTML
- Runs 100% locally

Free + Pro ($9) 👇
github.com/furkanmamuk/git-recap
```

---

## Revenue Target

- Need: 6 sales at $9 = $54
- With 500 GitHub repo views → 10% click landing page → 2% convert = 1 sale
- Need: 3000+ visitors or higher conversion

## Traffic Sources Priority
1. r/devops, r/programming (high dev density)
2. Hacker News Show HN
3. Dev.to article
4. Twitter/X developer community
5. GitHub trending (organic)
