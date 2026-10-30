const STORE_KEYS = {
  entities: 'erp.entities',
  documents: 'erp.documents',
  schemaVersion: 'erp.schemaVersion'
};

const store = () => (typeof localStorage !== 'undefined' ? localStorage : globalThis.localStorage);

function getActiveConfig() {
  try {
    if (typeof globalThis !== 'undefined' && globalThis.__ERP_CONFIG__) {
      return globalThis.__ERP_CONFIG__;
    }
  } catch (e) {}
  try {
    const mod = typeof require !== 'undefined' ? require('./module-config.js') : null;
    if (mod && mod.getConfig) {
      const c = mod.getConfig();
      try { if (typeof globalThis !== 'undefined') globalThis.__ERP_CONFIG__ = c; } catch(e){}
      return c;
    }
  } catch (e) {}
  return null;
}

function read(key) {
  const s = store();
  if (!s) return null;
  const v = s.getItem(key);
  if (!v) return null;
  try { return JSON.parse(v); } catch (e) { return null; }
}

function write(key, val) {
  const s = store();
  if (!s) return;
  s.setItem(key, JSON.stringify(val));
}

function genId() {
  return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function genEntityId() {
  return 'ent_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  if (email.trim() === '') return true; // optional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidDate(dateStr) {
  if (typeof dateStr !== 'string') return false;
  if (dateStr.trim() === '') return true; // optional
  // YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return false;
  // check components
  const parts = dateStr.split('-');
  if (parseInt(parts[0]) !== d.getFullYear()) return false;
  if (parseInt(parts[1]) - 1 !== d.getMonth()) return false;
  if (parseInt(parts[2]) !== d.getDate()) return false;
  return true;
}

export function validateEntity(entity) {
  const errors = {};
  const e = entity || {};
  if (typeof e.name !== 'string' || e.name.trim() === '') {
    errors.name = 'El nombre es obligatorio';
  }
  if (typeof e.code !== 'string' || e.code.trim() === '') {
    errors.code = 'El código es obligatorio';
  }
  if (e.email !== undefined && e.email !== null && e.email !== '' && !isValidEmail(e.email)) {
    errors.email = 'El correo electrónico no es válido';
  }
  if (e.creditLimit !== undefined && e.creditLimit !== null && e.creditLimit !== '') {
    const n = Number(e.creditLimit);
    if (isNaN(n) || n < 0) {
      errors.creditLimit = 'El límite de crédito debe ser un número no negativo';
    }
  }
  if (e.targetDate !== undefined && e.targetDate !== null && e.targetDate !== '' && !isValidDate(e.targetDate)) {
    errors.targetDate = 'La fecha objetivo no es válida';
  }
  // custom fields
  try {
    const cfg = getActiveConfig ? getActiveConfig() : null;
    if (cfg && Array.isArray(cfg.customFields)) {
      for (const cf of cfg.customFields) {
        if (cf.target === 'entity') {
          if (cf.required) {
            const val = e[cf.key];
            if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
              errors[cf.key] = 'El campo es obligatorio';
              continue;
            }
          }
          if (cf.type === 'number') {
            const val = e[cf.key];
            if (val !== undefined && val !== null && val !== '') {
              const n = Number(val);
              if (isNaN(n)) {
                errors[cf.key] = 'Debe ser un número';
                continue;
              }
            }
          }
          if (cf.type === 'date') {
            const val = e[cf.key];
            if (val !== undefined && val !== null && val !== '' && !isValidDate(val)) {
              errors[cf.key] = 'Fecha inválida';
              continue;
            }
          }
          if (cf.type === 'select') {
            const val = e[cf.key];
            if (val !== undefined && val !== null && val !== '') {
              if (Array.isArray(cf.options) && !cf.options.includes(val)) {
                errors[cf.key] = 'Valor inválido';
                continue;
              }
            }
          }
        }
      }
    }
  } catch (err) {}
  return { valid: Object.keys(errors).length === 0, errors };
}

export function loadEntities() {
  const data = read(STORE_KEYS.entities);
  if (Array.isArray(data)) return data;
  return [];
}

export function saveEntities(entities) {
  write(STORE_KEYS.entities, entities);
}

