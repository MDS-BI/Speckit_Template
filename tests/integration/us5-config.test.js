import { beforeEach, describe, expect, it } from 'vitest';
import { initApp } from '../../src/app.js';
import { loadAppMarkup } from '../setup/domFixture.js';

beforeEach(() => {
  loadAppMarkup();
});

describe('US5 - configuración del módulo', () => {
  it('aplica nombre, acento y etiquetas válidas', () => {
    initApp({
      moduleName: 'Ventas',
      labels: { entity: 'Cliente', entities: 'Clientes', document: 'Pedido', documents: 'Pedidos' },
      customFields: [],
      statusLifecycle: null,
      theme: { accentColor: '#ff0000' }
    });

    expect(document.getElementById('brand-name').textContent).toBe('Ventas');
    expect(document.getElementById('nav-entities').textContent).toBe('Clientes');
    expect(document.getElementById('nav-documents').textContent).toBe('Pedidos');
    expect(document.title).toBe('Ventas');
    expect(document.documentElement.style.getPropertyValue('--accent-color')).toBe('#ff0000');
  });

  it('muestra un aviso y usa valores por defecto con configuración inválida', () => {
    const { errors } = initApp({ moduleName: '' });

    expect(errors.length).toBeGreaterThan(0);
    expect(document.getElementById('brand-name').textContent).toBe('ERP Base');
    const banner = document.getElementById('config-banner');
    expect(banner.hidden).toBe(false);
    expect(banner.textContent).toContain('Problemas de configuración');
  });

  it('usa el color por defecto cuando el acento no es válido', () => {
    initApp({ moduleName: 'X', theme: { accentColor: 'bad;;color' } });
    expect(document.documentElement.style.getPropertyValue('--accent-color')).toBe('#0f62fe');
    expect(document.getElementById('config-banner').hidden).toBe(false);
  });
});
