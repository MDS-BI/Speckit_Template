import { beforeEach, describe, expect, it } from 'vitest';
import { initApp } from '../../src/app.js';
import { addEntity, loadEntities } from '../../src/storage.js';
import { loadAppMarkup } from '../setup/domFixture.js';

beforeEach(() => {
  loadAppMarkup();
});

function typeSearch(value) {
  const input = document.getElementById('search-input');
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

describe('US11 - vista de búsqueda y navegación', () => {
  it('mantiene el término y los resultados al navegar', () => {
    addEntity({ name: 'Apple', code: 'AP-1', description: 'Cliente clave' });
    initApp();

    document.getElementById('qa-search').click();
    expect(document.getElementById('view-search').hidden).toBe(false);
    typeSearch('app');
    expect(document.getElementById('search-results').textContent).toContain('Apple');

    document.getElementById('nav-dashboard').click();
    expect(document.getElementById('view-dashboard').hidden).toBe(false);

    document.getElementById('nav-search').click();
    expect(document.getElementById('view-search').hidden).toBe(false);
    expect(document.getElementById('search-input').value).toBe('app');
    expect(document.getElementById('search-results').textContent).toContain('Apple');
    expect(loadEntities()).toHaveLength(1);
  });
});