export function addEntity(entity) {
  const entities = loadEntities();
  const v = validateEntity(entity);
  if (!v.valid) {
    const err = new Error('Validation failed');
    err.errors = v.errors;
    throw err;
  }
  const now = new Date().toISOString();
  const newEntity = {
    id: genId(),
    entity_id: genEntityId(),
    name: typeof entity.name === 'string' ? entity.name.trim() : entity.name,
    code: typeof entity.code === 'string' ? entity.code.trim() : entity.code,
    taxId: entity.taxId !== undefined ? (typeof entity.taxId === 'string' ? entity.taxId.trim() : entity.taxId) : undefined,
    email: entity.email !== undefined ? (typeof entity.email === 'string' ? entity.email.trim() : entity.email) : undefined,
    phone: entity.phone !== undefined ? (typeof entity.phone === 'string' ? entity.phone.trim() : entity.phone) : undefined,
    address: entity.address !== undefined ? (typeof entity.address === 'string' ? entity.address.trim() : entity.address) : undefined,
    category: entity.category !== undefined ? (typeof entity.category === 'string' ? entity.category.trim() : entity.category) : undefined,
    description: entity.description !== undefined ? (typeof entity.description === 'string' ? entity.description.trim() : entity.description) : undefined,
    targetDate: entity.targetDate && typeof entity.targetDate === 'string' && entity.targetDate.trim() !== '' ? entity.targetDate : (entity.targetDate === '' ? undefined : entity.targetDate),
    creditLimit: entity.creditLimit !== undefined && entity.creditLimit !== '' && entity.creditLimit !== null ? Number(entity.creditLimit) : undefined,
    paymentTerms: entity.paymentTerms !== undefined ? (typeof entity.paymentTerms === 'string' ? entity.paymentTerms.trim() : entity.paymentTerms) : undefined,
    createdAt: now,
    updatedAt: now
  };
  // merge custom fields
  try {
    const cfg = getActiveConfig ? getActiveConfig() : null;
    if (cfg && Array.isArray(cfg.customFields)) {
      for (const cf of cfg.customFields) {
        if (cf.target === 'entity') {
          if (Object.prototype.hasOwnProperty.call(entity, cf.key)) {
            newEntity[cf.key] = entity[cf.key];
          }
        }
      }
    }
  } catch (e) {}
  entities.push(newEntity);
  saveEntities(entities);
  return newEntity;
}

export function updateEntity(id, updates) {
  const entities = loadEntities();
  const idx = entities.findIndex(e => e.id === id);
  if (idx === -1) throw new Error('Entity not found');
  const merged = { ...entities[idx], ...updates };
  const v = validateEntity(merged);
  if (!v.valid) {
    const err = new Error('Validation failed');
    err.errors = v.errors;
    throw err;
  }
  const now = new Date().toISOString();
  entities[idx] = {
    ...entities[idx],
    ...updates,
    name: updates.name !== undefined ? (typeof updates.name === 'string' ? updates.name.trim() : updates.name) : entities[idx].name,
    code: updates.code !== undefined ? (typeof updates.code === 'string' ? updates.code.trim() : updates.code) : entities[idx].code,
    updatedAt: now
  };
  if (updates.creditLimit !== undefined && updates.creditLimit !== '' && updates.creditLimit !== null) {
    entities[idx].creditLimit = Number(updates.creditLimit);
  }
  if (updates.email !== undefined && typeof updates.email === 'string') {
    entities[idx].email = updates.email.trim();
  }
  if (updates.targetDate !== undefined) {
    if (updates.targetDate === '') entities[idx].targetDate = undefined;
    else entities[idx].targetDate = updates.targetDate;
  }
  // copy custom fields
  try {
    const cfg = getActiveConfig ? getActiveConfig() : null;
    if (cfg && Array.isArray(cfg.customFields)) {
      for (const cf of cfg.customFields) {
        if (cf.target === 'entity') {
          if (Object.prototype.hasOwnProperty.call(updates, cf.key)) {
            entities[idx][cf.key] = updates[cf.key];
          }
        }
      }
    }
  } catch (e) {}
  saveEntities(entities);
  return entities[idx];
}

export function deleteEntity(id) {
  const entities = loadEntities();
  const entity = entities.find(e => e.id === id);
  if (entity && entity.entity_id) {
    deleteDocumentsForEntity(entity.entity_id);
  }
  const filtered = entities.filter(e => e.id !== id);
  saveEntities(filtered);
  return filtered;
}

