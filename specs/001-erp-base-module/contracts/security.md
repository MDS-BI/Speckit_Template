# Contrato de Seguridad (XSS y Sanitización)

## Propósito

Prevenir inyección de scripts al renderizar contenido proveniente de `localStorage` o entrada de usuario (Supuesto del spec: sanitizar contenido antes de renderizar).

## Principio

**Nunca insertar HTML crudo desde datos de usuario.** Siempre escapar o usar `textContent`/constructores seguros.

## Reglas

- Todo contenido mostrado desde entidades/documentos/campos personalizados debe escaparse al renderizar en el DOM
- No usar `innerHTML` con strings no sanitizados
- Si se necesita formateo, usar nodos DOM o escapar caracteres HTML
- Atributos de eventos (`onclick`, etc.) nunca deben construirse desde datos de usuario
- URLs deben validarse si se usan (no aplica mucho aquí, pero cuidado)

## Función de escape sugerida

```javascript
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

## Aplicación

Aplicar en:
- Listas de entidades/documentos
- Vistas de detalle
- Resultados de búsqueda
- Mensajes renderizados
- Cualquier lugar donde se muestre `name`, `description`, `notes`, valores de campos personalizados, etc.

## Excepciones

Solo permitido si hay sanitización explícita y justificada. En general, no hay excepciones para datos de `localStorage`.

## Integración

- Crear/utilizar helper de escape en utilidades compartidas o directamente donde se renderiza
- Revisar `innerHTML` usages
- Tests pueden verificar que tags HTML se escapan

## Pruebas esperadas

- Entrada con `<script>` se muestra como texto escapado
- Tags HTML no se ejecutan
- Atributos no se inyectan
- Funciona con campos personalizados
