# perfecto-connection

Playwright tests (TypeScript) that check you can connect to the
[Perfecto](https://www.perfecto.io/) cloud and drive a remote browser.

## How it connects

Playwright connects to Perfecto over a WebSocket. The capabilities are passed as
URL-encoded JSON in the query string:

```
wss://<cloud>.perfectomobile.com/websocket?<encoded capabilities>
```

`perfecto.ts` builds that URL from your environment variables, and
`playwright.config.ts` passes it to Playwright's `connectOptions.wsEndpoint`. Every
test then runs on Perfecto instead of a local browser.

## Setup

Requires Node 18 or later.

```bash
npm install
cp .env.example .env
```

Edit `.env` and set at least:

| Variable | What it is |
| --- | --- |
| `PERFECTO_CLOUD` | Your cloud name, e.g. `demo` for `demo.perfectomobile.com` |
| `PERFECTO_SECURITY_TOKEN` | Your Perfecto security token |

These are optional: `PERFECTO_PLATFORM_NAME`, `PERFECTO_PLATFORM_VERSION`,
`PERFECTO_BROWSER_NAME`, `PERFECTO_BROWSER_VERSION`, `PERFECTO_JOB_NAME` and
`PERFECTO_JOB_NUMBER`. Defaults are Chrome `latest` on Windows 11.

`.env` is gitignored. Never commit your token.

You don't need `npx playwright install`, because the browser runs on Perfecto.

## Run

```bash
npm run test:connection
```

`tests/connection.spec.ts` checks three things:

1. The WebSocket session to Perfecto opens and the remote browser reports its version.
2. A page loads (`https://playwright.dev`) and its title and main heading can be read.
3. The remote browser's user agent can be read.

You can see the runs in Perfecto's report under the job name you set. The local
HTML report is in `playwright-report/`.

## Troubleshooting

- **`Missing PERFECTO_...`**: `.env` is missing, or a required value is empty.
- **401 or 403 during the handshake**: the security token is wrong or expired, or
  it belongs to a different cloud.
- **Version mismatch or `browserType.connect` errors**: the `@playwright/test`
  version must be one Perfecto supports. Pin it in `package.json` to the version
  your Perfecto cloud supports, then run `npm install` again.
- **Timeouts**: Perfecto may have no free device or browser. Retry, or change the
  platform or browser version.
