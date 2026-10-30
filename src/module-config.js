import { isBlank } from './utils.js';

export const BASE_FIELD_KEYS = [
  'id',
  'entity_id',
  'document_id',
  'name',
  'code',
  'taxId',
  'email',
  'phone',
  'address',
  'category',
  'description',
  'targetDate',
  'creditLimit',
  'paymentTerms',
  'series',
  'folio',
  'startDate',
  'endDate',
  'quantity',
  'subtotal',
  'discount',
  'taxAmount',
  'totalAmount',
  'currency',
  'notes',
  'status',
  'customFields',
  'createdAt',
  'updatedAt'
];

export const ALLOWED_FIELD_TYPES = ['text', 'number', 'date', 'select'];
export const LABEL_KEYS = ['entity', 'entities', 'document', 'documents', 'dashboard', 'search'];

export const DEFAULT_CONFIG = Object.freeze({
  moduleName: 'ERP Base',
  labels: Object.freeze({
    entity: 'Entidad',
    entities: 'Entidades',
    document: 'Documento',
    documents: 'Documentos',
    dashboard: 'Panel',
    search: 'Buscar'
  }),
  customFields: Object.freeze([]),
  statusLifecycle: null,
  theme: Object.freeze({ accentColor: null })
});

export const DEFAULT_ACCENT_COLOR = '#0f62fe';

export const userConfig = {
  moduleName: 'ERP Base',
  labels: {
    entity: 'Entidad',
    entities: 'Entidades',
    document: 'Documento',
    documents: 'Documentos',
    dashboard: 'Panel',
    search: 'Buscar'
  },
  customFields: [],
  statusLifecycle: null,
  theme: {
    accentColor: '#0f62fe'
  }
};

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isValidCssColor(value) {
  if (typeof value !== 'string' || value.trim() === '') return false;
  const color = value.trim();
  if (/[;{}]/.test(color)) return false;

  if (typeof document !== 'undefined' && document.createElement) {
    const probe = document.createElement('span');
    probe.style.color = '';
    probe.style.color = color;
    if (probe.style.color) return true;
  }

  return (
    /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color) ||
    /^(?:rgb|rgba|hsl|hsla)\(\s*[0-9.,%\s/+-]+\)$/i.test(color)
  );
}

function normalizeLabels(raw, errors) {
  const labels = { ...DEFAULT_CONFIG.labels };
  if (raw == null) return labels;
  if (!isPlainObject(raw)) {
    errors.push({
      field: 'labels',
      code: 'INVALID_CONFIG',
      message: 'labels debe ser un objeto; se usan las etiquetas por defecto.'
    });
    return labels;
  }
  for (const key of LABEL_KEYS) {
    const value = raw[key];
    if (value == null) continue;
    if (typeof value !== 'string' || isBlank(value)) {
      errors.push({
        field: `labels.${key}`,
        code: 'INVALID_CONFIG',
        message: `La etiqueta "${key}" debe ser un texto no vacío; se usa el valor por defecto.`
      });
      continue;
    }
    labels[key] = value.trim();
  }
  return labels;
}

function normalizeCustomFields(raw, errors) {
  if (raw == null) return [];
  if (!Array.isArray(raw)) {
    errors.push({
      field: 'customFields',
      code: 'INVALID_CONFIG',
      message: 'customFields debe ser una lista; se ignora.'
    });
    return [];
  }

  const result = [];
  const seenKeys = { entity: new Set(), document: new Set() };

  raw.forEach((field, index) => {
    const fieldErrors = [];
    if (!isPlainObject(field)) {
      errors.push({
        field: `customFields[${index}]`,
        code: 'INVALID_CONFIG',
        message: 'Cada campo personalizado debe ser un objeto.'
      });
      return;
    }

    const target = field.target;
    if (target !== 'entity' && target !== 'document') {
      fieldErrors.push({
        field: `customFields[${index}].target`,
        code: 'INVALID_CONFIG',
        message: 'target debe ser "entity" o "document".'
      });
    }

    const key = typeof field.key === 'string' ? field.key.trim() : '';
    if (!key) {
      fieldErrors.push({
        field: `customFields[${index}].key`,
        code: 'REQUIRED',
        message: 'key es obligatorio.'
      });
    } else if (BASE_FIELD_KEYS.includes(key)) {
      fieldErrors.push({
        field: `customFields[${index}].key`,
        code: 'CUSTOM_KEY_CONFLICT',
        message: `La clave "${key}" choca con un campo base.`
      });
    } else if ((target === 'entity' || target === 'document') && seenKeys[target].has(key)) {
      fieldErrors.push({
        field: `customFields[${index}].key`,
        code: 'CUSTOM_KEY_CONFLICT',
        message: `La clave "${key}" ya está declarada para ${target}.`
      });
    }

    const label = typeof field.label === 'string' ? field.label.trim() : '';
    if (!label) {
      fieldErrors.push({
        field: `customFields[${index}].label`,
        code: 'REQUIRED',
        message: 'label es obligatorio.'
      });
    }

    if (!ALLOWED_FIELD_TYPES.includes(field.type)) {
      fieldErrors.push({
        field: `customFields[${index}].type`,
        code: 'INVALID_CUSTOM_FIELD_TYPE',
        message: 'type debe ser text, number, date o select.'
      });
    }

    let options;
    if (field.type === 'select') {
      const rawOptions = Array.isArray(field.options) ? field.options : [];
      options = rawOptions
        .filter((option) => typeof option === 'string' && !isBlank(option))
        .map((option) => option.trim());
      if (options.length === 0) {
        fieldErrors.push({
          field: `customFields[${index}].options`,
          code: 'INVALID_SELECT_OPTIONS',
          message: 'Un campo select debe declarar opciones no vacías.'
        });
      }
    }

    if (fieldErrors.length > 0) {
      errors.push(...fieldErrors);
      return;
    }

    seenKeys[target].add(key);
    result.push({
      target,
      key,
      label,
      type: field.type,
      required: field.required === true,
      ...(options ? { options } : {})
    });
  });

  return result;
}

