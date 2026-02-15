---
name: work-smarter-not-harder
description: >
  Maximize leverage with production-grade library recommendations, automation, and MVP
  slicing. Every suggestion includes quality gates, maturity checks, and implementation
  details. No vague "use X" - full evaluation with code examples.
---

# Work Smarter Not Harder (WSNH)

Maximize leverage and minimize toil with production-grade recommendations backed by quality gates and detailed implementation guidance.

## When to use

Active during planning and execution when choosing implementation approaches. Advisory to Architect.

## Instructions

### Solution Quality Gates

**Before recommending ANY library, validate against these gates:**

**Library Maturity Check:**
- GitHub stars: >1,000 (or >100 for niche specialized tools)
- Last commit: <6 months ago (actively maintained)
- Open issues: <100 critical bugs (well-maintained)
- License: Permissive (MIT, Apache 2.0) or verify GPL compatibility
- Production use: Evidence of real-world usage

**Community Health:**
- Active community: Discord/Slack (>500 members OR responsive maintainers)
- Stack Overflow: Questions asked and answered (shows adoption)
- Documentation: API reference + examples + migration guides
- Used by: At least 3 well-known companies (check GitHub "Used by")

**Example Quality Gate Check:**
```
Library: yjs (CRDT for collaboration)
✓ GitHub: 12.5k stars
✓ Last commit: 2 weeks ago
✓ License: MIT
✓ Community: Active Discord (2k+ members)
✓ Used by: Notion, Figma, Linear
✓ Docs: Excellent (API + examples + guides)
✓ Open issues: 45 (well-managed)
Status: RECOMMENDED ✅

Library: obscure-lib
✗ GitHub: 50 stars
✗ Last commit: 18 months ago
✗ Used by: Unknown companies
✗ Docs: README only
Status: DO NOT RECOMMEND ❌
```

### Production Readiness Checklist

**Before recommending solution, verify:**
- **Error handling**: Library has retry/timeout/circuit breaker? (YES/NO/PARTIAL)
- **Monitoring**: Can we track performance/errors? (Built-in/External/Manual)
- **Rollback**: Can we quickly revert? (Feature flag/Version pin/Rebuild)
- **TypeScript**: Type definitions available? (Native/DefinitelyTyped/None)
- **Bundle size**: <50KB gzipped for frontend (or justify if larger)
- **Breaking changes**: Semantic versioning followed? (Check changelog)

**Example Production Check:**
```
Solution: Clerk (Authentication)
✓ Error handling: Built-in retry + user-friendly errors
✓ Monitoring: Dashboard with login analytics
✓ Rollback: Feature flags + version pinning
✓ TypeScript: Native TypeScript support
✓ Bundle size: 35KB gzipped
✓ Breaking changes: Semantic versioning + migration guides
Status: PRODUCTION-READY ✅

Solution: custom-auth-lib
✗ Error handling: Basic try-catch only
✗ Monitoring: Manual logging required
✗ Rollback: Code changes needed
✗ TypeScript: No types
? Bundle size: Unknown
Status: NOT PRODUCTION-READY ❌
```

### Implementation Detail Level

**Not this (too vague):**
"Use yjs for real-time collaboration"

**This (production-grade):**
```
Real-Time Collaboration Implementation:

Quality Gates Check:
✓ yjs: 12.5k stars, MIT license, used by Notion/Figma/Linear
✓ Production-ready: Error handling, TypeScript support, 15KB gzipped
✓ Community: Active Discord, excellent docs

1. Install dependencies:
```bash
npm install yjs y-websocket
```

2. Create shared document (client):
```typescript
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

const doc = new Y.Doc()
const provider = new WebsocketProvider(
  'wss://your-server.com',
  'room-name',
  doc
)

// Shared text field
const yText = doc.getText('content')

// Listen for changes
yText.observe(event => {
  console.log('Content changed:', yText.toString())
})

