import { beforeEach, describe, expect, it } from 'vitest';
import { initApp } from '../../src/app.js';
import { addDocument, addEntity } from '../../src/storage.js';
import { loadAppMarkup } from '../setup/domFixture.js';

beforeEach(() => {
  loadAppMarkup();
});

describe('US3 - panel de inicio', () => {
  it('muestra estadísticas coherentes con el almacenamiento', () => {
    const entity = addEntity({ name: 'Acme', code: 'AC-1' });
    addDocument({
      entity_id: entity.entity_id,
      folio: 1,
      startDate: '2026-01-01',
      endDate: '2026-01-02'
    });
    initApp();

    expect(document.getElementById('stat-entities').textContent).toBe('1');
    expect(document.getElementById('stat-documents').textContent).toBe('1');
  });

  it('las acciones rápidas navegan a la vista correcta', () => {
    initApp();

    document.getElementById('qa-new-entity').click();
    expect(document.getElementById('view-entities').hidden).toBe(false);
    expect(document.getElementById('name').value).toBe('');

    document.getElementById('qa-search').click();
    expect(document.getElementById('view-search').hidden).toBe(false);
    expect(document.activeElement).toBe(document.getElementById('search-input'));
  });
});