export function searchEntities(term) {
  if (!term || term.trim() === '') return loadEntities();
  const t = term.toLowerCase();
  const entities = loadEntities();
  return entities.filter(e => {
    const fields = [e.name, e.code, e.taxId, e.email, e.category, e.description, e.targetDate, e.paymentTerms, e.phone, e.address];
    for (const f of fields) {
      if (f && typeof f === 'string' && f.toLowerCase().includes(t)) return true;
    }
    // search custom fields
    for (const k of Object.keys(e)) {
      if (['id','entity_id','name','code','taxId','email','phone','address','category','description','targetDate','creditLimit','paymentTerms','createdAt','updatedAt'].includes(k)) continue;
      const v = e[k];
      if (v !== null && v !== undefined && String(v).toLowerCase().includes(t)) return true;
    }
    return false;
  });
}

export function clearAll() {
  const s = store();
  if (s) {
    s.removeItem(STORE_KEYS.entities);
    s.removeItem(STORE_KEYS.documents);
  }
}

export function loadDocuments() {
  const data = read(STORE_KEYS.documents);
  if (Array.isArray(data)) return data;
  return [];
}

export function saveDocuments(documents) {
  write(STORE_KEYS.documents, documents);
}

function validateDocumentDoc(doc) {
  const errors = {};
  const d = doc || {};
  if (d.entity_id === undefined || d.entity_id === null || d.entity_id === '') {
    errors.entity_id = 'Debe asociarse a una entidad';
  } else {
    const entities = loadEntities();
    if (!entities.find(e => e.entity_id === d.entity_id)) {
      errors.entity_id = 'La entidad asociada no existe';
    }
  }
  if (d.folio === undefined || d.folio === null || d.folio === '') {
    errors.folio = 'El folio es obligatorio';
  } else {
    const f = Number(d.folio);
    if (!Number.isInteger(f) || f <= 0) {
      errors.folio = 'El folio debe ser un entero positivo';
    }
  }
  if (!isValidDate(d.startDate)) {
    errors.startDate = 'La fecha de inicio debe ser válida';
  }
  if (!isValidDate(d.endDate)) {
    errors.endDate = 'La fecha de fin debe ser válida';
  }
  if (isValidDate(d.startDate) && isValidDate(d.endDate) && d.startDate && d.endDate) {
    const s = new Date(d.startDate + 'T00:00:00');
    const e2 = new Date(d.endDate + 'T00:00:00');
    if (e2 < s) {
      errors.endDate = 'La fecha de fin debe ser igual o posterior a la fecha de inicio';
    }
  }
  if (d.quantity !== undefined && d.quantity !== null && d.quantity !== '') {
    const q = Number(d.quantity);
    if (!Number.isInteger(q) || q <= 0) {
      errors.quantity = 'La cantidad debe ser un entero positivo';
    }
  }
  const nums = ['subtotal', 'discount', 'taxAmount', 'totalAmount'];
  for (const n of nums) {
    if (d[n] !== undefined && d[n] !== null && d[n] !== '') {
      const val = Number(d[n]);
      if (isNaN(val) || val < 0) {
        errors[n] = 'Debe ser un número no negativo';
      }
    }
  }
  if (d.discount !== undefined && d.discount !== null && d.discount !== '' && d.subtotal !== undefined && d.subtotal !== null && d.subtotal !== '') {
    const disc = Number(d.discount);
    const sub = Number(d.subtotal);
    if (!isNaN(disc) && !isNaN(sub) && disc > sub) {
      errors.discount = 'El descuento no puede superar el subtotal';
    }
  }
  // lifecycle
  try {
    const cfg = getActiveConfig ? getActiveConfig() : null;
    if (cfg && cfg.statusLifecycle && d.status) {
      const sl = cfg.statusLifecycle;
      if (Array.isArray(sl.statuses) && sl.statuses.includes(d.status)) {
        // basic check ok
      }
    }
  } catch (e) {}
  // custom fields
  try {
    const cfg = getActiveConfig ? getActiveConfig() : null;
    if (cfg && Array.isArray(cfg.customFields)) {
      for (const cf of cfg.customFields) {
        if (cf.target === 'document') {
          if (cf.required) {
            const val = d[cf.key];
            if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
              errors[cf.key] = 'El campo es obligatorio';
              continue;
            }
          }
        }
      }
    }
  } catch (e) {}
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateDocument(doc) {
  const d = { ...doc };
  if (d.entityId && !d.entity_id) d.entity_id = d.entityId;
  const v = validateDocumentDoc(d);
  // custom fields
  try {
    const cfg = getActiveConfig ? getActiveConfig() : null;
    if (cfg && Array.isArray(cfg.customFields)) {
      for (const cf of cfg.customFields) {
        if (cf.target === 'document') {
          if (cf.type === 'select' && cf.options) {
            const val = d[cf.key];
            if (val !== undefined && val !== null && val !== '') {
              if (!cf.options.includes(val)) {
                if (!v.errors) v.errors = {};
                v.errors[cf.key] = 'El valor debe ser uno de: ' + cf.options.join(', ');
                v.valid = false;
              }
            }
          }
        }
      }
    }
  } catch (e) {}
  // lifecycle
  try {
    const cfg = getActiveConfig ? getActiveConfig() : null;
    if (cfg && cfg.statusLifecycle && d.status) {
      const sl = cfg.statusLifecycle;
      if (Array.isArray(sl.statuses)) {
        if (!sl.statuses.includes(d.status)) {
          if (!v.errors) v.errors = {};
          v.errors.status = 'El estado debe ser uno de: ' + sl.statuses.join(', ');
          v.valid = false;
        }
      }
    }
  } catch (e) {}
  return v;
}

