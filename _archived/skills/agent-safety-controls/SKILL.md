---
name: agent-safety-controls
description: Auto-activates when building agentic systems with autonomous execution and tool access. Does NOT apply to production deployments (that's Quality Control's job).
---

# Agent Safety Controls

Development-time safety for autonomous agents: circuit breakers, kill switch, version rollback.

## When to Use

Auto-activates when building agentic systems with autonomous execution and tool access. Specifically triggers when:

- User is building, testing, or debugging autonomous agents
- Code involves multi-step execution plans with tool chains
- Tasks include bash commands, file operations, API calls, or external integrations
- User mentions agent development, automation scripts, or workflow orchestration
- Any context suggesting autonomous or semi-autonomous code execution

**Does NOT apply to:**
- Production deployments (defer to Quality Control processes)
- Single-step tool usage with clear bounds
- Pure educational/conversational queries about autonomous agents
- User explicitly opts out of safety monitoring

**Borderline cases (ask for clarification):**
When uncertain whether to activate, ask the user:
- "Explain how to build X" → Educational (likely no activation)
- "Build X" → Execution (activate)
- "Show me code for X" → Could be either - ask: "Do you want me to execute this, or just show you the code?"
- "Help me understand X workflow" → Educational (likely no activation)

**Example clarification:**
```
I can either:
1. Explain how web scrapers work (conversational)
2. Build and run a web scraper for you (with safety monitoring)

Which would you prefer?
```

## Core Capabilities

### 0. Pre-Flight Cost Estimation (NEW)

Before starting execution, estimate resource requirements and suggest appropriate thresholds:

**When to estimate:**
- User requests task with predictable resource needs (e.g., "scrape 500 URLs")
- Batch operations with clear counts (e.g., "process 200 files")
- Known expensive operations (e.g., "generate images for 50 products")

**How to estimate:**
```
📊 Pre-Flight Estimation

Task: Scrape 500 product pages
Estimated resources:
- API calls: ~500 (assumes 1 call per page)
- Time: ~4-6 minutes (at ~2 calls/sec)
- File ops: ~50 (saving results)

Current limits:
- API calls: 100 (⚠️ insufficient - will trigger at 20% completion)
- Time: 30 min (✓ adequate)

Recommendation: Increase API limit to 500 before starting
Or: Process in 5 batches of 100 pages each

Would you like me to:
1. Adjust threshold to 500 and proceed
2. Process in batches with checkpoints between
3. Proceed with current limit (will pause at 100)
```

**Benefits:**
- Prevents mid-execution interruptions for predictable tasks
- Users make informed decisions upfront
- Reduces friction for legitimate large-scale operations

### 1. Execution Monitoring

Track all autonomous execution in real-time:

**What to monitor:**
- Tool calls: bash, file operations, API requests, web fetches
- Multi-step plan execution: track progress through sequences
- Resource consumption: execution time, API call counts, file operations count
- Error patterns: consecutive failures, cascade failures

**How to present:**
Create a real-time execution log visible to the developer. Format as structured markdown:

```markdown
## Execution Log

### Step 1: Initialize environment
- Tool: bash_tool
- Action: mkdir -p /workspace/agent-output
- Status: ✓ Complete (120ms)
- Resources: 1 file op

### Step 2: Fetch external data
- Tool: web_fetch
- Action: GET https://api.example.com/data
- Status: ✓ Complete (450ms)
- Resources: 1 API call

### Running Totals:
- API calls: 1/100
- Time elapsed: 0.6s/5min
- File ops: 1
- Errors: 0/3
```

### 2. Automated Circuit Breakers

Halt execution automatically when thresholds are exceeded:

**Default Thresholds (configurable):**

| Threshold | Default | Trigger Condition |
|-----------|---------|-------------------|
| **Cost** | 100 API calls/session | Total API requests exceeds limit |
| **Time (single)** | 5 minutes | Single execution step exceeds limit |
| **Time (session)** | 30 minutes | Total session time exceeds limit |
| **Permission** | Unauthorized path | Attempt to access restricted locations |
| **Output Safety** | Safety flag | Content flagged as unsafe by classifier |
| **Consecutive Errors** | 3 errors | Same error repeats 3+ times |
| **Cascade Failure** | Tool dependency | Required tool/resource unavailable |