function normalizeLifecycle(raw, errors) {
  if (raw == null) return null;
  if (!isPlainObject(raw)) {
    errors.push({
      field: 'statusLifecycle',
      code: 'INVALID_CONFIG',
      message: 'statusLifecycle debe ser un objeto; se usa estado de texto libre.'
    });
    return null;
  }

  const rawStatuses = Array.isArray(raw.statuses) ? raw.statuses : [];
  const statuses = rawStatuses
    .filter((status) => typeof status === 'string' && !isBlank(status))
    .map((status) => status.trim());
  const uniqueStatuses = [...new Set(statuses)];

  if (statuses.length === 0 || uniqueStatuses.length !== statuses.length) {
    errors.push({
      field: 'statusLifecycle.statuses',
      code: 'INVALID_CONFIG',
      message: 'statuses debe ser una lista no vacía de estados únicos; se usa estado de texto libre.'
    });
    return null;
  }

  const transitions = {};
  if (raw.transitions != null) {
    if (!isPlainObject(raw.transitions)) {
      errors.push({
        field: 'statusLifecycle.transitions',
        code: 'INVALID_CONFIG',
        message: 'transitions debe ser un objeto; se usa estado de texto libre.'
      });
      return null;
    }

    for (const [from, targets] of Object.entries(raw.transitions)) {
      if (!uniqueStatuses.includes(from)) {
        errors.push({
          field: `statusLifecycle.transitions.${from}`,
          code: 'INVALID_CONFIG',
          message: `El estado de origen "${from}" no está en statuses.`
        });
        return null;
      }
      if (!Array.isArray(targets)) {
        errors.push({
          field: `statusLifecycle.transitions.${from}`,
          code: 'INVALID_CONFIG',
          message: 'Cada transición debe ser una lista de estados destino.'
        });
        return null;
      }
      const cleaned = [...new Set(targets.filter((target) => typeof target === 'string' && !isBlank(target)).map((target) => target.trim()))];
      const unknown = cleaned.find((target) => !uniqueStatuses.includes(target));
      if (unknown) {
        errors.push({
          field: `statusLifecycle.transitions.${from}`,
          code: 'INVALID_CONFIG',
          message: `El estado destino "${unknown}" no está en statuses.`
        });
        return null;
      }
      transitions[from] = cleaned;
    }
  }

  return { statuses: uniqueStatuses, transitions };
}

export function normalizeConfig(raw) {
  const errors = [];
  const source = isPlainObject(raw) ? raw : {};

  if (!isPlainObject(raw)) {
    errors.push({
      field: 'config',
      code: 'INVALID_CONFIG',
      message: 'No se encontró una configuración válida; se usan los valores por defecto.'
    });
  }

  let moduleName = typeof source.moduleName === 'string' ? source.moduleName.trim() : '';
  if (!moduleName) {
    moduleName = DEFAULT_CONFIG.moduleName;
    errors.push({
      field: 'moduleName',
      code: 'REQUIRED',
      message: 'moduleName debe ser un texto no vacío; se usa el valor por defecto.'
    });
  }

  const labels = normalizeLabels(source.labels, errors);
  const customFields = normalizeCustomFields(source.customFields, errors);
  const statusLifecycle = normalizeLifecycle(source.statusLifecycle, errors);

  let accentColor = null;
  if (source.theme != null) {
    if (!isPlainObject(source.theme)) {
      errors.push({
        field: 'theme',
        code: 'INVALID_CONFIG',
        message: 'theme debe ser un objeto; se usa el color por defecto.'
      });
    } else if (source.theme.accentColor != null && source.theme.accentColor !== '') {
      if (isValidCssColor(source.theme.accentColor)) {
        accentColor = source.theme.accentColor.trim();
      } else {
        errors.push({
          field: 'theme.accentColor',
          code: 'INVALID_ACCENT_COLOR',
          message: 'accentColor no es un color CSS válido; se usa el color por defecto.'
        });
      }
    }
  }

  return {
    config: {
      moduleName,
      labels,
      customFields,
      statusLifecycle,
      theme: { accentColor }
    },
    errors
  };
}

export function validateConfig(raw) {
  return normalizeConfig(raw).errors;
}

export function getConfig() {
  return normalizeConfig(userConfig).config;
}

export function getConfigErrors() {
  return normalizeConfig(userConfig).errors;
}
