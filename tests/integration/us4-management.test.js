import { beforeEach, describe, expect, it } from 'vitest';
import { initApp } from '../../src/app.js';
import { addEntity, loadDocuments } from '../../src/storage.js';
import { loadAppMarkup, submit } from '../setup/domFixture.js';

beforeEach(() => {
  loadAppMarkup();
});

function fillDocument(entityId) {
  document.getElementById('document-entity').value = entityId;
  document.getElementById('series').value = 'A';
  document.getElementById('folio').value = '1';
  document.getElementById('startDate').value = '2026-01-01';
  document.getElementById('endDate').value = '2026-01-31';
  document.getElementById('subtotal').value = '100';
  document.getElementById('totalAmount').value = '95';
}

describe('US4 - registrar documentos vinculados', () => {
  it('crea y edita un documento asociado a una entidad', () => {
    const entity = addEntity({ name: 'Acme', code: 'AC-1' });
    initApp();

    fillDocument(entity.entity_id);
    submit('document-form');

    const documents = loadDocuments();
    expect(documents).toHaveLength(1);
    expect(documents[0].entity_id).toBe(entity.entity_id);
    expect(documents[0].folio).toBe(1);
    expect(document.getElementById('document-list').textContent).toContain('Acme');
    expect(document.getElementById('document-list').textContent).toContain('#1');

    document.getElementById('edit-document').value = documents[0].document_id;
    document.getElementById('load-document').click();
    expect(document.getElementById('folio').value).toBe('1');

    document.getElementById('folio').value = '2';
    submit('document-form');
    expect(loadDocuments()[0].folio).toBe(2);
    expect(loadDocuments()).toHaveLength(1);
  });

  it('elimina un documento sin afectar a la entidad', () => {
    const entity = addEntity({ name: 'Acme', code: 'AC-1' });
    initApp();
    fillDocument(entity.entity_id);
    submit('document-form');

    const originalConfirm = window.confirm;
    window.confirm = () => true;
    try {
      document.querySelector('.document-list [data-action="delete"]').click();
    } finally {
      window.confirm = originalConfirm;
    }

    expect(loadDocuments()).toHaveLength(0);
    expect(document.getElementById('document-list').textContent).toContain('No hay documentos');
  });
});