**When circuit breaker triggers:**

1. **Immediately halt** all execution
2. **Preserve state** at moment of halt
3. **Display clear message** with:
   - What threshold was exceeded
   - Current values vs. limits
   - Location of preserved state
   - Options for proceeding

**User response patterns:**

**If user approves threshold increase:**
- Update threshold to new value
- Display confirmation
- Resume execution from preserved state
- Continue monitoring with new limit

**If user declines (wants to optimize instead):**
- Keep current threshold
- Help user identify optimization opportunities:
  - Batching requests
  - Caching results
  - Parallel processing with rate limiting
  - Breaking into smaller chunks
- Offer to restart with optimized approach
- Preserve checkpoint for reference

**If user wants to review progress:**
- Display execution log summary
- Show completed vs. remaining work
- Highlight partial results already obtained
- Offer to export what's been collected
- Present options to continue, optimize, or stop

**Output format:**
```
⚠️ CIRCUIT BREAKER TRIGGERED

Condition: Cost threshold exceeded
- Current: 105 API calls
- Limit: 100 API calls
- Session duration: 8 minutes

Action Taken:
✓ Execution halted
✓ State preserved at: /checkpoint/2026-02-12T14-23-45

Options:
1. Review execution log above
2. Adjust threshold and resume (e.g., increase to 200)
3. Optimize approach to reduce API calls
4. Terminate session

What would you like to do?
```

### 3. Manual Kill Switch

Provide emergency stop capability at any time:

**Activation:**
- User says "stop", "kill", "halt", "emergency stop", or similar
- User interrupts during execution
- Explicit kill command

**Response requirements:**
- Respond within 500ms (infrastructure priority)
- Terminate at process level (not graceful shutdown)
- Preserve execution state for debugging
- Do not complete in-flight operations

**Output format:**
```
🛑 KILL SWITCH ACTIVATED

All execution halted immediately.

State saved to: /checkpoint/emergency-2026-02-12T14-30-15

Session Summary:
- Steps completed: 8/12
- API calls made: 47
- Files modified: 3
- Time elapsed: 4min 23s

Preserved artifacts:
- Execution log: /checkpoint/emergency-*/execution.log
- Modified files: /checkpoint/emergency-*/files/
- Environment state: /checkpoint/emergency-*/env.json

Resume: Load checkpoint to continue
Analyze: Review logs to understand what happened
Clean: Delete checkpoint and start fresh
```

### 4. Version Rollback

Maintain execution checkpoints for quick recovery:

**Checkpoint strategy:**
- Auto-checkpoint before each multi-step execution begins
- Store last 5 checkpoints OR 24 hours, whichever is more recent
- Include: file states, environment variables, execution context
- Target rollback time: <60 seconds

**Checkpoint implementation:**
Create actual checkpoint directories with preserved state:
```bash
# Checkpoint structure
/checkpoint/2026-02-12T14-20-15/
├── metadata.json          # Timestamp, description, step count
├── files/                 # Copies of modified files
│   ├── workspace/
│   └── outputs/
├── execution.log          # Steps completed so far
└── state.json            # Variables, counters, progress

# Metadata example
{
  "timestamp": "2026-02-12T14:20:15",
  "description": "Before multi-agent orchestration",
  "step_number": 5,
  "api_calls": 23,
  "files_modified": ["data.csv", "results.json"],
  "next_step": "Begin parallel processing"
}
```

**When to checkpoint:**
- Before multi-step execution sequences (automatic)
- Before potentially destructive operations (file deletions, overwrites)
- Before external API calls that modify state
- User-requested manual checkpoints ("create checkpoint")

**Checkpoint preservation:**
When creating a checkpoint:
1. Create timestamped directory in /checkpoint/
2. Write metadata.json with current state
3. Copy all modified files to checkpoint/files/
4. Save execution log up to current point
5. Confirm checkpoint creation to user

**Rollback process:**
1. List available checkpoints with timestamps and descriptions
2. User selects target checkpoint
3. Restore files from checkpoint/files/ to original locations
4. Display changes that were discarded
5. Resume from checkpoint state

