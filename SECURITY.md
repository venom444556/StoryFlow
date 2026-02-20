# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in StoryFlow, please report it responsibly.

**Do not file a public GitHub issue for security vulnerabilities.**

Instead, contact the maintainer directly:

- GitHub: [@venom444556](https://github.com/venom444556)

Please include:

1. A description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if any)

You should receive a response within 72 hours. If the vulnerability is confirmed, a fix will be prioritized and released as soon as possible.

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | Current   |

## Scope

StoryFlow is a local-first application. The client stores data in IndexedDB, and a local Express server persists data in SQLite. Security concerns are limited to:

- XSS through user-provided markdown content
- Malicious data in imported JSON project files
- Client-side and server-side data integrity
- Cross-origin attacks against the local REST API

## Security Controls

### Loopback binding

The server binds to `127.0.0.1` by default, preventing access from other machines on the network. Override with `STORYFLOW_HOST` if needed (not recommended for untrusted networks).

### CORS

CORS is restricted to an allowlist of known UI origins (`localhost:3000`, `localhost:3001`, and their `127.0.0.1` equivalents). Override with `STORYFLOW_CORS_ORIGINS` (comma-separated) if your UI runs on a different port.

### Token authentication

Set `STORYFLOW_MCP_TOKEN` to require a bearer token on all mutating API requests (POST, PUT, DELETE). The token is validated via `Authorization: Bearer <token>` or `X-StoryFlow-Token` header. When not set, mutating requests are unauthenticated (suitable for trusted local-only use).

The MCP plugin client reads the token from the same env var or from `~/.config/storyflow/config.json` (`"token"` field).

### Destructive operation safeguard

The `/api/sync` endpoint replaces all project data. It requires an `X-Confirm: overwrite-all` header in addition to any configured token auth.
