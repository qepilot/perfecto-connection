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
`PERFECTO_JOB_NUMBER`, and `PERFECTO_TUNNEL_ID` (see below). Defaults are Chrome `latest` on Windows 11.

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

## Testing internal sites (Perfecto Connect tunnel)

Public sites such as `playwright.dev` need nothing extra. If the site under test
is only reachable from your network (internal, staging behind a VPN or firewall,
or `localhost`), Perfecto's cloud browser can't load it. In that case, open a
Perfecto Connect tunnel and pass its ID:

1. Download the Perfecto Connect client for your OS from Perfecto (see
   [Work with Perfecto Connect](https://help.perfecto.io/perfecto-help/content/perfecto/automation-testing/work_with_perfecto_connect.htm)).
2. On a machine that can reach the site, start a tunnel:

   ```bash
   ./perfectoconnect start -c mlb.perfectomobile.com -s <security token>
   ```

   The command prints the tunnel ID. Keep the client running while the tests run.
3. Put that ID in `.env` as `PERFECTO_TUNNEL_ID=...`. It is sent as the
   `tunnelId` capability only when set.
4. Run the tests as usual. When you're done, stop the tunnel with
   `./perfectoconnect stop`.

To capture the ID in one step (for example in CI):

```bash
export PERFECTO_TUNNEL_ID=$(./perfectoconnect start -c mlb.perfectomobile.com -s "$PERFECTO_SECURITY_TOKEN")
```

Note: Perfecto documents `tunnelId` for Selenium and Appium. It hasn't been verified
over the Playwright connection in this repo yet.

## Troubleshooting

- **`Missing PERFECTO_...`**: `.env` is missing, or a required value is empty.
- **401 or 403 during the handshake**: the security token is wrong or expired, or
  it belongs to a different cloud.
- **Version mismatch or `browserType.connect` errors**: the `@playwright/test`
  version must be one Perfecto supports. Pin it in `package.json` to the version
  your Perfecto cloud supports, then run `npm install` again.
- **Timeouts**: Perfecto may have no free device or browser. Retry, or change the
  platform or browser version.
