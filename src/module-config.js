export const DEFAULT_CONFIG = {
  moduleName: 'ERP Base',
  labels: {
    entity: 'Entidad',
    entities: 'Entidades',
    document: 'Documento',
    documents: 'Documentos'
  },
  customFields: [],
  statusLifecycle: null,
  theme: { accentColor: null }
};

export const BASE_FIELDS = {
  entity: ['id', 'entity_id', 'name', 'code', 'taxId', 'email', 'phone', 'address', 'category', 'description', 'targetDate', 'creditLimit', 'paymentTerms', 'createdAt', 'updatedAt'],
  document: ['id', 'entity_id', 'series', 'folio', 'startDate', 'endDate', 'quantity', 'subtotal', 'discount', 'taxAmount', 'totalAmount', 'currency', 'paymentTerms', 'notes', 'status', 'createdAt', 'updatedAt']
};

export const FIELD_TYPES = ['text', 'number', 'date', 'select'];

let activeConfig = null;

function isValidCssColor(color) {
  if (typeof color !== 'string') return false;
  if (color.trim() === '') return false;
  // simple checks
  if (/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(color)) return true;
  if (/^rgb\(/i.test(color) || /^rgba\(/i.test(color)) return true;
  if (/^hsl\(/i.test(color) || /^hsla\(/i.test(color)) return true;
  return false;
}

export function normalizeConfig(input) {
  const errors = [];
  if (input === null || input === undefined) {
    return { config: JSON.parse(JSON.stringify(DEFAULT_CONFIG)), errors: [] };
  }
  const cfg = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  if (Object.prototype.hasOwnProperty.call(input, 'moduleName')) {
    if (typeof input.moduleName !== 'string' || input.moduleName.trim() === '') {
      errors.push('El nombre del módulo (moduleName) es obligatorio');
    } else {
      cfg.moduleName = input.moduleName;
    }
  }
  if (input.labels && typeof input.labels === 'object') {
    if (typeof input.labels.entity === 'string') cfg.labels.entity = input.labels.entity;
    if (typeof input.labels.entities === 'string') cfg.labels.entities = input.labels.entities;
    if (typeof input.labels.document === 'string') cfg.labels.document = input.labels.document;
    if (typeof input.labels.documents === 'string') cfg.labels.documents = input.labels.documents;
  }
  // custom fields
  if (Array.isArray(input.customFields)) {
    const seen = { entity: new Set(), document: new Set() };
    for (let i = 0; i < input.customFields.length; i++) {
      const f = input.customFields[i];
      if (!f || typeof f !== 'object') { errors.push(`customFields[${i}] inválido`); continue; }
      if (f.target !== 'entity' && f.target !== 'document') { errors.push(`customFields[${i}].target inválido`); continue; }
      if (typeof f.key !== 'string' || f.key.trim() === '') { errors.push(`customFields[${i}].key inválido`); continue; }
      if (typeof f.label !== 'string' || f.label.trim() === '') { errors.push(`customFields[${i}].label inválido`); continue; }
      if (!FIELD_TYPES.includes(f.type)) { errors.push(`customFields[${i}].type inválido`); continue; }
      if (BASE_FIELDS[f.target] && BASE_FIELDS[f.target].includes(f.key)) { errors.push(`La clave del campo personalizado choca con un campo base: ${f.key}`); continue; }
      if (seen[f.target].has(f.key)) { errors.push(`La clave del campo personalizado '${f.key}' aparece más de una vez para ${f.target}`); continue; }
      if (f.type === 'select') {
        if (!Array.isArray(f.options) || f.options.length === 0) { errors.push(`El campo select '${f.key}' debe definir options`); continue; }
      }
      seen[f.target].add(f.key);
      cfg.customFields.push({
        target: f.target,
        key: f.key,
        label: f.label,
        type: f.type,
        required: !!f.required,
        options: f.type === 'select' ? f.options.slice() : undefined
      });
    }
  }
  // status lifecycle
  if (Object.prototype.hasOwnProperty.call(input, 'statusLifecycle')) {
    if (input.statusLifecycle === null) {
      cfg.statusLifecycle = null;
    } else if (input.statusLifecycle && typeof input.statusLifecycle === 'object') {
      const sl = input.statusLifecycle;
      if (Array.isArray(sl.statuses) && sl.statuses.length > 0 && sl.transitions && typeof sl.transitions === 'object') {
        let valid = true;
        for (const s of sl.statuses) {
          if (typeof s !== 'string') { valid = false; break; }
        }
        if (valid) {
          for (const from of Object.keys(sl.transitions)) {
            if (!sl.statuses.includes(from)) { valid = false; break; }
            const tos = sl.transitions[from];
            if (Array.isArray(tos)) {
              for (const to of tos) {
                if (typeof to !== 'string' || !sl.statuses.includes(to)) { valid = false; break; }
              }
            } else {
              valid = false;
              break;
            }
          }
        }
        if (valid) {
          cfg.statusLifecycle = {
            statuses: sl.statuses.slice(),
            transitions: JSON.parse(JSON.stringify(sl.transitions))
          };
        } else {
          errors.push('statusLifecycle inválido');
        }
      } else {
        errors.push('statusLifecycle inválido');
      }
    } else {
      errors.push('statusLifecycle inválido');
    }
  }
  // theme
  if (Object.prototype.hasOwnProperty.call(input, 'theme')) {
    if (input.theme && typeof input.theme === 'object') {
      if (input.theme.accentColor === undefined || input.theme.accentColor === null) {
        cfg.theme.accentColor = null;
      } else if (isValidCssColor(input.theme.accentColor)) {
        cfg.theme.accentColor = input.theme.accentColor;
      } else {
        errors.push('theme.accentColor inválido');
        cfg.theme.accentColor = null;
      }
    } else {
      errors.push('theme inválido');
      cfg.theme = { accentColor: null };
    }
  }
  return { config: cfg, errors };
}

export function loadModuleConfig() {
  try {
    const mod = require ? null : null;
  } catch (e) {}
  // try to load from module if exists
  try {
    // in browser/vite, try dynamic import pattern not needed; just return defaults
  } catch (e) {}
  return normalizeConfig(null);
}

export function setActiveConfig(cfg) {
  if (cfg === null || cfg === undefined) {
    activeConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    try { if (typeof globalThis !== 'undefined') globalThis.__ERP_CONFIG__ = activeConfig; } catch (e) {}
    if (typeof document !== 'undefined' && activeConfig.theme && activeConfig.theme.accentColor) {
      try {
        document.documentElement.style.setProperty('--accent-color', activeConfig.theme.accentColor);
      } catch (e) {}
    }
    return activeConfig;
  }
  const res = normalizeConfig(cfg);
  activeConfig = res.config;
  try { if (typeof globalThis !== 'undefined') globalThis.__ERP_CONFIG__ = activeConfig; } catch (e) {}
  if (typeof document !== 'undefined' && activeConfig.theme && activeConfig.theme.accentColor) {
    try {
      document.documentElement.style.setProperty('--accent-color', activeConfig.theme.accentColor);
    } catch (e) {}
  }
  return activeConfig;
}

export function getConfig() {
  if (!activeConfig) {
    try {
      if (typeof globalThis !== 'undefined' && globalThis.__ERP_CONFIG__) {
        activeConfig = globalThis.__ERP_CONFIG__;
      }
    } catch (e) {}
  }
  if (!activeConfig) activeConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  try { if (typeof globalThis !== 'undefined') globalThis.__ERP_CONFIG__ = activeConfig; } catch (e) {}
  return activeConfig;
}

export function labelFor(key) {
  const c = getConfig();
  if (key === 'entity') return c.labels.entity;
  if (key === 'entities') return c.labels.entities;
  if (key === 'document') return c.labels.document;
  if (key === 'documents') return c.labels.documents;
  return key;
}
