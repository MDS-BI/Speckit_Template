import { beforeEach, describe, expect, it } from 'vitest';
import { initApp } from '../../src/app.js';
import { addEntity } from '../../src/storage.js';
import { loadAppMarkup } from '../setup/domFixture.js';

beforeEach(() => {
  loadAppMarkup();
});

function typeSearch(value) {
  const input = document.getElementById('search-input');
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

describe('US8 - búsqueda de entidades', () => {
  it('filtra por nombre, código y descripción', () => {
    addEntity({ name: 'Ana Pérez', code: 'AP-1', description: 'Cliente mayorista' });
    addEntity({ name: 'Bruno Díaz', code: 'BD-2', description: 'Proveedor local' });
    addEntity({ name: 'Carla Ruiz', code: 'CR-3', description: 'Transporte' });
    initApp();

    typeSearch('ana');
    expect(document.getElementById('search-results').textContent).toContain('Ana Pérez');
    expect(document.getElementById('search-results').textContent).not.toContain('Bruno Díaz');

    typeSearch('proveedor');
    expect(document.getElementById('search-results').textContent).toContain('Bruno Díaz');

    typeSearch('cr-3');
    expect(document.getElementById('search-results').textContent).toContain('Carla Ruiz');
  });

  it('muestra el estado vacío sin coincidencias y restaura todo con término vacío', () => {
    addEntity({ name: 'Ana Pérez', code: 'AP-1' });
    addEntity({ name: 'Bruno Díaz', code: 'BD-2' });
    initApp();

    typeSearch('zzz');
    expect(document.getElementById('search-empty').hidden).toBe(false);
    expect(document.getElementById('search-empty').textContent).toContain('No hay resultados');
    expect(document.querySelectorAll('#search-results .record-card')).toHaveLength(0);

    typeSearch('');
    expect(document.getElementById('search-empty').hidden).toBe(true);
    expect(document.querySelectorAll('#search-results .record-card')).toHaveLength(2);
  });
});
