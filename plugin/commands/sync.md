---
description: Check StoryFlow connectivity and sync status
argument-hint: ""
---

# /storyflow:sync

Check StoryFlow connectivity and sync status.

## Instructions

1. Run `storyflow status` via Bash
2. Display the result:

### If connected:
```
StoryFlow is reachable at <url>
  Projects: <count>
```

### If not connected:
```
Cannot reach StoryFlow at <url>
  Error: <error message>

  Make sure StoryFlow is running: cd <storyflow-dir> && node server/index.js
  Or reconfigure: /storyflow:setup
```

### If not configured:
```
StoryFlow is not configured.
  Run /storyflow:setup to set your StoryFlow URL.
```
