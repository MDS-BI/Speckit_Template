# Contrato de Navegación y Shell (Workspace Shell)

## Propósito

Definir el marco persistente ERP: barra superior con marca, barra lateral de navegación de módulos, enrutamiento por módulos y comportamiento responsivo/accesible (HU13, FR-011, FR-012, FR-026).

## Módulos

Módulos disponibles:

| ID | Etiqueta (desde config) | Ruta/Vista | Descripción |
| --- | --- | --- | --- |
| `dashboard` | Derivada (o "Panel") | Panel de inicio | Acciones rápidas + estadísticas (HU3 revisada) |
| `entities` | Desde `labels.entity/entities` | Gestión de entidades | Crear/editar/eliminar entidades (y documentos asociados) |
| `documents` | Desde `labels.document/documents` | Gestión de documentos | Gestión de documentos en pantalla de gestión |
| `search` | "Buscar" (configurable via labels si aplica) | Búsqueda dedicada | Búsqueda de entidades |

## Estructura del Shell

- **Barra superior**: 
  - Logotipo SVG en línea monograma derivado del `moduleName` (sin recursos externos)
  - Nombre del módulo configurado (`moduleName`)
- **Barra lateral**:
  - Botones de módulo para `dashboard`, `entities`, `documents`, `search` con etiquetas desde configuración
  - Módulo activo resaltado visualmente (`aria-current="page"` o equivalente)
  - En pantallas estrechas: colapsa a columna de iconos, manteniendo accesibilidad (etiquetas accesibles via `aria-label`/tooltip)
- **Área de contenido principal**: Renderiza la vista del módulo activo
- **Persistente**: Presente en todas las pantallas

## Comportamiento de navegación

- Navegación via barra lateral cambia módulo activo
- Al activar acción rápida del dashboard:
  - "Nueva entidad" -> navegar a `entities` con formulario vacío listo
  - "Nuevo documento" -> navegar a `documents` con formulario vacío listo
  - "Abrir gestión de entidades" -> navegar a `entities`
  - "Buscar registros" -> navegar a `search` con campo enfocado
- Navegación no debe perder datos almacenados (FR-022)
- Botón "Panel" en barra lateral vuelve a `dashboard` (FR-015)
- Estado de módulo activo debe reflejarse correctamente

## Accesibilidad

- Botones de módulo con orden de foco lógico
- Usar `aria-current="page"` para módulo activo
- En modo colapsado, proveer `aria-label` para cada botón
- Soportar navegación por teclado
- Contraste adecuado

## Integración

- `src/components/shell.js`: renderiza shell, logotipo monograma, navegación, estado activo
- `src/app.js`: gestiona enrutamiento por módulo y pasa estado/config a shell
- `index.html`: estructura base con shell
- Debe usar etiquetas desde `ModuleConfig` (FR-018)
- Resaltar con color de acento si está configurado (integrado con theming)

## Pruebas esperadas

- Shell aparece en todas las pantallas
- Logotipo y nombre del módulo correctos
- Etiquetas correctas con configuración personalizada
- Botón activo resaltado
- Navegación entre módulos preserva datos
- Colapso en ventana estrecha funcional y accesible
- Acciones rápidas del dashboard navegan correctamente
