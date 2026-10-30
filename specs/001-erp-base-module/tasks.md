# Tareas: Módulo Base de Software de Planificación de Recursos Empresariales (ERP)

**Entrada**: Documentos de diseño en `/specs/001-erp-base-module/`

**Prerrequisitos**: plan.md (obligatorio), spec.md (obligatorio para historias), research.md, data-model.md, contracts/, quickstart.md

**Pruebas**: La especificación (FR-028) y la constitución (Test-First, NO NEGOCIABLE) exigen pruebas automatizadas. Cada tarea de prueba DEBE escribirse y fallar antes de su implementación asociada.

**Organización**: Las tareas se agrupan por historia de usuario para permitir implementación y validación independientes.

## Formato: `[ID] [P?] [Story] Descripción`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias de tareas incompletas)
- **[Story]**: Historia de usuario asociada (US1, US2, ... US13)
- Todas las descripciones incluyen la ruta de archivo exacta

## Convenciones de Rutas

- Aplicación web de un solo proyecto: `src/` y `tests/` en la raíz del repositorio
- Componentes: `src/components/`
- Pruebas unitarias: `tests/unit/`
- Pruebas de integración: `tests/integration/`
- Configuración de pruebas: `tests/setup/`

---

## Phase 1: Setup (Infraestructura Compartida)

**Propósito**: Inicialización del proyecto y estructura básica

- [X] T001 Verificar `package.json` con las dependencias `vite ^8.2.1`, `vitest ^4.1.10`, `jsdom ^30.0.1` y los scripts `dev`, `build`, `test`; ejecutar `npm install`
- [X] T002 [P] Crear la estructura de directorios `src/components/`, `tests/unit/`, `tests/integration/` y `tests/setup/`
- [X] T003 [P] Configurar Vitest para jsdom en `vitest.config.mjs` (`environment: 'jsdom'`, `setupFiles`, `fileParallelism: false`) y crear `tests/setup/dom.js`
- [X] T004 [P] Alinear `index.html` con el contrato de shell y vistas: `lang="es"`, IDs de barra superior, barra lateral, vistas y formularios, y script `./src/main.js`

---

## Phase 2: Foundational (Prerrequisitos Bloqueantes)

**Propósito**: Infraestructura central que DEBE completarse antes de cualquier historia de usuario

**CRÍTICO**: Ninguna historia de usuario puede comenzar hasta completar esta fase.

### Pruebas de la base (escribir primero, deben fallar)

- [X] T005 [P] Escribir pruebas unitarias fallidas de CRUD de entidades, generación de `entity_id`, timestamps ISO, passthrough de campos personalizados y rechazo de `name`/`code` vacíos en `tests/unit/storage.test.js`
- [X] T006 [P] Escribir pruebas unitarias fallidas de eliminación en cascada y ausencia de documentos huérfanos en `tests/unit/storage-cascade.test.js`
- [X] T007 [P] Escribir pruebas unitarias fallidas de normalización de configuración, valores por defecto, configuración parcial/inválida y fallback de `theme.accentColor` en `tests/unit/module-config.test.js`
- [X] T008 [P] Escribir pruebas unitarias fallidas de los códigos `REQUIRED`, `INVALID_EMAIL`, `INVALID_DATE`, `NEGATIVE_NOT_ALLOWED`, `INVALID_FOLIO`, `END_BEFORE_START`, `DISCOUNT_EXCEEDS_SUBTOTAL` y `MISSING_ENTITY_REF` en `tests/unit/validation.test.js`

### Implementación de la base

