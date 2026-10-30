import { getConfig } from './module-config.js';
import { generateId, isBlank } from './utils.js';
import { validateDocument, validateEntity } from './validation.js';

export const STORAGE_KEYS = {
  entities: 'erp.entities',
  documents: 'erp.documents',
  schemaVersion: 'erp.schemaVersion'
};

export const SCHEMA_VERSION = '1.0.0';

export class ValidationFailure extends Error {
  constructor(errors) {
    super('Validation failed');
    this.name = 'ValidationFailure';
    this.errors = Array.isArray(errors) ? errors : [];
  }
}

function unwrapCollection(value) {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.data)) return value.data;
  return [];
}

function readCollection(key) {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return unwrapCollection(JSON.parse(raw));
  } catch {
    return [];
  }
}

function writeCollection(key, value) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
  localStorage.setItem(STORAGE_KEYS.schemaVersion, SCHEMA_VERSION);
}

function coerceNumbers(record, fields) {
  const result = { ...record };
  for (const field of fields) {
    const value = result[field];
    if (isBlank(value)) {
      delete result[field];
      continue;
    }
    result[field] = Number(value);
  }
  return result;
}

function assertValid(errors) {
  if (errors.length > 0) throw new ValidationFailure(errors);
}

export function loadEntities() {
  return readCollection(STORAGE_KEYS.entities);
}

export function saveEntities(entities) {
  if (!Array.isArray(entities)) {
    throw new ValidationFailure([
      { field: 'entities', code: 'INVALID_FORMAT', message: 'La lista de entidades debe ser un array.' }
    ]);
  }
  writeCollection(STORAGE_KEYS.entities, entities);
}

export function loadDocuments() {
  return readCollection(STORAGE_KEYS.documents);
}

export function saveDocuments(documents) {
  if (!Array.isArray(documents)) {
    throw new ValidationFailure([
      { field: 'documents', code: 'INVALID_FORMAT', message: 'La lista de documentos debe ser un array.' }
    ]);
  }
  writeCollection(STORAGE_KEYS.documents, documents);
}

export function addEntity(entity, config = getConfig()) {
  const now = new Date().toISOString();
  const normalized = coerceNumbers(entity || {}, ['creditLimit']);
  const record = {
    ...normalized,
    entity_id: normalized.entity_id || generateId('ent'),
    createdAt: normalized.createdAt || now,
    updatedAt: now,
    customFields:
      normalized.customFields && typeof normalized.customFields === 'object'
        ? { ...normalized.customFields }
        : {}
  };
  record.id = record.entity_id;

  const existing = loadEntities();
  assertValid(validateEntity(record, { config, existing }));
  saveEntities([...existing, record]);
  return record;
}

export function updateEntity(id, updates, config = getConfig()) {
  const entities = loadEntities();
  const index = entities.findIndex((entity) => entity.entity_id === id || entity.id === id);
  if (index === -1) {
    throw new ValidationFailure([
      { field: 'entity_id', code: 'NOT_FOUND', message: 'La entidad no existe.' }
    ]);
  }

  const previous = entities[index];
  const merged = {
    ...previous,
    ...coerceNumbers(updates || {}, ['creditLimit']),
    entity_id: previous.entity_id,
    id: previous.entity_id,
    createdAt: previous.createdAt,
    updatedAt: new Date().toISOString(),
    customFields:
      updates && updates.customFields && typeof updates.customFields === 'object'
        ? { ...updates.customFields }
        : { ...(previous.customFields || {}) }
  };

  assertValid(validateEntity(merged, { config, existing: entities }));
  const next = [...entities];
  next[index] = merged;
  saveEntities(next);
  return merged;
}

export function deleteEntity(id) {
  const entities = loadEntities();
  const next = entities.filter((entity) => entity.entity_id !== id && entity.id !== id);
  saveEntities(next);
  deleteDocumentsForEntity(id);
  return next;
}

export function addDocument(document, config = getConfig()) {
  const now = new Date().toISOString();
  const normalized = coerceNumbers(document || {}, [
    'folio',
    'quantity',
    'subtotal',
    'discount',
    'taxAmount',
    'totalAmount'
  ]);

  let status = normalized.status;
  if (isBlank(status) && config.statusLifecycle && config.statusLifecycle.statuses.length > 0) {
    status = config.statusLifecycle.statuses[0];
  }

  const record = {
    ...normalized,
    ...(isBlank(status) ? {} : { status }),
    document_id: normalized.document_id || generateId('doc'),
    createdAt: normalized.createdAt || now,
    updatedAt: now,
    customFields:
      normalized.customFields && typeof normalized.customFields === 'object'
        ? { ...normalized.customFields }
        : {}
  };
  record.id = record.document_id;

  const entities = loadEntities();
  assertValid(validateDocument(record, { config, entities }));
  saveDocuments([...loadDocuments(), record]);
  return record;
}

export function updateDocument(id, updates, config = getConfig()) {
  const documents = loadDocuments();
  const index = documents.findIndex((document) => document.document_id === id || document.id === id);
  if (index === -1) {
    throw new ValidationFailure([
      { field: 'document_id', code: 'NOT_FOUND', message: 'El documento no existe.' }
    ]);
  }

  const previous = documents[index];
  const merged = {
    ...previous,
    ...coerceNumbers(updates || {}, [
      'folio',
      'quantity',
      'subtotal',
      'discount',
      'taxAmount',
      'totalAmount'
    ]),
    document_id: previous.document_id,
    id: previous.document_id,
    createdAt: previous.createdAt,
    updatedAt: new Date().toISOString(),
    customFields:
      updates && updates.customFields && typeof updates.customFields === 'object'
        ? { ...updates.customFields }
        : { ...(previous.customFields || {}) }
  };

  assertValid(
    validateDocument(merged, {
      config,
      entities: loadEntities(),
      previousStatus: previous.status
    })
  );

  const next = [...documents];
  next[index] = merged;
  saveDocuments(next);
  return merged;
}

export function deleteDocument(id) {
  const next = loadDocuments().filter(
    (document) => document.document_id !== id && document.id !== id
  );
  saveDocuments(next);
  return next;
}

export function deleteDocumentsForEntity(entityId) {
  const next = loadDocuments().filter((document) => document.entity_id !== entityId);
  saveDocuments(next);
  return next;
}

export function clearAll() {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.entities);
  localStorage.removeItem(STORAGE_KEYS.documents);
  localStorage.removeItem(STORAGE_KEYS.schemaVersion);
}