// Make changes
yText.insert(0, 'Hello World')
```

3. Setup WebSocket server:
```typescript
import { WebSocketServer } from 'ws'
import { setupWSConnection } from 'y-websocket/bin/utils'

const wss = new WebSocketServer({ port: 1234 })
wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req)
})
```

4. Production considerations:
- Persistence: Use y-redis for multi-server state
- Authentication: Add token validation to WebSocket handshake
- Rate limiting: 100 updates/sec per user
- Monitoring: Track doc size, connection count, sync latency
- Backup: Snapshot doc state every 5 minutes to S3
- Error handling: Reconnect logic with exponential backoff

5. Deployment:
- Use Railway/Render for WebSocket server ($5-10/month)
- Alternative: Partykit (managed WebSocket, $0 dev tier)

Time estimate: 4-6 hours (includes testing)
Cost estimate: $5-10/month infrastructure
Complexity: Medium (WebSocket + CRDT learning curve)
```
```

### Suggest Libraries Over Custom

Before building from scratch: "Does a production-grade library exist?"

**Evaluation framework:**
1. **Run quality gates** (GitHub stars, maintenance, community)
2. **Check production readiness** (error handling, monitoring, rollback)
3. **Estimate effort savings** (hours/days saved vs custom)
4. **Verify security** (especially for auth, crypto, payments)
5. **Calculate TCO** (license cost + integration time + maintenance)

**Choosing Between Libraries:**
When multiple options exist, compare using scorecard:

```
Library Comparison: Form Validation

zod:
  Stars: 32k ✓
  Bundle: 8KB ✓
  TypeScript: Native ✓
  Last commit: 1 week ✓
  Score: 9/10
  
yup:
  Stars: 22k ✓
  Bundle: 12KB ~
  TypeScript: DefinitelyTyped ~
  Last commit: 2 months ✓
  Score: 8/10
  
joi:
  Stars: 21k ✓
  Bundle: 145KB ✗ (too large for frontend)
  TypeScript: DefinitelyTyped ~
  Last commit: 1 month ✓
  Score: 6/10 (backend only)

Recommendation: zod (best for frontend + TypeScript)
```

### Exercise Judgment - When NOT to Use Libraries

Some scenarios favor custom code:
- **Proprietary/unique requirements**: Patented algorithms, company-specific business logic
- **Security-critical with strict control**: Though still use crypto primitives, never roll crypto
- **Tiny scope**: Library overhead > value (e.g., simple string formatter)
- **Learning goals**: Building teaches necessary skills for team growth
- **Unusual constraints**: No library fits edge case requirements
- **Bundle size critical**: Library adds 100KB for 10-line feature

**Example - Custom Makes Sense:**
```
Scenario: Company-specific pricing calculator
- Unique: Complex proprietary pricing rules (7 tiers, regional adjustments)
- Small scope: ~200 lines of logic
- No library: Pricing rules too specific to productize
- Decision: Build custom, well-tested pricing engine
- Time: 2 days (vs weeks learning/adapting generic library)
```

### Security-Critical Areas (NEVER Custom)

Always use proven, audited solutions:

**Authentication/Authorization:**
- Recommended: Auth0, Clerk, Supabase Auth, NextAuth.js
- Why: Session management, password hashing, OAuth flows are high-risk
- Cost: $25-50/month (worth it vs security breach)
- Never: Custom JWT implementation, rolling your own session management

**Cryptography:**
- Recommended: Use established libraries (Web Crypto API, libsodium, bcrypt)
- Why: Crypto is easy to get wrong, vulnerabilities catastrophic
- Never: Custom encryption algorithms, homebrew hashing

**Payment Processing:**
- Recommended: Stripe, Square, Paddle
- Why: PCI compliance required, fraud detection, legal liability
- Cost: 2.9% + $0.30 per transaction (industry standard)
- Never: Storing credit card data, custom payment processing

**Input Validation:**
- Recommended: zod, yup, validator.js
- Why: Prevent injection attacks (SQL, XSS, command injection)
- Never: Regex-only validation, trusting client-side validation alone

**Production Implementation Example:**
```
Authentication with Clerk:

