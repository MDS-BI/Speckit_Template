import { beforeEach, describe, expect, it } from 'vitest';
import { initApp } from '../../src/app.js';
import { addEntity, loadEntities, ValidationFailure } from '../../src/storage.js';
import { loadAppMarkup, submit } from '../setup/domFixture.js';

beforeEach(() => {
  loadAppMarkup();
});

describe('US9 - fecha objetivo', () => {
  it('persiste y muestra una fecha válida', () => {
    initApp();
    document.getElementById('name').value = 'Acme';
    document.getElementById('code').value = 'AC-1';
    document.getElementById('targetDate').value = '2026-05-01';
    submit('entity-form');

    expect(loadEntities()[0].targetDate).toBe('2026-05-01');
    expect(document.getElementById('entity-list').textContent).toContain('2026-05-01');
  });

  it('rechaza una fecha con formato inválido', () => {
    expect(() =>
      addEntity({ name: 'Acme', code: 'AC-1', targetDate: '2026-02-30' })
    ).toThrow(ValidationFailure);
    expect(loadEntities()).toHaveLength(0);
  });
});
