import { fetch as undiciFetch, ProxyAgent, type Dispatcher } from "undici";

/**
 * FatSecret's Basic-tier API keys require IP allowlisting (no CIDR ranges),
 * which doesn't fit Vercel's dynamic serverless egress IPs. When
 * `FATSECRET_PROXY_URL` is set (a static-IP proxy like Noble IP), requests
 * are routed through it so a single fixed IP can be allowlisted. Locally,
 * where the dev machine's own IP is allowlisted directly, this is left
 * unset and requests go out via the proxy library's own networking, unproxied.
 *
 * IMPORTANT: every FatSecret call must go through this file's `fatsecretFetch`
 * — never Node's global `fetch` — and always via undici's own `fetch`
 * function, never mixed with the global one. Importing `undici`'s `ProxyAgent`
 * into a process that also calls the *global* native `fetch` corrupts that
 * global fetch's response decoding (reproduced with plain `node`, not a dev-tool
 * artifact — see fatsecret_push_integration memory). Using undici's own
 * `fetch` consistently for all FatSecret requests avoids the conflict entirely.
 */
let proxyAgent: ProxyAgent | undefined;

function getDispatcher(): Dispatcher | undefined {
  const proxyUrl = process.env.FATSECRET_PROXY_URL;
  if (!proxyUrl) return undefined;
  if (!proxyAgent) proxyAgent = new ProxyAgent(proxyUrl);
  return proxyAgent;
}

export function fatsecretFetch(
  url: string,
  init: Parameters<typeof undiciFetch>[1] = {},
): ReturnType<typeof undiciFetch> {
  const dispatcher = getDispatcher();
  return undiciFetch(url, dispatcher ? { ...init, dispatcher } : init);
}
