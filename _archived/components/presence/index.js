/**
 * Real-time Presence Components
 *
 * Shows who else is viewing a project using localStorage heartbeats.
 * This is an MVP implementation - for true real-time, a WebSocket
 * backend would be needed.
 */

export {
  default as PresenceIndicator,
  PresenceCount,
  PresenceBanner,
} from './PresenceIndicator'
