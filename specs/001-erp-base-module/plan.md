# Plan de Implementación: Módulo Base de Software de Planificación de Recursos Empresariales (ERP)

**Rama**: `001-erp-base-module` | **Fecha**: 2026-07-08 | **Especificación**: [spec.md](spec.md)
**Entrada**: Especificación de la funcionalidad desde `/specs/001-erp-base-module/spec.md`

## Resumen

Construir una aplicación web ligera con Vite que sirva como módulo base de software de planificación de recursos empresariales (ERP). El módulo proporciona la base común que todo módulo ERP personalizado necesita: gestión de datos maestros (Entidades), documentos transaccionales vinculados (Documentos), flujos de crear/editar/eliminar/buscar, validación y persistencia local — construida principalmente con HTML, CSS y JavaScript vanilla. La aplicación se presenta como un espacio de trabajo ERP coherente: una barra superior con marca (logotipo derivado + nombre del módulo) y una barra lateral persistente de botones de módulo envuelven cada pantalla, y la pantalla de entrada es un panel estilo ERP que ofrece botones de acción rápida para las tareas clave (nueva entidad, nuevo documento, abrir áreas de gestión, buscar registros) además de estadísticas de registros en vivo. La adaptación a un módulo específico (p. ej., Ventas) se realiza mediante un único archivo de configuración (`src/module-config.js`) que cubre terminología, campos personalizados, ciclo de vida de documentos y color de acento, de modo que el código central permanece intacto.

## Contexto Técnico

**Lenguaje/Versión**: JavaScript (ES2022), HTML, CSS  
**Dependencias Principales**: Vite, sin framework de interfaz pesado  
**Almacenamiento**: localStorage del navegador para una instancia del módulo de espacio único  
**Pruebas**: Vitest con jsdom para pruebas unitarias y de interacción  
**Plataforma Objetivo**: Navegadores modernos de escritorio y móviles  
**Tipo de Proyecto**: Aplicación web  
**Objetivos de Rendimiento**: búsqueda y renderizado de listas <= 100 ms para 500 registros; actualizaciones de lista sin re-render completo del documento  
**Restricciones**: Huella mínima de librerías, despliegue simple, sin backend requerido; la estructura debe mantenerse extensible para módulos personalizados  
**Escala/Alcance**: Módulo base con CRUD de datos maestros (Entidad) y documentos transaccionales (Documento), búsqueda y capacidades de navegación

## Verificación de la Constitución

*COMPROBACIÓN: Debe pasar antes de la investigación de la Fase 0. Reverificar tras el diseño de la Fase 1.*

- **I. Base modular y configuración única**: PASA. Todo punto de adaptación (nombre, etiquetas, campos personalizados, ciclo de vida, color de acento) vive en `src/module-config.js`; el código central no contiene términos de dominio.
- **II. Test-First (NO NEGOCIABLE)**: PASA CON CONDICIÓN. Los flujos centrales requieren pruebas Vitest escritas antes de la implementación; las tareas T001–T081 deben marcarse completas solo cuando existan sus pruebas y pasen.
- **III. UX de workspace consistente**: PASA. `shell.js` posee barra superior y barra lateral; todas las etiquetas derivan de la configuración; se exige accesibilidad (`aria-current`, foco, etiquetas).
- **IV. Rendimiento medible**: PASA. Objetivo numérico <= 100 ms para 500 registros con actualizaciones dirigidas del DOM (FR-027, SC-004).
- **V. Simplicidad y local-first**: PASA. Sin backend, sin framework pesado, persistencia en localStorage, dependencias mínimas.

## Estructura del Proyecto

### Documentación (esta funcionalidad)

```text
specs/001-erp-base-module/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── spec.md
├── contracts/
└── tasks.md
```

### Código Fuente (raíz del repositorio)

```text
src/
├── main.js
├── styles.css
├── storage.js
├── app.js
├── module-config.js
└── components/
    ├── shell.js         (marco del espacio de trabajo: barra superior, logotipo SVG, barra lateral, estado de módulo activo)
    ├── dashboard.js     (vista de inicio: cuadrícula de acciones rápidas + tarjetas de estadísticas en vivo)
    ├── entity-form.js   (formulario de creación/edición de entidades con campos personalizados)
    ├── entity-list.js   (lista de entidades con controles de edición/eliminación y validación)
    ├── document-form.js (formulario de creación/edición de documentos con campos personalizados y ciclo de vida)
    ├── document-list.js (lista de documentos asociados a una entidad)
    └── search-bar.js    (interfaz de búsqueda de entidades)

tests/
├── unit/
├── integration/
└── setup/
```

**Decisión de Estructura**: Una aplicación Vite simple con un único punto de entrada HTML, un pequeño conjunto de módulos JavaScript y CSS en un archivo separado. Se usará localStorage para la persistencia de modo que la aplicación permanezca ligera y autónoma. Los componentes se dividen en pares de entidad (datos maestros) y documento (transaccional) que reflejan los dos conceptos centrales del módulo base, de modo que un módulo personalizado pueda renombrar o extender cada par de forma independiente. `shell.js` posee el marco del espacio de trabajo ERP — un logotipo monograma SVG en línea derivado del nombre del módulo, la barra superior y la barra lateral de módulos — envolviendo todas las vistas para que la marca y la navegación permanezcan consistentes sin duplicar marcado. `dashboard.js` renderiza los botones de acción rápida y las tarjetas de estadísticas de la pantalla de entrada, leyendo los recuentos del almacenamiento cada vez que se vuelve visible. `module-config.js` centraliza todos los puntos de adaptación — nombre del módulo, etiquetas de términos, definiciones de campos personalizados, ciclo de vida de estados y color de acento — manteniendo la personalización del dominio fuera del código central; el estilo se controla mediante propiedades personalizadas de CSS (tokens de diseño) en `styles.css` para que el color de acento configurado se aplique globalmente.

## Seguimiento de Complejidad

Este plan no introdujo violaciones de la constitución.
