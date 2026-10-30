# Inicio Rápido: Sistema ERP Integral

## Configuración

1. Instalar dependencias según el stack seleccionado
2. Crear base de datos y ejecutar esquema basado en `data-model.md`
3. Configurar conexión a base de datos
4. Iniciar aplicación

## Estructura de Datos

El sistema sigue el modelo relacional completo definido en `data-model.md` con:
- 8 módulos principales + datos maestros compartidos
- Relaciones entre módulos debidamente definidas
- Referencias polimórficas para mayor flexibilidad
- Integridad referencial garantizada

## Flujo de Trabajo Típico

### Orden-a-Cobro
1. Crear cliente en CRM
2. Crear oportunidad y cotización
3. Convertir cotización a orden de venta
4. Verificar inventario y embarcar
5. Generar factura por cobrar
6. Aplicar recibo de cliente

### Compra-a-Pago
1. Crear solicitud de compra
2. Enviar RFQ a proveedores
3. Comparar cotizaciones y generar orden de compra
4. Recibir mercancía
5. Generar factura por pagar
6. Aplicar pago a proveedor

### Fabricación
1. Crear BOM y ruta para producto
2. Generar orden de producción (puede vincularse a orden de venta)
3. Consumir materiales
4. Registrar producción terminada
5. Actualizar inventario

## Validación

- Verificar integridad referencial entre módulos
- Validar relaciones circulares (departamentos-gerentes)
- Validar referencias polimórficas
- Verificar balanceo de asientos contables
- Validar trazabilidad entre documentos

## Referencias

- Modelo de datos completo: `data-model.md`
- Diagrama ERD: `erp_erd.mermaid`
- Contratos: `contracts/`
