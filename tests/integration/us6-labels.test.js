import { beforeEach, describe, expect, it } from 'vitest';
import { initApp } from '../../src/app.js';
import { loadAppMarkup } from '../setup/domFixture.js';

beforeEach(() => {
  loadAppMarkup();
});

describe('US6 - etiquetas de dominio', () => {
  it('no deja etiquetas base cuando se configuran todas', () => {
    initApp({
      moduleName: 'Ventas',
      labels: { entity: 'Cliente', entities: 'Clientes', document: 'Pedido', documents: 'Pedidos' },
      customFields: [],
      statusLifecycle: null,
      theme: { accentColor: '#0f62fe' }
    });

    const text = document.body.textContent;
    expect(text).not.toMatch(/\bEntidades?\b/i);
    expect(text).not.toMatch(/\bDocumentos?\b/i);
    expect(text).toContain('Clientes');
    expect(text).toContain('Pedidos');
    expect(document.querySelector('label[for="document-entity"]').textContent).toBe('Cliente');
    expect(document.querySelector('label[for="edit-document"]').textContent).toBe('Editar pedido');
  });

  it('mantiene los valores por defecto en etiquetas no configuradas', () => {
    initApp({ moduleName: 'Ventas', labels: { entity: 'Cliente' } });

    expect(document.getElementById('nav-entities').textContent).toBe('Entidades');
    expect(document.getElementById('nav-documents').textContent).toBe('Documentos');
    expect(document.querySelector('label[for="document-entity"]').textContent).toBe('Cliente');
  });
});
