# Contrato de Tematización (Theming)

## Propósito

Definir cómo se aplica el color de acento configurado al marco del workspace, con fallbacks seguros (FR-023).

## Configuración

En `ModuleConfig.theme`:
```javascript
theme: {
  accentColor?: string  // Color CSS válido
}
```

## Comportamiento

- Si `accentColor` está presente y es un color CSS válido -> aplicar como tema
- Si ausente, vacío o inválido -> usar valor predeterminado integrado sin errores
- Aplicación global al marco del workspace (shell, botones principales, resaltados)

## Implementación CSS

Usar propiedad personalizada CSS:

```css
:root {
  --accent-color: #0f62fe; /* predeterminado */
}
```

Aplicar desde JS:
```javascript
document.documentElement.style.setProperty('--accent-color', normalizedColor);
```

Usar en estilos:
```css
.button-primary, .nav-item.active {
  background-color: var(--accent-color);
  /* ... */
}
```

## Validación

Validar formato CSS válido. Aceptar formatos comunes:
- Hex: `#RGB`, `#RRGGBB`, `#RGBA`, `#RRGGBBAA`
- RGB/RGBA: `rgb(...)`, `rgba(...)`
- HSL/HSLA: `hsl(...)`, `hsla(...)`
- Nombres CSS válidos (opcional pero recomendado)

Si inválido -> log warning claro, no aplicar, usar fallback.

## Alcance

Aplicar al:
- Barra lateral (módulo activo)
- Botones primarios / acciones rápidas
- Enlaces destacados
- Elementos de énfasis en el marco

No forzar tema completo; mantener paleta base fija (supuesto del spec).

## Integración

- `src/module-config.js`: validar `accentColor`
- `src/app.js`: aplicar variable CSS al cargar
- `src/styles.css`: usar `var(--accent-color)` con fallback

## Pruebas esperadas

- Color válido se aplica
- Color inválido usa fallback sin error fatal
- Ausente usa fallback
- Se aplica consistentemente en todo el marco
