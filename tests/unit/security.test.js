import { describe, expect, it } from 'vitest';
import { renderEntityList } from '../../src/components/entity-list.js';
import { escapeHtml } from '../../src/utils.js';

const config = {
  labels: { entity: 'Entidad', entities: 'Entidades', document: 'Documento', documents: 'Documentos' },
  customFields: [{ target: 'entity', key: 'note', label: 'Nota', type: 'text' }]
};

describe('seguridad de renderizado', () => {
  it('escapa caracteres HTML', () => {
    expect(escapeHtml('<script>"x" & \'y\'</script>')).toBe(
      '&lt;script&gt;&quot;x&quot; &amp; &#039;y&#039;&lt;/script&gt;'
    );
  });

  it('renderiza contenido de usuario como texto y no crea nodos ejecutables', () => {
    const container = document.createElement('div');
    document.body.append(container);
    renderEntityList(
      container,
      [
        {
          entity_id: '1',
          name: '<script>alert(1)</script>',
          code: '<img src=x onerror=alert(1)>',
          description: '<b>negrita</b>',
          customFields: { note: '<script>alert(2)</script>' }
        }
      ],
      { config, onEdit: () => {}, onDelete: () => {} }
    );

    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('b')).toBeNull();
    expect(container.textContent).toContain('<script>alert(1)</script>');
    expect(container.textContent).toContain('<img src=x onerror=alert(1)>');
  });
});
