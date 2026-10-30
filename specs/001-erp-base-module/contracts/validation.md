# Contrato de Validación y Formas de Error

## Propósito

Unificar la validación para entidades, documentos, campos personalizados y configuración, con una forma de error consistente para asegurar retroalimentación clara al usuario (FR-006, FR-027).

## Forma de error

Todas las validaciones deben retornar/emitir errores con este esquema:

```typescript
interface ValidationError {
  field: string;      // Nombre de campo (puede ser ruta como 'customFields[0].key')
  code: string;       // Código estable (ej. REQUIRED, INVALID_EMAIL, INVALID_DATE, INVALID_NUMBER, ...)
  message: string;    // Mensaje legible para el usuario
  context?: any;      // Información opcional para depuración
}
```

## Códigos sugeridos

| Código | Cuándo usar |
| --- | --- |
| `REQUIRED` | Campo obligatorio vacío/faltante |
| `INVALID_FORMAT` | Formato general inválido |
| `INVALID_EMAIL` | Email con formato incorrecto |
| `INVALID_DATE` | Fecha inválida o formato no YYYY-MM-DD |
| `INVALID_NUMBER` | No es número o no cumple restricción numérica |
| `NEGATIVE_NOT_ALLOWED` | Número negativo cuando se requiere >= 0 |
| `INTEGER_REQUIRED` | Se requiere entero positivo |
| `DISCOUNT_EXCEEDS_SUBTOTAL` | Descuento > subtotal |
| `END_BEFORE_START` | endDate < startDate |
| `INVALID_FOLIO` | Folio no es entero positivo |
| `MISSING_ENTITY_REF` | Documento sin entity_id válido/existente |
| `CUSTOM_KEY_CONFLICT` | Clave de campo personalizado choca con campo base |
| `INVALID_CUSTOM_FIELD_TYPE` | Tipo de campo personalizado desconocido |
| `INVALID_SELECT_OPTIONS` | select sin opciones válidas |
| `INVALID_CONFIG` | Configuración inválida (genérico) |
| `INVALID_ACCENT_COLOR` | Color de acento inválido |

## Reglas de validación

### Entidad (base)
- `name`: REQUIRED si vacío/solo espacios
- `code`: REQUIRED si vacío/solo espacios
- `email`: si presente y no vacío -> debe tener formato email válido
- `creditLimit`: si presente -> debe ser número >= 0
- `targetDate`: si presente -> formato YYYY-MM-DD y fecha de calendario válida
- Campos de texto opcionales se recortan al guardar

### Documento (base)
- `entity_id`: REQUIRED y debe referenciar entidad existente
- `folio`: REQUIRED, entero positivo
- `startDate`: REQUIRED, YYYY-MM-DD válido
- `endDate`: REQUIRED, YYYY-MM-DD válido, >= startDate
- `quantity`: si presente -> entero positivo
- `subtotal`, `discount`, `taxAmount`, `totalAmount`: si presentes -> números >= 0
- `discount`: si `subtotal` presente -> discount <= subtotal
- `status`: si hay `statusLifecycle` configurado, debe cumplir transiciones permitidas (ver contrato de ciclo de vida). Si no hay configuración, texto libre permitido.

### Campos personalizados
- Por cada campo en `customFields` aplicable al target:
  - Si `required === true` y valor vacío/faltante -> `REQUIRED`
  - `text`: sin restricción extra salvo requerido
  - `number`: debe parsear a número válido; si requerido no vacío
  - `date`: si presente -> YYYY-MM-DD válido
  - `select`: si presente -> debe estar en `options`
- Valores se almacenan tal como se envían (passthrough), sin eliminar claves desconocidas

### Configuración
- Aplicar reglas de `module-config.md`
- Colisiones con claves base -> `CUSTOM_KEY_CONFLICT`
- Tipo desconocido / select sin opciones -> `INVALID_CUSTOM_FIELD_TYPE` / `INVALID_SELECT_OPTIONS`
- `accentColor` inválido -> `INVALID_ACCENT_COLOR` (no fatal, usar fallback)

## Comportamiento

- Validación previa al guardado (guardar debe fallar con errores si hay errores)
- Errores deben mostrarse asociados al campo cuando sea posible
- Mensajes claros, accionables (explicar qué se necesita)
- No fallar silenciosamente (FR-025)
- Mismo patrón de retroalimentación para base y campos personalizados (FR-027)

## Integración

- Almacenamiento (`src/storage.js`) debe validar y rechazar operaciones inválidas con `ValidationError[]` o lanzar con errores estructurados
- Formularios deben renderizar errores por campo
- Búsqueda no debe romperse por datos inválidos legacy (defensivo)
