/**
 * Custom Field Types and Utilities
 */

export const FIELD_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  SELECT: 'select',
  MULTISELECT: 'multiselect',
  DATE: 'date',
  CHECKBOX: 'checkbox',
  URL: 'url',
  EMAIL: 'email',
}

export const FIELD_TYPE_CONFIG = {
  [FIELD_TYPES.TEXT]: {
    label: 'Text',
    icon: 'Type',
    description: 'Single line text input',
    hasOptions: false,
    defaultValue: '',
  },
  [FIELD_TYPES.NUMBER]: {
    label: 'Number',
    icon: 'Hash',
    description: 'Numeric value',
    hasOptions: false,
    defaultValue: null,
  },
  [FIELD_TYPES.SELECT]: {
    label: 'Select',
    icon: 'ChevronDown',
    description: 'Single choice from options',
    hasOptions: true,
    defaultValue: null,
  },
  [FIELD_TYPES.MULTISELECT]: {
    label: 'Multi-select',
    icon: 'CheckSquare',
    description: 'Multiple choices from options',
    hasOptions: true,
    defaultValue: [],
  },
  [FIELD_TYPES.DATE]: {
    label: 'Date',
    icon: 'Calendar',
    description: 'Date picker',
    hasOptions: false,
    defaultValue: null,
  },
  [FIELD_TYPES.CHECKBOX]: {
    label: 'Checkbox',
    icon: 'CheckCircle',
    description: 'True/false toggle',
    hasOptions: false,
    defaultValue: false,
  },
  [FIELD_TYPES.URL]: {
    label: 'URL',
    icon: 'Link',
    description: 'Web link',
    hasOptions: false,
    defaultValue: '',
  },
  [FIELD_TYPES.EMAIL]: {
    label: 'Email',
    icon: 'Mail',
    description: 'Email address',
    hasOptions: false,
    defaultValue: '',
  },
}

/**
 * Entity types that support custom fields
 */
export const ENTITY_TYPES = {
  ISSUE: 'issue',
  PAGE: 'page',
  DECISION: 'decision',
}

/**
 * Create a new custom field definition
 */
export function createFieldDefinition(name, type, options = {}) {
  return {
    id: `field-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name,
    type,
    options: FIELD_TYPE_CONFIG[type]?.hasOptions ? options.choices || [] : undefined,
    required: options.required || false,
    description: options.description || '',
    placeholder: options.placeholder || '',
    createdAt: new Date().toISOString(),
  }
}

/**
 * Get default value for a field type
 */
export function getDefaultValue(fieldType) {
  return FIELD_TYPE_CONFIG[fieldType]?.defaultValue ?? null
}

/**
 * Validate a field value against its type
 */
export function validateFieldValue(value, fieldType, options = {}) {
  const config = FIELD_TYPE_CONFIG[fieldType]
  if (!config) return { valid: false, error: 'Unknown field type' }

  // Check required
  if (options.required && (value === null || value === undefined || value === '')) {
    return { valid: false, error: 'This field is required' }
  }

  // Allow empty non-required values
  if (value === null || value === undefined || value === '') {
    return { valid: true }
  }

  switch (fieldType) {
    case FIELD_TYPES.TEXT:
    case FIELD_TYPES.URL:
    case FIELD_TYPES.EMAIL:
      if (typeof value !== 'string') {
        return { valid: false, error: 'Must be text' }
      }
      if (fieldType === FIELD_TYPES.EMAIL && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return { valid: false, error: 'Invalid email format' }
      }
      if (fieldType === FIELD_TYPES.URL && value && !/^https?:\/\/.+/.test(value)) {
        return { valid: false, error: 'Must be a valid URL (http:// or https://)' }
      }
      return { valid: true }

    case FIELD_TYPES.NUMBER:
      if (typeof value !== 'number' || isNaN(value)) {
        return { valid: false, error: 'Must be a number' }
      }
      return { valid: true }

    case FIELD_TYPES.SELECT:
      if (options.choices && !options.choices.includes(value)) {
        return { valid: false, error: 'Invalid selection' }
      }
      return { valid: true }

    case FIELD_TYPES.MULTISELECT:
      if (!Array.isArray(value)) {
        return { valid: false, error: 'Must be an array' }
      }
      if (options.choices) {
        const invalid = value.find((v) => !options.choices.includes(v))
        if (invalid) {
          return { valid: false, error: `Invalid option: ${invalid}` }
        }
      }
      return { valid: true }

    case FIELD_TYPES.DATE:
      if (typeof value !== 'string' || isNaN(Date.parse(value))) {
        return { valid: false, error: 'Invalid date' }
      }
      return { valid: true }

    case FIELD_TYPES.CHECKBOX:
      if (typeof value !== 'boolean') {
        return { valid: false, error: 'Must be true or false' }
      }
      return { valid: true }

    default:
      return { valid: true }
  }
}