- [X] T009 [P] Crear `src/utils.js` con `escapeHtml` (según `contracts/security.md`), `generateId`, `isValidDate` (formato `YYYY-MM-DD` y calendario válido) y normalización de texto sin mayúsculas ni acentos
- [X] T010 [P] Implementar `src/validation.js` con la forma `ValidationError { field, code, message, context? }` y las reglas de `contracts/validation.md`: `name`/`code` REQUIRED si vacío/solo espacios, `email` formato válido si está presente, `creditLimit` número >= 0, `targetDate` `YYYY-MM-DD` válido, `folio` REQUIRED entero positivo, `startDate`/`endDate` REQUIRED `YYYY-MM-DD`, `endDate` >= `startDate`, `quantity` entero positivo si está presente, `subtotal`/`discount`/`taxAmount`/`totalAmount` >= 0 si están presentes, `discount` <= `subtotal`
- [X] T011 [P] Implementar `src/module-config.js` con `DEFAULT_CONFIG` (`moduleName: 'ERP Base'`, etiquetas `Entidad/Entidades/Documento/Documentos`, `customFields: []`, `statusLifecycle: null`, `theme.accentColor: null`), `normalizeConfig` y `validateConfig` según `contracts/module-config.md`
- [X] T012 [P] Implementar en `src/storage.js` la carga/guardado en localStorage con claves `erp.entities`, `erp.documents`, `erp.schemaVersion`, tolerancia a datos ausentes/corruptos y passthrough de claves desconocidas
- [X] T013 Implementar en `src/storage.js` `addEntity`, `updateEntity`, `deleteEntity` con validación, generación de `entity_id` único, `createdAt`/`updatedAt` ISO y unicidad de `code` (depende de T010, T012)
- [X] T014 Implementar en `src/storage.js` `addDocument`, `updateDocument`, `deleteDocument`, `deleteDocumentsForEntity` con validación de `entity_id` existente, timestamps y cascada desde `deleteEntity` (depende de T013)
- [X] T015 [P] Implementar `src/styles.css` con tokens de diseño (`--accent-color`), layout del workspace (barra superior, barra lateral, contenido), formularios, listas y estados vacíos
- [X] T016 Implementar `src/app.js` con contenedor de estado y enrutador entre `dashboard`, `entities`, `documents` y `search`, preservando datos entre vistas (FR-022)
- [X] T017 Implementar `src/components/shell.js` con barra superior, barra lateral desde etiquetas de configuración, módulo activo con `aria-current="page"` y estructura semántica
- [X] T018 Implementar `src/main.js` como arranque: cargar/normalizar configuración, aplicar `theme.accentColor` como variable CSS, montar el shell y la vista inicial

**Checkpoint**: Base lista; las historias de usuario pueden comenzar.

---

## Phase 3: User Story 1 - Crear y organizar entidades (Priority: P1) MVP

**Goal**: Crear entidades válidas y verlas en la lista de gestión.

**Independent Test**: Un usuario abre la aplicación, envía el formulario con nombre y código válidos y ve la nueva entidad en la lista; con campos obligatorios vacíos no se persiste nada.

### Pruebas de US1

- [X] T019 [P] [US1] Escribir prueba de integración fallida que cree una entidad válida y verifique que aparece en la lista en `tests/integration/us1-create-entity.test.js`
- [X] T020 [P] [US1] Escribir prueba de integración fallida que envíe nombre/código vacíos, verifique errores por campo y ausencia de persistencia en `tests/integration/us1-validation.test.js`

### Implementación de US1

- [X] T021 [US1] Implementar `src/components/entity-form.js` en modo creación con `name` y `code` obligatorios y envío mediante `addEntity`
- [X] T022 [US1] Implementar `src/components/entity-list.js` con renderizado de entidades desde `loadEntities()` y estado vacío claro
- [X] T023 [US1] Conectar el envío del formulario y la actualización de la lista en la vista `entities` de `src/app.js` (depende de T021, T022)

**Checkpoint**: US1 totalmente funcional y validable de forma independiente.

---

## Phase 4: User Story 2 - Editar y eliminar entidades (Priority: P1)

**Goal**: Corregir o retirar entidades existentes, con cascada a sus documentos.

**Independent Test**: Editar una entidad actualiza la lista; eliminarla la quita junto con todos sus documentos.

### Pruebas de US2

- [X] T024 [P] [US2] Escribir prueba de integración fallida de edición de entidad y eliminación con cascada visible en `tests/integration/us2-edit-delete-entity.test.js`

### Implementación de US2

