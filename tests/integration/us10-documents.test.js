import { beforeEach, describe, expect, it } from 'vitest';
import { initApp } from '../../src/app.js';
import { addEntity, loadDocuments } from '../../src/storage.js';
import { loadAppMarkup, submit } from '../setup/domFixture.js';

beforeEach(() => {
  loadAppMarkup();
});

function fillDocument(entityId, overrides = {}) {
  const values = {
    folio: '7',
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    quantity: '2',
    subtotal: '100',
    discount: '10',
    taxAmount: '5',
    totalAmount: '95',
    currency: 'EUR',
    ...overrides
  };
  document.getElementById('document-entity').value = entityId;
  for (const [key, value] of Object.entries(values)) {
    document.getElementById(key).value = value;
  }
}

describe('US10 - detalle de documentos', () => {
  it('normaliza importes y los muestra en la lista', () => {
    const entity = addEntity({ name: 'Acme', code: 'AC-1' });
    initApp();
    fillDocument(entity.entity_id);
    submit('document-form');

    const record = loadDocuments()[0];
    expect(record.folio).toBe(7);
    expect(record.quantity).toBe(2);
    expect(record.subtotal).toBe(100);
    expect(record.discount).toBe(10);
    expect(record.taxAmount).toBe(5);
    expect(record.totalAmount).toBe(95);
    expect(record.currency).toBe('EUR');

    const list = document.getElementById('document-list').textContent;
    expect(list).toContain('#7');
    expect(list).toContain('Total: 95 EUR');
  });

  it('muestra el error cuando el descuento supera el subtotal', () => {
    const entity = addEntity({ name: 'Acme', code: 'AC-1' });
    initApp();
    fillDocument(entity.entity_id, { folio: '8', subtotal: '10', discount: '20' });
    submit('document-form');

    expect(document.getElementById('error-discount').textContent).toMatch(/descuento/i);
    expect(loadDocuments()).toHaveLength(0);
  });
});
