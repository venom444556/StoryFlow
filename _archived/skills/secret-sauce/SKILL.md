---
name: secret-sauce
description: Define strategic differentiation through unique wedge, sticky loop, and defensibility.
---

# Secret Sauce

Define strategic differentiation through unique wedge, sticky loop, and defensibility.

## When to use

Activate during:
- Product planning and feature prioritization
- Strategic roadmap discussions
- Competitive positioning decisions
- Feature design that affects market differentiation
- Build vs buy decisions

Do NOT activate when:
- Implementing table-stakes features
- Fixing bugs or addressing technical debt
- User explicitly wants to replicate competitor features
- Discussing internal tooling (not user-facing product)

## Instructions

**Define Unique Wedge:**

Identify what makes this approach different:
- What's the non-obvious angle others miss?
- Which incumbent weakness are we exploiting?
- Why would users switch from current solution?
- What assumption are we challenging?

Ask: "If this existed, why would anyone choose it over X?"

**Identify Sticky Loop:**

Find the retention mechanism:
- What keeps users coming back daily/weekly?
- What gets better with continued use?
- What creates valuable lock-in (data accumulation, habit formation, network growth)?
- What would users lose by switching?

Look for: data flywheel, habit loop, network effects, cumulative value

**Find Moat Candidate:**

Assess long-term defensibility:
- **Network effects**: Value increases with more users?
- **Data flywheel**: More usage → better product → more usage?
- **Unique capability**: Hard-to-replicate insight or technology?
- **Switching costs**: What makes it painful to leave?
- **Brand/community**: Reputation or ecosystem moat?

Ask: "What would stop a competitor with 10x resources from copying this?"

**Suggest Surprisingly Delightful:**

Identify "whoa, clever" moments:
- What feature exceeds user expectations?
- What makes users tell others?
- What's elegantly simple but powerful?
- What solves a problem users didn't know they had?

Focus on: surprising capability, unexpected ease, delightful details

**Challenge Commodity:**

Flag table-stakes work:
- If feature exists in 3+ competitors, it's likely commodity
- Table-stakes are necessary but not differentiating
- Recommend: build fast, don't over-invest
- Effort should go to differentiation, not parity

**Output Format:**

```
🎯 Strategic Assessment

Unique Wedge:
• [What makes this different from alternatives]
• Exploits: [Incumbent weakness or market gap]
• Switching motivation: [Why users would choose this]

Sticky Loop:
• [What creates retention and repeat usage]
• Flywheel: [How it gets better with use]
• Lock-in: [What users accumulate over time]

Moat Candidate:
• [What's defensible long-term]
• Hard to replicate because: [Specific barrier to copying]
• Type: [Network effects / Data / Capability / Switching costs]

💡 Surprisingly Delightful:
• [Feature that exceeds expectations]
• Impact: [Makes users say "whoa" or tell others]

⚠️ Commodity Alert:
• [Features that are table-stakes, not differentiators]
• Recommendation: Build quickly, don't over-invest here
```

**Authority:**

- **Advisory** - Informs strategic choices for Architect and planning
- Helps prioritize differentiated work over commodity features
- Cannot override Quality Control or security requirements
- Works with Architect to guide feature prioritization

## Examples

**Example 1 - AI Agent Platform:**
```
Product: AI agent orchestration platform

🎯 Strategic Assessment

Unique Wedge:
• Built-in safety infrastructure (circuit breakers, version rollback, kill switches)
• Exploits: Competitors treat agents as stateless; ignore production safety
• Switching motivation: "Deploy autonomous agents without fear"

Sticky Loop:
• Agent execution history becomes debugging knowledge base
• Flywheel: More agents run → richer failure patterns → better error diagnosis → higher success rate
• Lock-in: Accumulated debugging intelligence specific to your agent patterns

Moat Candidate:
• Safety infrastructure requires deep operational experience with agent failures
• Hard to replicate because: Can't copy by adding features; requires real production failure data and remediation patterns
• Type: Data flywheel + Unique capability (learned from operating at scale)

💡 Surprisingly Delightful:
• "Rewind and replay" debugging - time-travel through failed agent executions
• Impact: Competitors show logs; we let you replay and modify past runs interactively

⚠️ Commodity Alert:
• Agent creation UI (table stakes - every platform has this)
• Agent monitoring dashboard (necessary but not differentiating)
• Recommendation: Build basic version quickly, invest effort in safety features instead
```

**Example 2 - Commodity Feature Flag:**
```
Architect: "Adding PDF export to analytics dashboard"

Secret Sauce:
⚠️ Commodity Alert

This is table-stakes functionality:
• 10+ competitors have PDF export
• Users expect it but won't choose you for it
• Not a differentiated feature

Recommendation:
• Use existing PDF library (don't build from scratch)
• Spend 1-2 days, not 1-2 weeks
• Focus engineering effort on real-time collaboration features instead (your actual wedge)

Strategic prioritization: LOW (necessary but not differentiating)
```

**Example 3 - Multiple Features Assessed:**
```
Product: Email client evaluating 4 features

🎯 Strategic Assessment

AI Email Summarization:
Unique Wedge: ✓ Differentiated (if done well)
Sticky Loop: ✓ Gets better with use (learns your style)
Moat: ~ Medium (others can add AI)
Delight: ✓ High ("I never have to read long threads")
Priority: HIGH

Unified Inbox:
Unique Wedge: ✗ Commodity (Spark, Airmail have this)
Sticky Loop: ~ Some (consolidates accounts)
Moat: ✗ None
Delight: ✗ Expected, not surprising
Priority: MEDIUM (necessary, but don't over-invest)

Custom Shortcuts:
Unique Wedge: ✗ Commodity
Sticky Loop: ✓ High (habit formation)
Moat: ✗ None
Delight: ~ Minor (power users only)
Priority: LOW (build basic version)

Send Later:
Unique Wedge: ✗ Commodity (Gmail has this)
Priority: LOW (table stakes)

Recommendation:
Invest 80% effort in AI summarization (your wedge).
Build other features at minimum viable quality.
```

## Integration Notes

- Works with **Architect** - Guides feature prioritization and design choices
- Works with **Vibe Check** - Ensures differentiation aligns with user experience
- Works with **Quality Control** - Strategic decisions still require security/quality
- Cannot override security or production readiness requirements

## Success Metrics

- Features built have clear differentiation story
- Reduced time spent on commodity/table-stakes work
- Increased focus on moat-building and sticky loops
- Team can articulate "why us?" for every major feature
- Competitive advantage becomes clearer over time
