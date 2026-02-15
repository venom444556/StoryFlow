/**
 * Custom Fields System
 *
 * A flexible system for defining and using custom fields on entities
 * like issues, pages, and decisions.
 */

// Field type definitions and utilities
export {
  FIELD_TYPES,
  FIELD_TYPE_CONFIG,
  ENTITY_TYPES,
  createFieldDefinition,
  getDefaultValue,
  validateFieldValue,
} from './fieldTypes'

// UI Components
export { default as CustomFieldRenderer, CustomFieldGroup } from './CustomFieldRenderer'
export { default as CustomFieldEditor } from './CustomFieldEditor'
export { default as CustomFieldFilter, applyCustomFieldFilters } from './CustomFieldFilter'