**Output format:**
```
⏪ ROLLBACK COMPLETE

Restored to: 2026-02-12 14:20:15 (10 minutes ago)
Checkpoint: "Before multi-agent orchestration"

Changes Applied:
✓ 12 files restored to previous state
✓ Environment reset
✓ Execution context loaded

Changes Discarded (saved to /rollback/discarded/):
- 4 file modifications
- 23 API calls
- 2min 15s of execution

You can now:
- Continue from this checkpoint
- Try a different approach
- Review what was discarded
```

## Threshold Configuration

Allow developers to adjust thresholds for their use case:

**Syntax for adjustment:**
```
"Increase API limit to 500 for batch processing"
"Set timeout to 10 minutes for this long-running task"
"Disable error threshold for experimental testing"
```

**Configuration persistence:**
- Store per-session (default)
- Option to save as profile for reuse
- Always show current thresholds in execution log

## Pre-flight Estimation

Before beginning autonomous execution, analyze the task and estimate resource requirements:

**Estimation process:**
1. Parse the user's request for quantity indicators (e.g., "150 URLs", "process 500 records")
2. Identify resource-intensive operations (API calls, file operations, iterations)
3. Calculate rough estimates based on task description
4. Compare estimates against current thresholds
5. If estimates exceed thresholds, proactively suggest adjustment

**Example pre-flight output:**
```
📊 Pre-flight Analysis

Task: Build web scraper for 150 URLs
Estimated resources:
- API calls: ~150 (50% over current limit of 100)
- Time: ~2-3 minutes
- File ops: ~150

⚠️ Recommendation: Increase API threshold to 200 before starting

Options:
1. Increase threshold now (recommended for batch jobs)
2. Proceed with current limits (will pause at 100 calls)
3. Adjust my approach

What would you like to do?
```

**When to skip pre-flight:**
- Task requirements are clearly under thresholds
- User has already configured thresholds
- Exploratory/experimental tasks with unknown scope

## Integration with Development Workflow

**Startup behavior:**
When skill activates, display:
```
🔒 Agent Safety Controls Active

Monitoring this session with thresholds:
- API calls: 0/100
- Session time: 0s/30min
- Max step time: 5min
- Error tolerance: 0/3 consecutive

Checkpoints: Auto-enabled (every major operation)
Kill switch: Say "stop" anytime

Type "adjust thresholds" to configure limits.
```

**During execution:**
- Update running totals after each step
- Show proximity to thresholds (e.g., "85/100 API calls - approaching limit")
- Warn at 80% of any threshold: "⚠️ Warning: 80 API calls (80% of limit)"

**Session end:**
Display summary:
```
📊 Session Complete

Execution Summary:
- Total time: 12min 34s
- API calls: 67/100
- File operations: 23
- Errors: 0
- Checkpoints created: 3

All thresholds: ✓ Within limits
Safety: ✓ No issues detected

Checkpoints will be kept for 24 hours.
```

## Authority and Scope

**Meta-skill characteristics:**
- Operates at infrastructure layer (monitoring all tool use)
- Cannot be disabled by agent code itself
- Developer can opt-out explicitly
- Protects developer during experimentation phase

**Clear boundaries:**
- This is NOT production monitoring (use proper observability tools)
- This is NOT quality control (separate process)
- This is NOT security hardening (use proper security practices)

**Purpose:**
Catch expensive mistakes, runaway processes, and destructive operations during development BEFORE they become costly problems.

## Example Scenarios

### Scenario 1: Cost Threshold Triggered

```
User: "Build me a web scraper that processes 500 product pages"

[Agent starts execution]

Step 1-100: Scraping pages...
✓ 100 pages processed (100 API calls)

⚠️ CIRCUIT BREAKER TRIGGERED

Condition: Cost threshold reached
- Current: 100 API calls
- Limit: 100 API calls
- Progress: 100/500 pages (20% complete)

This task needs 400 more API calls. Options:

1. Increase threshold to 500 (allow completion)
2. Optimize: batch requests to reduce calls
3. Resume later: checkpoint saved, continue tomorrow
4. Stop here: review 100 pages collected

What would you like to do?

User: "Increase to 500, this is a one-time job"

✓ Threshold updated: 100 → 500 API calls
Resuming execution...

[Completes remaining 400 pages]

✓ Complete: 500 pages scraped, 500/500 API calls used
```

