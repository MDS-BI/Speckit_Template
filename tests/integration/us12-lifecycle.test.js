import { beforeEach, describe, expect, it } from 'vitest';
import { initApp } from '../../src/app.js';
import { normalizeConfig } from '../../src/module-config.js';
import {
  addEntity,
  loadDocuments,
  updateDocument,
  ValidationFailure
} from '../../src/storage.js';
import { loadAppMarkup, submit } from '../setup/domFixture.js';

beforeEach(() => {
  loadAppMarkup();
});

const { config: lifecycleConfig } = normalizeConfig({
  moduleName: 'X',
  statusLifecycle: {
    statuses: ['Borrador', 'Aprobado', 'Pagado'],
    transitions: { Borrador: ['Aprobado'], Aprobado: ['Pagado'], Pagado: [] }
  }
});

function createDocument(entityId) {
  document.getElementById('document-entity').value = entityId;
  document.getElementById('folio').value = '1';
  document.getElementById('startDate').value = '2026-01-01';
  document.getElementById('endDate').value = '2026-01-02';
  submit('document-form');
}

describe('US12 - ciclo de vida de estados', () => {
  it('limita las transiciones y rechaza saltos no permitidos', () => {
    const entity = addEntity({ name: 'Acme', code: 'AC-1' });
    initApp(lifecycleConfig);
    createDocument(entity.entity_id);

    const created = loadDocuments()[0];
    expect(created.status).toBe('Borrador');

    const options = Array.from(document.getElementById('status').options).map((option) => option.value);
    expect(options).toEqual(['Borrador', 'Aprobado', 'Pagado']);

    document.getElementById('edit-document').value = created.document_id;
    document.getElementById('load-document').click();
    const editingOptions = Array.from(document.getElementById('status').options).map(
      (option) => option.value
    );
    expect(editingOptions).toEqual(['Borrador', 'Aprobado']);

    expect(() =>
      updateDocument(created.document_id, { status: 'Pagado' }, lifecycleConfig)
    ).toThrow(ValidationFailure);

    const promoted = updateDocument(created.document_id, { status: 'Aprobado' }, lifecycleConfig);
    expect(promoted.status).toBe('Aprobado');

    document.getElementById('nav-documents').click();
    document.getElementById('edit-document').value = created.document_id;
    document.getElementById('load-document').click();
    const promotedOptions = Array.from(document.getElementById('status').options).map(
      (option) => option.value
    );
    expect(promotedOptions).toEqual(['Aprobado', 'Pagado']);
  });

  it('usa estado de texto libre cuando no hay ciclo configurado', () => {
    const entity = addEntity({ name: 'Acme', code: 'AC-1' });
    initApp();

    expect(document.getElementById('status').hidden).toBe(true);
    expect(document.getElementById('status-free').hidden).toBe(false);

    document.getElementById('document-entity').value = entity.entity_id;
    document.getElementById('folio').value = '1';
    document.getElementById('startDate').value = '2026-01-01';
    document.getElementById('endDate').value = '2026-01-02';
    document.getElementById('status-free').value = 'En revisión';
    submit('document-form');

    expect(loadDocuments()[0].status).toBe('En revisión');
  });
});