export function addDocument(document) {
  const docs = loadDocuments();
  const docInput = { ...document };
  if (docInput.entityId && !docInput.entity_id) docInput.entity_id = docInput.entityId;
  // run full validation including custom fields and lifecycle
  let v = validateDocumentDoc(docInput);
  try {
    const cfg = getActiveConfig ? getActiveConfig() : null;
    if (cfg && Array.isArray(cfg.customFields)) {
      for (const cf of cfg.customFields) {
        if (cf.target === 'document') {
          if (cf.type === 'select' && cf.options) {
            const val = docInput[cf.key];
            if (val !== undefined && val !== null && val !== '') {
              if (!cf.options.includes(val)) {
                if (!v.errors) v.errors = {};
                v.errors[cf.key] = 'El valor debe ser uno de: ' + cf.options.join(', ');
                v.valid = false;
              }
            }
          }
        }
      }
    }
    if (cfg && cfg.statusLifecycle && docInput.status) {
      const sl = cfg.statusLifecycle;
      if (Array.isArray(sl.statuses)) {
        if (!sl.statuses.includes(docInput.status)) {
          if (!v.errors) v.errors = {};
          v.errors.status = 'El estado debe ser uno de: ' + sl.statuses.join(', ');
          v.valid = false;
        }
      }
    }
  } catch (e) {}
  if (!v.valid) {
    const err = new Error('Validation failed');
    err.errors = v.errors;
    throw err;
  }
  const now = new Date().toISOString();
  const newDoc = {
    id: genId(),
    entity_id: docInput.entity_id,
    series: docInput.series !== undefined ? (typeof docInput.series === 'string' ? docInput.series.trim() : docInput.series) : undefined,
    folio: docInput.folio !== undefined && docInput.folio !== '' && docInput.folio !== null ? Number(docInput.folio) : docInput.folio,
    startDate: docInput.startDate,
    endDate: docInput.endDate,
    quantity: docInput.quantity !== undefined && docInput.quantity !== '' && docInput.quantity !== null ? Number(docInput.quantity) : undefined,
    subtotal: docInput.subtotal !== undefined && docInput.subtotal !== '' && docInput.subtotal !== null ? Number(docInput.subtotal) : undefined,
    discount: docInput.discount !== undefined && docInput.discount !== '' && docInput.discount !== null ? Number(docInput.discount) : undefined,
    taxAmount: docInput.taxAmount !== undefined && docInput.taxAmount !== '' && docInput.taxAmount !== null ? Number(docInput.taxAmount) : undefined,
    totalAmount: docInput.totalAmount !== undefined && docInput.totalAmount !== '' && docInput.totalAmount !== null ? Number(docInput.totalAmount) : undefined,
    currency: docInput.currency !== undefined ? (typeof docInput.currency === 'string' ? docInput.currency.trim() : docInput.currency) : undefined,
    paymentTerms: docInput.paymentTerms !== undefined ? (typeof docInput.paymentTerms === 'string' ? docInput.paymentTerms.trim() : docInput.paymentTerms) : undefined,
    notes: docInput.notes !== undefined ? (typeof docInput.notes === 'string' ? docInput.notes.trim() : docInput.notes) : undefined,
    status: docInput.status !== undefined ? (typeof docInput.status === 'string' ? docInput.status.trim() : docInput.status) : undefined,
    createdAt: now,
    updatedAt: now
  };
  try {
    const cfg = getActiveConfig ? getActiveConfig() : null;
    if (cfg && Array.isArray(cfg.customFields)) {
      for (const cf of cfg.customFields) {
        if (cf.target === 'document') {
          if (Object.prototype.hasOwnProperty.call(docInput, cf.key)) {
            newDoc[cf.key] = docInput[cf.key];
          }
        }
      }
    }
  } catch (e) {}
  docs.push(newDoc);
  saveDocuments(docs);
  return newDoc;
}

