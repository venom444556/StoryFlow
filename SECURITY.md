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

StoryFlow is a local-first application. The client stores data in IndexedDB, and a local Express server persists data in SQLite. There is no authentication and no external network requests. Security concerns are limited to:

- XSS through user-provided markdown content
- Malicious data in imported JSON project files
- Client-side and server-side data integrity
