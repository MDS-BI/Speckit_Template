import { beforeEach, describe, expect, it } from 'vitest';
import { initApp } from '../../src/app.js';
import { addEntity } from '../../src/storage.js';
import { loadAppMarkup } from '../setup/domFixture.js';

beforeEach(() => {
  loadAppMarkup();
});

describe('US13 - shell persistente', () => {
  it('muestra marca, logotipo y navegación activa', () => {
    initApp();

    expect(document.getElementById('brand-name').textContent).toBe('ERP Base');
    expect(document.getElementById('brand-logo').querySelector('svg')).toBeTruthy();
    expect(document.getElementById('brand-logo').textContent).toBe('EB');
    expect(document.getElementById('nav-dashboard').getAttribute('aria-current')).toBe('page');

    document.getElementById('nav-entities').click();
    expect(document.getElementById('nav-entities').getAttribute('aria-current')).toBe('page');
    expect(document.getElementById('nav-dashboard').hasAttribute('aria-current')).toBe(false);
    expect(document.getElementById('view-entities').hidden).toBe(false);
    expect(document.getElementById('view-dashboard').hidden).toBe(true);
  });

  it('conserva los datos al navegar entre módulos', () => {
    addEntity({ name: 'Acme', code: 'AC-1' });
    initApp();

    document.getElementById('nav-entities').click();
    expect(document.getElementById('entity-list').textContent).toContain('Acme');

    document.getElementById('nav-dashboard').click();
    expect(document.getElementById('stat-entities').textContent).toBe('1');

    document.getElementById('nav-entities').click();
    expect(document.getElementById('entity-list').textContent).toContain('Acme');
  });
});