- [X] T025 [US2] Añadir modo edición a `src/components/entity-form.js` (cargar entidad seleccionada, `updateEntity`, preservar campos personalizados)
- [X] T026 [US2] Añadir control de eliminación con confirmación y cascada en `src/components/entity-list.js`
- [X] T027 [US2] Conectar acciones de editar/eliminar y refresco de lista en la vista `entities` de `src/app.js` (depende de T025, T026)

**Checkpoint**: US1 y US2 funcionan de forma independiente.

---

## Phase 5: User Story 3 - Panel de inicio con acciones rápidas y estadísticas (Priority: P1)

**Goal**: Punto de entrada con acciones rápidas y recuentos en vivo.

**Independent Test**: El panel abre con las cuatro acciones rápidas; las tarjetas de entidades y documentos coinciden con el almacenamiento.

### Pruebas de US3

- [X] T028 [P] [US3] Escribir prueba de integración fallida de acciones rápidas y estadísticas en vivo en `tests/integration/us3-dashboard.test.js`

### Implementación de US3

- [X] T029 [US3] Implementar `src/components/dashboard.js` con acciones rápidas (nueva entidad, nuevo documento, gestión de entidades, buscar registros) y tarjetas de estadísticas desde `loadEntities()`/`loadDocuments()`
- [X] T030 [US3] Conectar acciones del panel en `src/app.js` para navegar con formulario limpio, campo enfocado o vista solicitada, y refrescar estadísticas al mostrar el panel (depende de T029)

**Checkpoint**: El panel funciona como entrada principal del módulo.

---

## Phase 6: User Story 4 - Gestionar entidades y documentos en una pantalla dedicada (Priority: P1)

**Goal**: CRUD de entidades y documentos vinculados desde la pantalla de gestión.

**Independent Test**: Crear, editar y eliminar una entidad y un documento desde gestión; ambos quedan vinculados y reflejados.

### Pruebas de US4

- [X] T031 [P] [US4] Escribir prueba de integración fallida de creación, edición y eliminación de entidad y documento desde la pantalla de gestión en `tests/integration/us4-management.test.js`

### Implementación de US4

- [X] T032 [US4] Implementar `src/components/document-form.js` en modo creación/edición con selector de entidad, `series`, `folio` (entero positivo), `startDate`/`endDate` (`YYYY-MM-DD`, `endDate` >= `startDate`) y `status`
- [X] T033 [US4] Implementar `src/components/document-list.js` con documentos de la entidad seleccionada y controles de editar/eliminar
- [X] T034 [US4] Conectar vistas `entities` y `documents` en `src/app.js`, sincronizando la selección de entidad con la lista de documentos (depende de T032, T033)

**Checkpoint**: Gestión de entidades y documentos operativa.

---

## Phase 7: User Story 5 - Definir un perfil de configuración del módulo (Priority: P1)

**Goal**: Adaptar identidad y comportamiento desde `src/module-config.js` sin tocar código central.

**Independent Test**: Una configuración de Ventas se aplica al arrancar; una ausente o inválida usa los valores por defecto y muestra un mensaje legible.

### Pruebas de US5

- [X] T035 [P] [US5] Escribir prueba de integración fallida de arranque con configuración válida y con configuración ausente/inválida (banner legible y valores por defecto) en `tests/integration/us5-config.test.js`

### Implementación de US5

- [X] T036 [US5] Endurecer `src/module-config.js`: validar `moduleName` no vacío, etiquetas parciales, `customFields` (`target` `entity|document`, `key` único por target sin colisión con claves base, `type` `text|number|date|select`, `options` no vacías para `select`), `statusLifecycle` (`statuses` únicos no vacíos y transiciones a estados listados) y `theme.accentColor` CSS válido con fallback
- [X] T037 [US5] Mostrar problemas de configuración en un banner no bloqueante desde `src/main.js` y arrancar con valores por defecto sin fallar (depende de T036)

**Checkpoint**: La configuración es el único punto de adaptación y degrada de forma segura.

---

## Phase 8: User Story 6 - Reetiquetar pantallas desde la configuración (Priority: P1)

