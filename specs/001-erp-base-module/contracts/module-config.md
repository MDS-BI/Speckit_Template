# Contrato de Configuración del Módulo (ModuleConfig)

## Propósito

Define cómo se adapta el módulo base a un módulo ERP personalizado mediante un único archivo de configuración. La configuración se carga al inicio (FR-016), se aplica a todas las pantallas y debe degradarse de forma segura (FR-017).

## Ubicación

- Archivo por defecto: `src/module-config.js`
- Carga: una vez al arrancar la aplicación
- Alcance: global (afecta a shell, dashboard, formularios, listas, búsqueda y estilos)

## Esquema

```typescript
interface ModuleConfig {
  moduleName: string;                // Obligatorio, no vacío
  labels?: ModuleLabels;            // Opcional, retrocede a Entidad/Documento
  customFields?: CustomField[];     // Opcional
  statusLifecycle?: StatusLifecycle;// Opcional
  theme?: ModuleTheme;              // Opcional
}

interface ModuleLabels {
  entity?: string;      // singular
  entities?: string;    // plural
  document?: string;    // singular
  documents?: string;   // plural
}

interface CustomField {
  target: 'entity' | 'document';     // Obligatorio
  key: string;                      // Obligatorio, único dentro del target
  label: string;                    // Obligatorio
  type: 'text' | 'number' | 'date' | 'select'; // Obligatorio
  required?: boolean;               // Opcional, por defecto false
  options?: string[];               // Obligatorio si type === 'select'
}

interface StatusLifecycle {
  statuses: string[];                           // Lista ordenada de estados permitidos
  transitions: Record<string, string[]>;       // Mapa estado -> estados siguientes permitidos
}

interface ModuleTheme {
  accentColor?: string;             // Color CSS válido. Si inválido o ausente -> predeterminado
}
```

## Valores predeterminados

Cuando no hay configuración o es parcialmente inválida, usar:

```javascript
{
  moduleName: 'ERP Base',
  labels: {
    entity: 'Entidad',
    entities: 'Entidades',
    document: 'Documento',
    documents: 'Documentos'
  },
  customFields: [],
  statusLifecycle: null,        // estado libre (texto)
  theme: { accentColor: null } // usar valores integrados
}
```

## Reglas de validación

- `moduleName`: debe ser string no vacío. Si falta o vacío -> error claro, usar predeterminado o bloquear inicialización con mensaje legible (FR-017).
- `labels`: si se proporciona parcialmente, completar con predeterminados.
- `customFields`:
  - `target` debe ser `entity` o `document`
  - `key` debe ser único por target
  - `key` NO debe chocar con campos base (ver lista de claves prohibidas)
  - `type` debe ser uno de `text|number|date|select`
  - Si `type === 'select'`, `options` debe ser array no vacío de strings
  - Claves prohibidas (base): `id`, `entity_id`, `name`, `code`, `taxId`, `email`, `phone`, `address`, `category`, `description`, `targetDate`, `creditLimit`, `paymentTerms`, `series`, `folio`, `startDate`, `endDate`, `quantity`, `subtotal`, `discount`, `taxAmount`, `totalAmount`, `currency`, `notes`, `status`, `createdAt`, `updatedAt`
- `statusLifecycle`:
  - `statuses` debe ser array no vacío de strings únicos
  - `transitions` debe cubrir al menos los estados presentes o ser consistente; toda transición debe ir a un estado listado en `statuses`
  - Si inválido -> ignorar ciclo de vida (pasar a estado libre) e informar claramente (FR-017)
- `theme.accentColor`:
  - Debe ser un color CSS válido (ej. `#RRGGBB`, `rgb(...)`, `hsl(...)`, nombre CSS válido). 
  - Si ausente o inválido -> usar valor predeterminado del sistema, sin errores fatales.

## Comportamiento de errores

- Los errores de configuración deben mostrarse de forma clara al arrancar (consola + UI si aplica) sin crashear silenciosamente.
- Configuraciones parcialmente válidas deben aplicarse con partes válidas y usar predeterminados para las inválidas, informando los problemas.
- Nunca se deben filtrar términos base al UI si hay configuración válida (FR-006, FR-017).

## Integración

- Exportar configuración normalizada y validadora desde `src/module-config.js`.
- `src/main.js` y `src/app.js` deben recibirla y pasarla a shell, dashboard, formularios, listas y búsqueda.
- `src/app.js` debe aplicar `theme.accentColor` como variable CSS personalizada (ej. `--accent-color`) en el alcance del workspace shell.
- Las etiquetas derivadas deben usarse en todo el UI (FR-018).

## Pruebas esperadas

- Carga con config completa válida
- Retroceso a predeterminados sin config
- Config parcialmente inválida (mezcla válida/ inválida)
- Detección de colisión de clave con campos base
- Validación de `select` sin opciones
- Color de acento inválido -> fallback
- Ciclo de vida inválido -> estado libre
