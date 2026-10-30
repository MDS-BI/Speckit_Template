import { beforeEach, describe, expect, it } from 'vitest';
import { initApp } from '../../src/app.js';
import { normalizeConfig } from '../../src/module-config.js';
import { loadEntities } from '../../src/storage.js';
import { loadAppMarkup, submit } from '../setup/domFixture.js';

beforeEach(() => {
  loadAppMarkup();
});

const { config } = normalizeConfig({
  moduleName: 'X',
  customFields: [{ target: 'entity', key: 'priority', label: 'Prioridad', type: 'number', required: true }]
});

describe('US7 - campos personalizados', () => {
  it('renderiza, valida y persiste un campo personalizado', () => {
    initApp(config);
    const input = document.querySelector('[data-custom-key="priority"]');
    expect(input).toBeTruthy();
    expect(input.type).toBe('number');

    document.getElementById('name').value = 'Acme';
    document.getElementById('code').value = 'AC-1';
    submit('entity-form');

    expect(document.getElementById('error-custom-entity-priority').textContent).not.toBe('');
    expect(loadEntities()).toHaveLength(0);

    input.value = '5';
    submit('entity-form');

    expect(loadEntities()[0].customFields.priority).toBe('5');
    expect(document.getElementById('entity-list').textContent).toContain('Prioridad: 5');
  });

  it('permite buscar por el valor de un campo personalizado', () => {
    initApp(config);
    document.getElementById('name').value = 'Acme';
    document.getElementById('code').value = 'AC-1';
    document.querySelector('[data-custom-key="priority"]').value = '5';
    submit('entity-form');

    const search = document.getElementById('search-input');
    search.value = '5';
    search.dispatchEvent(new Event('input'));

    expect(document.getElementById('search-results').textContent).toContain('Acme');
  });
});