**Goal**: Toda la terminología visible proviene de `labels`.

**Independent Test**: Con `Entidad→Cliente` y `Documento→Pedido de Venta`, ninguna pantalla muestra los términos base; una configuración parcial usa valores por defecto.

### Pruebas de US6

- [X] T038 [P] [US6] Escribir prueba de integración fallida que recorra shell, panel, formularios, listas y búsqueda con etiquetas personalizadas y verifique que no se filtra terminología base en `tests/integration/us6-labels.test.js`

### Implementación de US6

- [X] T039 [US6] Sustituir etiquetas fijas por etiquetas de configuración en `src/components/shell.js`, `src/components/dashboard.js`, `src/components/entity-form.js`, `src/components/entity-list.js`, `src/components/document-form.js`, `src/components/document-list.js` y `src/components/search-bar.js`
- [X] T040 [US6] Implementar retroceso por etiqueta faltante a los valores por defecto `Entidad/Entidades/Documento/Documentos` en títulos, botones, mensajes y estados vacíos (depende de T039)

**Checkpoint**: La terminología del dominio se aplica en toda la interfaz.

---

## Phase 9: User Story 7 - Declarar campos personalizados para los registros (Priority: P1)

**Goal**: Campos declarados en configuración fluyen por formulario, validación, persistencia, lista y búsqueda.

**Independent Test**: Un campo `number` obligatorio se renderiza como entrada numérica, bloquea guardados vacíos, aparece en la lista y coincide en la búsqueda.

### Pruebas de US7

- [X] T041 [P] [US7] Escribir pruebas unitarias fallidas de validación de campos personalizados (`text`, `number`, `date`, `select`, `required`) y passthrough en `tests/unit/custom-fields.test.js`
- [X] T042 [P] [US7] Escribir prueba de integración fallida de campos personalizados dinámicos en formularios y listas en `tests/integration/us7-custom-fields.test.js`

### Implementación de US7

- [X] T043 [US7] Implementar renderizado dinámico de campos personalizados (`text`, `number`, `date`, `select`, `required`) para entidades y documentos en `src/components/entity-form.js` y `src/components/document-form.js`
- [X] T044 [US7] Mostrar valores de campos personalizados en `src/components/entity-list.js` y validarlos con errores asociados al campo (depende de T043)
- [X] T045 [US7] Añadir `getSearchableValues(entity)` en `src/utils.js` incluyendo `customFields` para que la búsqueda de US8 los indexe (depende de T009)

**Checkpoint**: Los campos personalizados funcionan de extremo a extremo sin tocar código central.

---

## Phase 10: User Story 13 - Marco de espacio de trabajo ERP con marca (Priority: P1)

**Goal**: Marco persistente con barra superior, logotipo, navegación lateral y comportamiento responsivo accesible.

**Independent Test**: En cada pantalla se ven barra superior y barra lateral, el módulo activo está resaltado con `aria-current`, la navegación conserva datos y la barra lateral colapsa en ventanas estrechas.

### Pruebas de US13

- [X] T046 [P] [US13] Escribir prueba de integración fallida de shell persistente, logotipo/nombre, `aria-current`, navegación y colapso responsivo en `tests/integration/us13-shell.test.js`

### Implementación de US13

- [X] T047 [US13] Implementar logotipo SVG monograma en línea derivado de `moduleName` (sin recursos externos) en `src/components/shell.js`
- [X] T048 [US13] Resaltar el módulo activo con `aria-current="page"` y actualizar estado al navegar en `src/components/shell.js` y `src/app.js`
- [X] T049 [US13] Implementar colapso de barra lateral a riel de iconos con `aria-label`/tooltip en ventanas estrechas en `src/styles.css` y `src/components/shell.js`
- [X] T050 [US13] Añadir botón "Panel" en la barra lateral y garantizar orden de foco lógico y navegación por teclado (depende de T047, T048)

**Checkpoint**: Todas las vistas comparten un marco consistente y accesible.

---

## Phase 11: User Story 8 - Buscar y encontrar entidades rápidamente (Priority: P2)

