/**
 * License key generation server
 *
 * This is a simple Express server that:
 * 1. Receives Lemon Squeezy webhooks on purchase
 * 2. Generates a valid license key
 * 3. Emails the key to the customer
 *
 * Deploy to Railway/Render with these env vars:
 *   LEMONSQUEEZY_WEBHOOK_SECRET=xxx
 *   SMTP_HOST=smtp.resend.com (or similar)
 *   SMTP_PORT=465
 *   SMTP_USER=resend@yourapi.com
 *   SMTP_PASS=xxx
 *   FROM_EMAIL=noreply@git-recap.dev
 */

import { createServer } from 'http';
import { createHmac } from 'crypto';

const PORT = process.env.PORT || 3000;
const WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || 'dev-secret';

function generateLicenseKey(email) {
  // Format: GR-XXXXXXXX-XXXXXXXX
  // The key is validated offline using a checksum
  const seed = email + Date.now() + Math.random().toString(36);
  const hash = createHmac('sha256', 'git-recap-v1').update(seed).digest('hex');

  const part1 = hash.substring(0, 8).toUpperCase();
  // Compute checksum: sum of part1 chars mod 256, encoded as 4-char hex in part2
  const checksum = part1.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 256;
  const part2 = checksum.toString(16).padStart(4, '0').toUpperCase() + hash.substring(12, 16).toUpperCase();

  return `GR-${part1}-${part2}`;
}

async function sendLicenseEmail(email, key) {
  // Simple email via Resend API (free tier: 3k/month)
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.log(`[MOCK EMAIL] To: ${email}, Key: ${key}`);
    return;
  }

  const body = JSON.stringify({
    from: process.env.FROM_EMAIL || 'noreply@git-recap.dev',
    to: [email],
    subject: '⚡ Your git-recap Pro License Key',
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; background: #0f172a; color: #e2e8f0;">
        <h1 style="color: #38bdf8;">⚡ Welcome to git-recap Pro!</h1>
        <p>Thanks for your purchase. Here's your license key:</p>
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 1rem 1.5rem; margin: 1.5rem 0; font-family: monospace; font-size: 1.2rem; color: #22c55e; text-align: center;">
          ${key}
        </div>
        <p>Activate it by running:</p>
        <div style="background: #1e293b; border-radius: 8px; padding: 0.75rem 1rem; font-family: monospace; color: #e2e8f0;">
          git-recap activate ${key}
        </div>
        <p style="margin-top: 1.5rem;">Or if you're using npx:</p>
        <div style="background: #1e293b; border-radius: 8px; padding: 0.75rem 1rem; font-family: monospace; color: #e2e8f0;">
          npx git-recap activate ${key}
        </div>
        <h2 style="margin-top: 2rem;">Pro Features Unlocked:</h2>
        <ul>
          <li>✅ HTML reports: <code>git-recap today --format html</code></li>
          <li>✅ Multi-repo: <code>git-recap week --all-repos</code></li>
          <li>✅ All future updates</li>
        </ul>
        <p style="margin-top: 2rem; color: #64748b; font-size: 0.85rem;">
          Questions? Reply to this email or contact support@git-recap.dev
        </p>
      </div>
    `,
  });

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!resp.ok) {
    throw new Error(`Email failed: ${await resp.text()}`);
  }
}

const server = createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'git-recap-license-server' }));
    return;
  }

  if (req.method !== 'POST' || req.url !== '/webhook/lemonsqueezy') {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  // Read body
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString('utf8');

  // Verify signature
  const signature = req.headers['x-signature'];
  const expectedSig = createHmac('sha256', WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  if (signature !== expectedSig) {
    console.error('Invalid signature');
    res.writeHead(401);
    res.end('Unauthorized');
    return;
  }

  const event = JSON.parse(rawBody);
  const eventName = event.meta?.event_name;

  console.log(`Received webhook: ${eventName}`);

  if (eventName === 'order_created') {
    const email = event.data?.attributes?.user_email;
    const orderId = event.data?.id;

    if (!email) {
      res.writeHead(400);
      res.end('No email found');
      return;
    }

    const key = generateLicenseKey(email);
    console.log(`Generated key for ${email}: ${key}`);

    try {
      await sendLicenseEmail(email, key);
      console.log(`License sent to ${email}`);
    } catch (err) {
      console.error(`Failed to send email: ${err.message}`);
    }
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ received: true }));
});

server.listen(PORT, () => {
  console.log(`License server running on port ${PORT}`);
});