export function updateDocument(id, updates) {
  const docs = loadDocuments();
  const idx = docs.findIndex(d => d.id === id);
  if (idx === -1) throw new Error('Document not found');
  const up = { ...updates };
  if (up.entityId && !up.entity_id) up.entity_id = up.entityId;
  const merged = { ...docs[idx], ...up };
  // lifecycle transition check
  try {
    const cfg = getActiveConfig ? getActiveConfig() : null;
    if (cfg && cfg.statusLifecycle && up.status !== undefined) {
      const sl = cfg.statusLifecycle;
      const current = docs[idx].status;
      if (up.status !== current) {
        if (Array.isArray(sl.statuses) && sl.statuses.includes(up.status)) {
          if (sl.transitions && Array.isArray(sl.transitions[current])) {
            if (!sl.transitions[current].includes(up.status)) {
              throw new Error('Transición de estado inválida');
            }
          } else if (sl.transitions && sl.transitions[current] === undefined) {
            throw new Error('Transición de estado inválida');
          }
        }
      }
    }
  } catch (e) {
    if (e.message && e.message.includes('Transición')) throw e;
  }
  let v = validateDocumentDoc(merged);
  try {
    const cfg = getActiveConfig ? getActiveConfig() : null;
    if (cfg && Array.isArray(cfg.customFields)) {
      for (const cf of cfg.customFields) {
        if (cf.target === 'document' && cf.type === 'select' && cf.options) {
          const val = merged[cf.key];
          if (val !== undefined && val !== null && val !== '') {
            if (!cf.options.includes(val)) {
              if (!v.errors) v.errors = {};
              v.errors[cf.key] = 'El valor debe ser uno de: ' + cf.options.join(', ');
              v.valid = false;
            }
          }
        }
      }
    }
    if (cfg && cfg.statusLifecycle && up.status !== undefined) {
      const sl = cfg.statusLifecycle;
      if (Array.isArray(sl.statuses)) {
        if (!sl.statuses.includes(up.status)) {
          if (!v.errors) v.errors = {};
          v.errors.status = 'El estado debe ser uno de: ' + sl.statuses.join(', ');
          v.valid = false;
        }
      }
    }
  } catch (e) {}
  if (!v.valid) {
    const err = new Error('Validation failed');
    err.errors = v.errors;
    throw err;
  }
  const now = new Date().toISOString();
  docs[idx] = { ...docs[idx], ...up, updatedAt: now };
  if (up.folio !== undefined && up.folio !== '') docs[idx].folio = Number(up.folio);
  if (up.quantity !== undefined && up.quantity !== '') docs[idx].quantity = Number(up.quantity);
  if (up.subtotal !== undefined && up.subtotal !== '') docs[idx].subtotal = Number(up.subtotal);
  if (up.discount !== undefined && up.discount !== '') docs[idx].discount = Number(up.discount);
  if (up.taxAmount !== undefined && up.taxAmount !== '') docs[idx].taxAmount = Number(up.taxAmount);
  if (up.totalAmount !== undefined && up.totalAmount !== '') docs[idx].totalAmount = Number(up.totalAmount);
  try {
    const cfg = getActiveConfig ? getActiveConfig() : null;
    if (cfg && Array.isArray(cfg.customFields)) {
      for (const cf of cfg.customFields) {
        if (cf.target === 'document') {
          if (Object.prototype.hasOwnProperty.call(updates, cf.key)) {
            docs[idx][cf.key] = updates[cf.key];
          }
        }
      }
    }
  } catch (e) {}
  saveDocuments(docs);
  return docs[idx];
}

export function deleteDocument(id) {
  const docs = loadDocuments();
  const filtered = docs.filter(d => d.id !== id);
  saveDocuments(filtered);
  return filtered;
}

export function deleteDocumentsForEntity(entityId) {
  const docs = loadDocuments();
  const filtered = docs.filter(d => d.entity_id !== entityId);
  saveDocuments(filtered);
  return filtered;
}
