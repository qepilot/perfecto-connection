/**
 * Builds the Perfecto WebSocket endpoint that Playwright connects to.
 *
 * Perfecto takes the capabilities as URL-encoded JSON in the query string:
 *   wss://<cloud>.perfectomobile.com/websocket?<encoded capabilities JSON>
 */

export interface PerfectoCapabilities {
  platformName: string;
  platformVersion: string;
  browserName: string;
  browserVersion: string;
  securityToken: string;
  'report.jobName'?: string;
  'report.jobNumber'?: number;
  [key: string]: unknown;
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env and set PERFECTO_CLOUD and PERFECTO_SECURITY_TOKEN.`,
    );
  }
  return value;
}

export function perfectoCapabilities(): PerfectoCapabilities {
  const env = process.env;
  return {
    platformName: env.PERFECTO_PLATFORM_NAME || 'Windows',
    platformVersion: env.PERFECTO_PLATFORM_VERSION || '11',
    browserName: env.PERFECTO_BROWSER_NAME || 'Chrome',
    browserVersion: env.PERFECTO_BROWSER_VERSION || 'latest',
    securityToken: required('PERFECTO_SECURITY_TOKEN'),
    'report.jobName': env.PERFECTO_JOB_NAME || 'perfecto-connection',
    'report.jobNumber': Number(env.PERFECTO_JOB_NUMBER || 1),
  };
}

export function perfectoWsEndpoint(caps: PerfectoCapabilities = perfectoCapabilities()): string {
  const cloud = required('PERFECTO_CLOUD').replace(/\.perfectomobile\.com.*$/, '');
  return `wss://${cloud}.perfectomobile.com/websocket?${encodeURIComponent(JSON.stringify(caps))}`;
}
