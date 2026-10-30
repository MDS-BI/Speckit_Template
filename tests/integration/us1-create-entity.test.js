import { beforeEach, describe, expect, it } from 'vitest';
import { initApp } from '../../src/app.js';
import { loadEntities } from '../../src/storage.js';
import { loadAppMarkup, submit } from '../setup/domFixture.js';

beforeEach(() => {
  loadAppMarkup();
});

describe('US1 - crear y organizar entidades', () => {
  it('persiste una entidad válida y la muestra en la lista', () => {
    initApp();
    document.getElementById('name').value = 'Acme';
    document.getElementById('code').value = 'AC-1';
    submit('entity-form');

    expect(loadEntities()).toHaveLength(1);
    expect(loadEntities()[0].name).toBe('Acme');
    expect(document.getElementById('entity-list').textContent).toContain('Acme');
  });

  it('muestra errores por campo y no persiste con obligatorios vacíos', () => {
    initApp();
    submit('entity-form');

    expect(document.getElementById('error-name').textContent).not.toBe('');
    expect(document.getElementById('error-code').textContent).not.toBe('');
    expect(loadEntities()).toHaveLength(0);
  });
});
