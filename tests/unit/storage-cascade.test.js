import { describe, expect, it } from 'vitest';
import { normalizeConfig } from '../../src/module-config.js';
import {
  addDocument,
  addEntity,
  deleteDocumentsForEntity,
  deleteEntity,
  loadDocuments
} from '../../src/storage.js';

const config = normalizeConfig({ moduleName: 'ERP Base' }).config;

function seed() {
  const entity = addEntity({ name: 'Acme', code: 'AC-1' }, config);
  addDocument(
    { entity_id: entity.entity_id, folio: 1, startDate: '2026-01-01', endDate: '2026-01-02' },
    config
  );
  addDocument(
    { entity_id: entity.entity_id, folio: 2, startDate: '2026-02-01', endDate: '2026-02-02' },
    config
  );
  return entity;
}

describe('integridad referencial', () => {
  it('elimina en cascada todos los documentos de la entidad', () => {
    const entity = seed();
    expect(loadDocuments()).toHaveLength(2);
    deleteEntity(entity.entity_id);
    expect(loadDocuments()).toHaveLength(0);
    expect(loadDocuments().some((document) => document.entity_id === entity.entity_id)).toBe(false);
  });

  it('deleteDocumentsForEntity elimina solo los documentos de esa entidad', () => {
    const entity = seed();
    const other = addEntity({ name: 'Otra', code: 'AC-2' }, config);
    addDocument(
      { entity_id: other.entity_id, folio: 3, startDate: '2026-03-01', endDate: '2026-03-02' },
      config
    );
    deleteDocumentsForEntity(entity.entity_id);
    const remaining = loadDocuments();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].entity_id).toBe(other.entity_id);
  });
});