**Goal**: Búsqueda en tiempo real por `name`, `code`, `description` y campos personalizados, con estado vacío claro.

**Independent Test**: Un término devuelve solo coincidencias; sin coincidencias se muestra un estado vacío; término vacío muestra todas las entidades.

### Pruebas de US8

- [X] T051 [P] [US8] Escribir pruebas unitarias fallidas de coincidencia substring, insensible a mayúsculas/acentos, sobre `name`/`code`/`description`/`customFields`, y término vacío devolviendo todas en `tests/unit/search.test.js`
- [X] T052 [P] [US8] Escribir prueba de integración fallida de resultados en vivo y estado vacío en `tests/integration/us8-search.test.js`

### Implementación de US8

- [X] T053 [US8] Implementar `src/search.js` con `searchEntities(entities, term, config)` según `contracts/search.md` y `getSearchableValues` de T045
- [X] T054 [US8] Implementar `src/components/search-bar.js` con entrada de búsqueda, lista de resultados y estado vacío claro
- [X] T055 [US8] Conectar renderizado de resultados y refresco tras crear/editar/eliminar en la vista `search` de `src/app.js` (depende de T053, T054)

**Checkpoint**: La búsqueda devuelve resultados correctos y rápidos.

---

## Phase 12: User Story 9 - Registrar una fecha objetivo (Priority: P2)

**Goal**: Fecha objetivo opcional en entidades, validada y visible.

**Independent Test**: Una fecha válida se persiste y se muestra en la lista; un formato inválido produce error.

### Pruebas de US9

- [X] T056 [P] [US9] Escribir prueba de integración fallida de persistencia, visualización y validación de `targetDate` en `tests/integration/us9-target-date.test.js`

### Implementación de US9

- [X] T057 [US9] Añadir `targetDate` opcional a `src/components/entity-form.js` (validar `YYYY-MM-DD` válido) y mostrarlo en `src/components/entity-list.js`

**Checkpoint**: La fecha objetivo funciona sin afectar otras historias.

---

## Phase 13: User Story 10 - Registrar los detalles de documentos de una entidad (Priority: P2)

**Goal**: Documentos con desglose monetario y fechas, vinculados y visibles con su entidad.

**Independent Test**: Un documento con detalles se guarda vinculado por `entity_id`; eliminar la entidad elimina sus documentos.

### Pruebas de US10

- [X] T058 [P] [US10] Escribir pruebas unitarias fallidas de validación de documentos: `folio` entero positivo, `endDate` >= `startDate`, `quantity` entero positivo, montos >= 0 y `discount` <= `subtotal` en `tests/unit/document-validation.test.js`
- [X] T059 [P] [US10] Escribir prueba de integración fallida de detalles de documento vinculados a entidad y cascada visible en `tests/integration/us10-documents.test.js`

### Implementación de US10

- [X] T060 [US10] Extender `src/components/document-form.js` con `quantity`, `subtotal`, `discount`, `taxAmount`, `totalAmount`, `currency`, `notes` y condiciones de pago, aplicando las restricciones de T058
- [X] T061 [US10] Mostrar los detalles del documento agrupados bajo su entidad en `src/components/document-list.js` y reflejar la cascada en la interfaz (depende de T060)
- [X] T062 [US10] Validar `entity_id` faltante o inexistente con `MISSING_ENTITY_REF` y error asociado al campo en `src/components/document-form.js` (depende de T060)

**Checkpoint**: Los documentos transaccionales dan contexto completo a las entidades.

---

## Phase 14: User Story 11 - Buscar entidades en una pantalla dedicada (Priority: P2)

**Goal**: Vista de búsqueda dedicada accesible desde panel y barra lateral, con estado preservado.

**Independent Test**: Navegar a Búsqueda, buscar, ver resultados o estado vacío y volver al Panel conservando datos.

### Pruebas de US11

- [X] T063 [P] [US11] Escribir prueba de integración fallida de navegación a la vista de búsqueda desde panel/barra lateral, foco del campo y conservación de datos en `tests/integration/us11-search-view.test.js`

### Implementación de US11

