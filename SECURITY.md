# Security

## Model

Interval Timer is a static, client-only web app:

- No backend, accounts, analytics or third-party requests. All data (presets, last
  setup, mute setting) stays in the browser's `localStorage` on your device.
- Production builds ship a strict **Content-Security-Policy**: `default-src 'self'`,
  no inline scripts, no `eval`, and `object-src 'none'`.
- Data read from storage is validated before use. Invalid data falls back to defaults.

## Supply chain

- pnpm only installs package versions published at least **3 days** ago
  (`minimumReleaseAge` in `pnpm-workspace.yaml`), and dependency install scripts are
  blocked by default.
- Dependabot applies the same 3-day cooldown and groups updates. Pull requests get
  dependency review, and CodeQL scans the code weekly and on every change.
- GitHub Actions are pinned to full commit SHAs. Workflows run with least-privilege
  `permissions`, and checkout doesn't persist credentials.
- CI installs with `--frozen-lockfile`.

## Reporting a vulnerability

Please use GitHub's **private vulnerability reporting** (Security tab → "Report a
vulnerability") rather than opening a public issue.
