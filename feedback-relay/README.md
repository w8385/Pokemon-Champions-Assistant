# Feedback relay

This Cloudflare Worker receives feedback at the site's same-origin endpoint and forwards a validated, privacy-minimal message to Discord. The Discord webhook is a Worker secret and is never bundled into the site.

## Deploy

1. Use Node.js 22 or newer, then run `npx wrangler login` with the Cloudflare account that owns `w8385.dev`.
2. In Discord, create a webhook for the private feedback channel you want to receive messages in.
3. From this directory, run `npx wrangler deploy`. The tracked route sends only `w8385.dev/Pokemon-Champions-Assistant/api/feedback*` to this Worker.
4. Run `npx wrangler secret put DISCORD_WEBHOOK_URL` and paste the webhook into Wrangler's hidden prompt. Never commit it or add it to a `VITE_*` variable.
5. Before merging the relay-only frontend, POST a valid test payload to `https://w8385.dev/Pokemon-Champions-Assistant/api/feedback` with the request header `Origin: https://w8385.dev`. Confirm the response is HTTP `202` with `{ "ok": true }` and the message appears in Discord.
6. Confirm the tracked `FEEDBACK_RATE_LIMITER` binding is present. It applies a best-effort five-requests-per-minute limit per source IP and Cloudflare location; the isolate-local throttle remains a fallback.
7. Deploy the frontend, submit once from the actual widget, and confirm the final end-to-end delivery.

The frontend defaults to `/Pokemon-Champions-Assistant/api/feedback`, so the same-origin deployment needs no repository variable. `FEEDBACK_ENDPOINT` remains an optional build-time override for a separately hosted relay. The Worker accepts only the exact API path even though the Cloudflare route ends in `*`.

The client recognizes success only when the relay returns HTTP `202` with JSON `{ "ok": true }`. A missing route, an HTML fallback, or a Discord failure therefore keeps the draft visible and offers retry/copy recovery instead of reporting a false success.

The relay accepts only schema version 1, five known categories, canonical screen identifiers, `ko`/`en`/`ja`, bounded viewport data, and a message of at most 1,500 Unicode code points. It rejects unknown fields, raw URLs, oversized bodies, and unapproved origins. Discord mentions are disabled.

Cloudflare documents that Rate Limiting bindings are approximate and apply separately in each location. The binding, isolate-local fallback, honeypot, and submission-ID cache are layered abuse controls rather than a strict global quota. Use a WAF rule or Durable Object if the endpoint later needs a strict global limit.

Run the contract tests from the repository root:

```sh
node --test tests/feedbackRelay.test.mjs
```