- [X] T064 [US11] Implementar la vista de búsqueda dedicada en `src/app.js` con foco automático en el campo al llegar desde la acción rápida del panel
- [X] T065 [US11] Asegurar etiquetas accesibles, estructura semántica y persistencia del estado de búsqueda al navegar entre vistas en `src/components/search-bar.js` y `src/app.js` (depende de T064)

**Checkpoint**: La consulta tiene su propia vista sin mezclarse con la edición.

---

## Phase 15: User Story 12 - Configurar el ciclo de vida de estados de documentos (Priority: P2)

**Goal**: Solo transiciones válidas cuando hay `statusLifecycle`; texto libre cuando no lo hay.

**Independent Test**: Con ciclo configurado solo se ofrecen estados siguientes válidos y los inválidos se rechazan con explicación; sin ciclo, el estado es texto libre.

### Pruebas de US12

- [X] T066 [P] [US12] Escribir pruebas unitarias fallidas de transiciones válidas/inválidas y fallback a texto libre en `tests/unit/status-lifecycle.test.js`
- [X] T067 [P] [US12] Escribir prueba de integración fallida del selector de estado y rechazo de transiciones no permitidas en `tests/integration/us12-lifecycle.test.js`

### Implementación de US12

- [X] T068 [US12] Implementar validación de `statusLifecycle` (`statuses` y `transitions`) en `src/validation.js` con explicación clara al rechazar una transición
- [X] T069 [US12] Renderizar en `src/components/document-form.js` solo los estados siguientes permitidos y un campo de texto libre cuando no hay ciclo configurado (depende de T068)

**Checkpoint**: Los procesos de negocio se modelan con transiciones controladas.

---

## Phase 16: Polish y Preocupaciones Transversales

**Propósito**: Mejoras que afectan a varias historias

- [X] T070 [P] Escribir pruebas de seguridad de contenido escapado en listas, búsqueda y campos personalizados y ajustar los renderizados para usar `textContent`/`escapeHtml` en `tests/unit/security.test.js`
- [X] T071 [P] Añadir prueba de rendimiento con 500 registros que verifique búsqueda y renderizado de lista <= 100 ms con actualizaciones dirigidas del DOM en `tests/integration/performance.test.js`
- [X] T072 [P] Auditoría de accesibilidad: etiquetas de formulario, orden de foco, `aria-current`, `aria-label` y estructura semántica en `src/components/`
- [X] T073 [P] Verificar que no haya términos de dominio fijos en el código central y que toda adaptación viva en `src/module-config.js`
- [X] T074 Actualizar `README.md` con estructura final, claves de almacenamiento, configuración y comandos de prueba/compilación
- [X] T075 Eliminar el script temporal malformado `check_accent.mjs` o documentar su reemplazo por la prueba de tematización
- [X] T076 Ejecutar `npm test` y corregir cualquier fallo hasta que toda la suite pase
- [X] T077 Ejecutar `npm run build` y corregir errores de compilación
- [X] T078 Validar manualmente los pasos de `quickstart.md` (crear entidad/documento, adaptar configuración, buscar)
- [X] T079 Alinear las claves de localStorage usadas en `src/storage.js` con `data-model.md` y `README.md`
- [X] T080 Revisar la lista de verificación `checklists/requirements.md` contra la implementación final y confirmar todos los criterios de aceptación

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias; puede comenzar de inmediato
- **Foundational (Phase 2)**: Depende de Setup; BLOQUEA todas las historias
- **Historias de usuario (Phases 3–15)**: Dependen de Foundational
- **Polish (Phase 16)**: Depende de las historias deseadas completadas

### User Story Dependencies