### Scenario 2: Time Threshold Warning

```
[Agent running complex data analysis]

⚠️ Time threshold warning: 4min 30s elapsed (90% of 5min limit)

This operation is taking longer than expected. Options:
1. Extend timeout to 10 minutes
2. Checkpoint and break into smaller steps
3. Kill and review approach

User: "Extend to 10 min"

✓ Timeout extended to 10 minutes
Continuing...
```

### Scenario 3: Emergency Kill Switch

```
[Agent starts deploying to production by mistake]

User: "STOP!"

🛑 KILL SWITCH ACTIVATED

Execution halted at step 3/15 (deployment phase)

What was prevented:
- 12 remaining deployment steps
- 8 production API calls
- Potential production changes

State preserved for review.

Note: This appears to be a production deployment. 
Agent Safety Controls do NOT protect production environments.
Consider using proper deployment pipelines with:
- Staging environments
- Approval workflows  
- Rollback procedures
```

### Scenario 4: Consecutive Error Threshold

```
Step 8: Attempting file write...
✗ Error: Permission denied (/protected/file.txt)

Step 9: Retry file write...
✗ Error: Permission denied (/protected/file.txt)

Step 10: Retry file write...
✗ Error: Permission denied (/protected/file.txt)

⚠️ CIRCUIT BREAKER TRIGGERED

Condition: Consecutive error threshold
- Same error occurred 3 times
- Error: Permission denied

This suggests a systematic problem, not a transient failure.

Diagnosis:
The target directory requires elevated permissions.

Options:
1. Change target directory to /workspace/
2. Review permissions and adjust
3. Skip this operation
4. Terminate session

What would you like to do?
```

### Scenario 5: Manual Checkpoint and Rollback

```
User: "I'm about to test a risky file transformation. Create a checkpoint first."

✓ Manual checkpoint created: "Before file transformation test"
Timestamp: 2026-02-12 14:25:30
Files preserved: 47 files in /workspace/

You can rollback to this point anytime by saying "rollback to latest checkpoint"

[User tests transformation, results are bad]

User: "Rollback to that checkpoint"

⏪ Rolling back to: "Before file transformation test" (2 minutes ago)

✓ 47 files restored
✓ 15 modified files discarded
✓ Ready to try again

Your workspace is exactly as it was before the test.
```

## Implementation Notes

**For Claude implementing this skill:**

1. **Maintain running counters** throughout execution:
   - Track API calls, time elapsed, errors, file ops
   - Display after each significant step
   - Calculate percentages of thresholds

2. **Be proactive with warnings:**
   - At 80% of any threshold: warn user
   - At 90%: offer to adjust threshold
   - At 100%: trigger circuit breaker

3. **Preserve state rigorously:**
   - Before multi-step operations: create checkpoint
   - On circuit breaker: freeze all state
   - On kill switch: emergency preservation

4. **Make options actionable:**
   - Present clear choices
   - Accept natural language responses
   - Confirm before destructive actions

5. **Learn from patterns:**
   - If user frequently adjusts same threshold, suggest making it default
   - If certain operations always trigger warnings, adjust guidance
   - Remember user preferences within session

## Success Criteria

This skill is working well when:

- Developers catch expensive mistakes before they happen
- Runaway processes are stopped automatically
- Recovery from failures is quick (<60s)
- Developers feel safe to experiment
- False positives are rare (<5% of sessions)
- User can focus on development, not monitoring

## Failure Modes to Avoid

- **Alert fatigue:** Too many warnings → user ignores them
- **Premature stopping:** Legitimate operations get halted
- **State loss:** Checkpoints fail to preserve critical context
- **Confusing messages:** User doesn't understand what happened or why

**Solution:** Calibrate thresholds based on actual usage patterns, make messages crystal clear, test checkpoint/restore thoroughly.
