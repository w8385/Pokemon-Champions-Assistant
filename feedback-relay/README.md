# Feedback relay

This optional Cloudflare Worker accepts the public feedback form and forwards a validated, privacy-minimal message to Discord. The Discord webhook is a Worker secret and is never bundled into the site.

## Deploy

1. Copy `wrangler.toml.example` to `wrangler.toml` and adjust `ALLOWED_ORIGINS` if the production origin changes.
2. From this directory, run `npx wrangler secret put DISCORD_WEBHOOK_URL`. Paste the Discord webhook only into Wrangler's secret prompt; never commit it or add it to a `VITE_*` variable.
3. Run `npx wrangler deploy` and copy the resulting HTTPS Worker URL.
4. Set the repository variable `FEEDBACK_ENDPOINT` to that URL. The Pages build exposes only this public relay URL as `VITE_FEEDBACK_ENDPOINT`.

For a same-origin route, add `w8385.dev/Pokemon-Champions-Assistant/api/feedback*` under **Workers & Pages → your Worker → Settings → Domains & Routes → Add route**, select the `w8385.dev` zone, and use `/Pokemon-Champions-Assistant/api/feedback` as the repository variable. The Worker itself accepts only that exact path even though the Cloudflare route ends in `*`. If a separate `workers.dev` URL is used, keep `https://w8385.dev` in `ALLOWED_ORIGINS`.

The relay accepts only schema version 1, five known categories, canonical screen identifiers, `ko`/`en`/`ja`, bounded viewport data, and a message of at most 1,500 Unicode code points. It rejects unknown fields, raw URLs, oversized bodies, and unapproved origins. Discord mentions are disabled.

The in-memory IP throttle and submission-ID cache are best-effort defense in depth because Worker isolates do not share memory. Configure a Cloudflare edge rate-limiting rule for the Worker route before broad public use. The client honeypot and Discord's own limits are not substitutes for that edge rule.

Run the contract tests from the repository root:

```sh
node --test tests/feedbackRelay.test.mjs
```