- **US1 (P1)**: Depende de Foundational (storage, shell, app router)
- **US2 (P1)**: Depende de US1 (formulario y lista de entidades)
- **US3 (P1)**: Depende de Foundational; las acciones de documento pueden adelantarse a US4
- **US4 (P1)**: Depende de US1 para la lista de entidades y de Foundational para storage de documentos
- **US5 (P1)**: Depende de Foundational (`module-config.js`); conviene completarla antes de US6 y US7
- **US6 (P1)**: Depende de US5 y de los componentes que se reetiquetan; US10/US11 deben respetar etiquetas al construirse
- **US7 (P1)**: Depende de US5 (esquema de campos) y de US1/US4 (formularios)
- **US13 (P1)**: Depende de Foundational (`shell.js`, `app.js`, estilos)
- **US8 (P2)**: Depende de US1 y de T045 (valores buscables)
- **US9 (P2)**: Depende de US1
- **US10 (P2)**: Depende de US4 (formulario/lista de documentos)
- **US11 (P2)**: Depende de US8 (lógica de búsqueda)
- **US12 (P2)**: Depende de US5 (`statusLifecycle`) y US10 (detalles de documento)

### Within Each User Story

- Las pruebas DEBEN escribirse y fallar antes de la implementación
- Modelos/almacenamiento antes de servicios, servicios antes de interfaz
- Implementación central antes de la integración con la vista
- Completar una historia antes de pasar a la siguiente prioridad (salvo trabajo en paralelo con equipo)

### Parallel Opportunities

- T002, T003 y T004 pueden ejecutarse en paralelo
- T005–T008 (pruebas de la base) pueden escribirse en paralelo
- T009–T012, T015 pueden ejecutarse en paralelo; T013–T014 son secuenciales sobre `src/storage.js`
- Las pruebas de cada historia marcadas `[P]` pueden ejecutarse en paralelo
- Las historias US1–US5 y US13 pueden iniciarse en paralelo una vez completada la base, con cuidado en archivos compartidos (`src/app.js`)
- US8, US9, US10 y US12 pueden abordarse en paralelo por distintas personas tras sus dependencias

---

## Parallel Example: User Story 1

```bash
# Lanzar primero las pruebas de US1:
Task: "Prueba de creación válida en tests/integration/us1-create-entity.test.js"
Task: "Prueba de errores obligatorios en tests/integration/us1-validation.test.js"

# Luego implementar componentes en paralelo:
Task: "Implementar src/components/entity-form.js (modo creación)"
Task: "Implementar src/components/entity-list.js"
```

## Parallel Example: Foundational

```bash
# Escribir pruebas base en paralelo:
Task: "tests/unit/storage.test.js"
Task: "tests/unit/storage-cascade.test.js"
Task: "tests/unit/module-config.test.js"
Task: "tests/unit/validation.test.js"
```

---

## Implementation Strategy

### MVP First (Setup + Foundational + US1)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (CRÍTICO, bloquea las historias)
3. Completar Phase 3: US1 (crear y listar entidades)
4. **DETENERSE y VALIDAR**: ejecutar `npm test` para US1 y verificar el flujo manual
5. Desplegar/demostrar si está listo

### Incremental Delivery

1. Setup + Foundational → base lista
2. US1 → validar → demo (MVP)
3. US2, US3, US13 → validar cada una → demo
4. US5 → US6 → US7 (configuración y adaptación)
5. US4 → US10 → US12 (documentos y ciclo de vida)
6. US8 → US11 (búsqueda)
7. US9 (fecha objetivo)
8. Polish → `npm test` + `npm run build` + quickstart

### Parallel Team Strategy

1. El equipo completa Setup + Foundational
2. Una vez lista la base:
   - Desarrollador A: US1 → US2
   - Desarrollador B: US5 → US6 → US7
   - Desarrollador C: US4 → US10 → US12
   - Desarrollador D: US13 → US3
3. US8, US9 y US11 se integran al final; resolver conflictos en `src/app.js` de forma coordinada

---

## Notes

- `[P]` indica tareas en archivos distintos y sin dependencias de tareas incompletas
- `[USx]` traza la tarea a su historia de usuario
- Cada historia debe ser completable y validable de forma independiente
- Verificar que las pruebas fallan antes de implementar
- La suite `npm test` y la compilación `npm run build` son puertas obligatorias antes de marcar tareas como completadas
- Respetar la constitución: sin backend, sin framework pesado, persistencia en localStorage, escape de contenido de usuario y etiquetas derivadas de configuración