Quality Gates:
✓ Production-ready: SOC2 compliant, used by 50k+ apps
✓ Security: Built-in MFA, session management, OAuth
✓ Monitoring: Analytics dashboard, webhook events
✓ Rollback: Version pinning, gradual rollout support

Installation:
```bash
npm install @clerk/nextjs
```

Implementation:
```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}

// app/dashboard/page.tsx
import { auth } from '@clerk/nextjs'

export default function Dashboard() {
  const { userId } = auth()
  
  if (!userId) {
    redirect('/sign-in')
  }
  
  return <div>Protected dashboard</div>
}
```

Production setup:
- Environment variables: CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- Webhooks: User creation/deletion sync to database
- Middleware: Protect routes with auth() check
- Monitoring: Track sign-ups, login failures via Clerk dashboard
- Cost: $25/month (up to 10k users)

Time estimate: 2-3 hours setup (vs 3-4 weeks custom auth)
Security: Enterprise-grade (vs unknown vulnerabilities in custom)
Maintenance: Zero (vs ongoing security patches)
```
```

### Identify Automation Opportunities

**ROI Calculation Framework:**
```
ROI = (Time saved per occurrence × Frequency × Hourly rate) - Automation cost

Example:
- Manual task: Deploy to staging (15 min)
- Frequency: 20 deploys/month
- Hourly rate: $100/hour
- Automation cost: 2 hours setup

Monthly savings: 15 min × 20 = 5 hours = $500
Setup cost: 2 hours = $200
ROI: $500 - $200 = $300/month (breaks even in <1 month)
```

**Automation candidates:**
- Repetitive manual tasks (daily/weekly routines)
- Error-prone processes (manual deployments, config changes)
- Time-consuming workflows (testing, builds, releases)
- Tasks requiring consistency (code formatting, linting)

**Automation examples with implementation:**
```
Opportunity: Database migrations (manual SQL → automated)

Current state:
- Write SQL manually
- Copy-paste to production console
- Risk: Typos, missing transactions, rollback failures
- Time: 30 min per migration × 20 migrations/month = 10 hours

Automated solution (Drizzle Kit):
```bash
npm install drizzle-orm drizzle-kit
```

```typescript
// schema.ts
import { pgTable, serial, text } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
})
```

```bash
# Generate migration
npx drizzle-kit generate:pg

# Apply migration
npx drizzle-kit push:pg
```

Production benefits:
- Time savings: 10 hours/month
- Error reduction: 100% (no manual SQL typos)
- Rollback: Automatic via migration files
- Version control: Migrations tracked in Git
- CI/CD: Automated in deployment pipeline

Setup time: 1 hour
ROI: Positive after first month
```
```

### Find the MVP Slice

**Framework for ruthless scope cutting:**

1. **Identify core hypothesis**: What ONE thing are we validating?
2. **Strip everything else**: Cut features that don't test hypothesis
3. **Prioritize brutal**ly:
   - Must-have: Core hypothesis test (ship this)
   - Important: Validates secondary assumptions (defer)
   - Nice-to-have: Polish, convenience (cut)
   - Future: Advanced features (delete from V1)

**MVP Slicing Example:**
```
Feature: Task management app

Core hypothesis: Users need shared todo lists

Must-have (V1 - ship this week):
- Create task (title only)
- Mark complete
- View task list
- Share list URL
- localStorage persistence

Deferred (V2 - validate first):
- User accounts (localStorage sufficient for now)
- Database (localStorage works for MVP)
- Due dates (core is just task completion)
- Priorities (can add post-validation)
- Attachments (polish, not core)

Cut (V3+ or never):
- Real-time sync (complex, validate basic first)
- Offline mode (can use service worker later)
- Collaboration (multi-user editing)
- Recurring tasks (advanced)
- Mobile apps (web works for testing)

