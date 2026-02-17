# /storyflow:sync

Check StoryFlow connectivity and sync status.

## Instructions

1. Call the `storyflow_check_connection` MCP tool
2. Display the result:

### If connected:
```
✓ StoryFlow is reachable at <url>
  Projects: <count>
```

### If not connected:
```
✗ Cannot reach StoryFlow at <url>
  Error: <error message>

  Make sure StoryFlow is running: cd <storyflow-dir> && npm run dev:full
  Or reconfigure: /storyflow:setup
```

### If not configured:
```
✗ StoryFlow is not configured.
  Run /storyflow:setup to set your StoryFlow URL.
```
