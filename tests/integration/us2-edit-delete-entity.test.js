import { beforeEach, describe, expect, it } from 'vitest';
import { initApp } from '../../src/app.js';
import {
  addDocument,
  addEntity,
  loadDocuments,
  loadEntities
} from '../../src/storage.js';
import { loadAppMarkup, submit } from '../setup/domFixture.js';

beforeEach(() => {
  loadAppMarkup();
});

describe('US2 - editar y eliminar entidades', () => {
  it('edita una entidad existente y refleja el cambio', () => {
    addEntity({ name: 'Acme', code: 'AC-1' });
    initApp();

    document.querySelector('.entity-list [data-action="edit"]').click();
    expect(document.getElementById('name').value).toBe('Acme');

    document.getElementById('name').value = 'Acme Renombrada';
    submit('entity-form');

    expect(loadEntities()[0].name).toBe('Acme Renombrada');
    expect(document.getElementById('entity-list').textContent).toContain('Acme Renombrada');
  });

  it('elimina la entidad y todos sus documentos en cascada', () => {
    const entity = addEntity({ name: 'Acme', code: 'AC-1' });
    addDocument({
      entity_id: entity.entity_id,
      folio: 1,
      startDate: '2026-01-01',
      endDate: '2026-01-02'
    });
    initApp();

    const originalConfirm = window.confirm;
    window.confirm = () => true;
    try {
      document.querySelector('.entity-list [data-action="delete"]').click();
    } finally {
      window.confirm = originalConfirm;
    }

    expect(loadEntities()).toHaveLength(0);
    expect(loadDocuments()).toHaveLength(0);
  });
});