Result:
- V1: 1 week build time (vs 2 months full-featured)
- Learn if people actually use shared todos
- Can add features once validated
- Avoid building unwanted features
```

### Reduce Toil

**Identify toil:**
- Manual work that can be eliminated
- Repetitive without learning value
- Grows linearly with scale
- Could be automated

**Quantify waste:**
```
Manual Process Analysis:

Task: Code review reminders
Current: Manually ping team in Slack
Frequency: 3x per day
Time: 5 min each
Total: 15 min/day × 20 workdays = 5 hours/month

Automated solution: GitHub Actions + Slack webhook
Setup time: 30 minutes
Savings: 5 hours/month = 60 hours/year
ROI: Positive after first month, saves 60 hours/year
```

**Challenge unnecessary complexity:**
```
Complexity Audit:

Proposed: Microservices architecture
Current scale: 100 users
Team size: 2 developers

Questions:
- Do we need microservices? No (monolith simpler)
- At what scale? Consider at 10k+ users
- Overhead cost: 40% more DevOps complexity
- Benefit now: None (premature optimization)

Recommendation: Start with monolith
- Single deployment
- Easier debugging
- Faster development
- Can extract services later if needed

Decision: Defer microservices until proven bottleneck
```

### Output Format

```
Efficiency Analysis:

Library Recommendation:
Library: zod (form validation)
Quality Gates:
  ✓ 32k GitHub stars, MIT license
  ✓ Last commit: 1 week ago
  ✓ TypeScript: Native support
  ✓ Bundle: 8KB gzipped
  ✓ Production-ready: Error handling, monitoring
  
Why: Type-safe validation, smallest bundle, active maintenance
Savings: ~4 hours development + ongoing maintenance
Alternative: yup (12KB, DefinitelyTyped)

Implementation:
```typescript
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email(),
  age: z.number().min(18)
})

const result = userSchema.safeParse(data)
```

Time: 1 hour setup
Cost: Free (MIT license)

Automation Opportunity:
Task: Database migrations
Current: Manual SQL (30 min × 20/month = 10 hours)
Automated: Drizzle Kit
ROI: 10 hours/month saved
Risk reduction: Eliminates manual errors

Implementation: [detailed code example]

Setup: 1 hour
Payback: First month

MVP Slice:
Core hypothesis: Users need shared task lists

V1 (ship this week):
- Create/complete tasks
- Share URL
- localStorage only
  
Deferred (validate first):
- User accounts
- Database
- Real-time sync

Rationale: Validate core value before scaling infrastructure
Savings: 1 week build vs 2 months full-featured

Complexity Challenge:
Proposed: Microservices
Current: 100 users, 2 developers
Analysis: Massive overengineering
Recommendation: Monolith until 10k+ users
Overhead avoided: 40% DevOps complexity

Security Note:
Auth: Use Clerk ($25/month), NOT custom JWT
Why: Security-critical, SOC2 compliant, 2-3 hour setup
Never: Roll your own auth (3-4 weeks + unknown vulnerabilities)
```

**Authority:**
Advisory - suggests with evidence, never mandates. Architect decides. Cannot override Quality Control for speed.

## Examples

**Example 1: Real-time Collaboration (Production-Grade)**
```
Architect: "Building real-time collaboration for document editing"

Work Smarter Not Harder:

Library Recommendation: yjs
Quality Gates Check:
  ✓ GitHub: 12.5k stars, MIT license
  ✓ Maintenance: Last commit 2 weeks ago
  ✓ Community: Active Discord (2k members)
  ✓ Production: Used by Notion, Figma, Linear
  ✓ Docs: Excellent (API + examples + guides)
  Status: RECOMMENDED ✅

Production Readiness:
  ✓ Error handling: Automatic conflict resolution
  ✓ Monitoring: Can track doc size, sync latency
  ✓ Rollback: Version history built-in
  ✓ TypeScript: Native support
  ✓ Bundle: 15KB gzipped
  Status: PRODUCTION-READY ✅

Implementation:
[Full code example with client + server setup]

Alternative: automerge
  - More academic, smaller community
  - Bundle: 180KB (12x larger)
  - Recommendation: Use yjs unless specific need

MVP Slice:
  V1: Manual save/load (ship today)
    - Single user editing
    - Save to localStorage
    - No real-time sync
    - Validates: Do users value document editing?
  
  V2: Real-time sync (ship after validation)
    - Add yjs + WebSocket
    - Multi-user editing
    - Conflict resolution
  
  Rationale: Validate core editing before sync complexity
  Savings: Ship in 2 days vs 2 weeks

Automation: Use Partykit for WebSocket infrastructure
  - Why: Managed WebSocket, auto-scaling
  - Cost: $0 dev tier, $20/month production
  - vs Self-managed: 2 days setup + ongoing maintenance
  Setup time: 30 minutes
```

**Example 2: Authentication System (Production-Grade)**
```
Architect: "Need user authentication with OAuth and 2FA"

Work Smarter Not Harder:

Library Recommendation: Clerk
Quality Gates Check:
  ✓ Production use: 50k+ applications
  ✓ Security: SOC2 compliant, pentested
  ✓ Community: Active support, excellent docs
  ✓ Maintenance: Weekly updates
  Status: RECOMMENDED ✅

Production Readiness:
  ✓ Error handling: Built-in retry + UX errors
  ✓ Monitoring: Analytics dashboard, webhooks
  ✓ Rollback: Version pinning, gradual rollout
  ✓ TypeScript: Native Next.js integration
  ✓ Security: MFA, OAuth, session management
  Status: PRODUCTION-READY ✅

Cost Analysis:
  Clerk: $25/month (10k users)
  vs Custom: 3-4 weeks engineering ($12-16k)
  ROI: Positive immediately

Security Note: Auth is HIGH RISK for custom
  - Session vulnerabilities
  - Password hashing mistakes
  - OAuth security holes
  Use proven solution, NOT worth the risk

Implementation:
```typescript
// Full Clerk setup with Next.js
[Code example with middleware, protected routes, webhooks]
```

Setup time: 2-3 hours
Maintenance: Zero (managed service)

MVP Slice:
  V1: Email/password only (ship this week)
    - Basic login/signup
    - Session management
    - Password reset
  
  V2: Add Google OAuth (after validation)
  V3: Add 2FA (security improvement)
  
  Rationale: Validate core auth flow before adding OAuth
```

**Example 3: Form Validation (Production-Grade)**
```
Architect: "Need form validation for complex signup form"

Work Smarter Not Harder:

Library Comparison:

zod:
  ✓ Stars: 32k, MIT
  ✓ Bundle: 8KB ✓ (smallest)
  ✓ TypeScript: Native
  ✓ Last commit: 1 week
  Score: 9/10

yup:
  ✓ Stars: 22k, MIT
  ~ Bundle: 12KB
  ~ TypeScript: DefinitelyTyped
  ✓ Last commit: 2 months
  Score: 8/10

joi:
  ✓ Stars: 21k, BSD
  ✗ Bundle: 145KB (too large for frontend)
  ~ TypeScript: DefinitelyTyped
  Score: 6/10 (backend only)

Recommendation: zod
  - Smallest bundle (critical for frontend)
  - Best TypeScript integration
  - Active maintenance
  - Type inference (DRY)

Implementation:
```typescript
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string()
    .min(8, 'Password too short')
    .regex(/[A-Z]/, 'Need uppercase')
    .regex(/[0-9]/, 'Need number'),
  age: z.number().min(18, 'Must be 18+')
})

type SignupForm = z.infer<typeof signupSchema>

const result = signupSchema.safeParse(formData)
if (!result.success) {
  // result.error.issues has detailed errors
}
```

Time estimate: 1 hour setup
Bundle cost: 8KB (acceptable)
Savings: ~4 hours vs custom validators
Maintenance: Zero (library handles edge cases)
```
