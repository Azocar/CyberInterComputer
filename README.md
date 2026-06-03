# Cyber Inter Computer - Control de Inventario y POS

Este proyecto es una aplicación web interactiva diseñada tanto para la gestión operativa como para la enseñanza educativa de la **Teoría de Modelos de Inventarios**. Está ambientada en el contexto de **Cyber Inter Computer**, un negocio que gestiona consumibles de servicio (como papel y tóner) y productos de venta directa (como pendrives y audífonos).

El sistema incluye una simulación interactiva con base de datos local persistente, un módulo de punto de venta (POS), registro de compras con cálculo del Costo Promedio Ponderado, y alertas en tiempo real de bajo stock.

---

## 📚 Teoría de Modelos de Inventarios

### 1. Definición de Inventario
El inventario representa la acumulación de materiales tangibles (materias primas, artículos en proceso o productos terminados) necesarios para asegurar el flujo operativo del negocio. 
En el contexto de **Cyber Inter Computer**, la gestión óptima de existencias evita:
- **Rupturas de stock (Stockouts):** Detener el servicio de impresión por falta de resmas de papel o tóner.
- **Costos excesivos de almacenamiento:** Tener capital inmovilizado en exceso de productos de baja rotación.

---

### 2. Clasificación de Artículos
El sistema clasifica el inventario en dos categorías estratégicas:
- **Consumibles de Servicio:** Artículos de soporte operativo diario (ej. resmas de papel bond A4, tóners). Su consumo está directamente ligado al volumen de servicios prestados (impresiones, copias).
- **Productos de Venta Directa:** Artículos listos para el cliente final (ej. pendrives, audífonos gamer, combos escolares).

---

### 3. Modelos Determinísticos de Inventario

Los modelos determinísticos asumen que la demanda, los costos y los tiempos de entrega son conocidos con certeza. El sistema implementa y detalla cuatro modelos principales:

#### A. Modelos de Compra (Adquisición Externa)
Se aplican cuando el negocio compra productos listos a proveedores externos.

1. **EOQ Clásico (Cantidad Económica de Pedido - Sin Escasez):**
   - **Concepto:** Las compras ingresan instantáneamente al almacén justo cuando el inventario llega a cero. No se permite escasez para proteger el servicio.
   - **Fórmula del Lote Óptimo ($Q^*$):**
     $$Q^* = \sqrt{\frac{2 \cdot D \cdot K}{h}}$$
     *Donde:*
     - $D$: Demanda anual (unidades/año).
     - $K$: Costo de pedir o realizar una orden ($/pedido).
     - $h$: Costo unitario de mantener inventario ($/unidad-año).
   - **Objetivo:** Minimizar la suma del costo de pedir y el costo de mantener stock.

2. **Compra con Escasez Diferida (Faltantes Permitidos):**
   - **Concepto:** Se permite planificar faltantes (escasez). Los clientes aceptan una demora en la entrega y se les despacha tan pronto llega el pedido. Reduce el inventario promedio y sus costos de tenencia a cambio de un costo de penalización por faltante ($p$).
   - **Fórmula de la Cantidad Óptima ($Q^*$):**
     $$Q^* = \sqrt{\frac{2 \cdot D \cdot K}{h} \cdot \left(\frac{h + p}{p}\right)}$$
     *Donde:*
     - $p$: Costo unitario de escasez o penalización ($/unidad-año).

---

#### B. Modelos de Manufacturación (Producción Interna)
Se aplican cuando el negocio produce o ensambla sus propios artículos a una tasa de producción constante $P$.

1. **POQ (Cantidad de Pedido de Producción - Sin Escasez):**
   - **Concepto:** El inventario se abastece de forma gradual a una tasa de producción $P$ superior a la demanda diaria $D$. No hay reabastecimiento instantáneo, sino una fase de acumulación hasta alcanzar el inventario máximo y luego una fase de consumo puro.
   - **Fórmula del Lote Óptimo de Producción ($Q^*$):**
     $$Q^* = \sqrt{\frac{2 \cdot D \cdot K}{h \cdot \left(1 - \frac{D}{P}\right)}}$$

2. **Manufacturación con Escasez Diferida:**
   - **Concepto:** Combina la producción gradual con la planificación de escasez (órdenes pendientes). El lote óptimo se calcula considerando tanto la tasa de producción como los costos de almacenamiento y penalizaciones por faltante.

---

### 4. Gráfico Determinístico de Dientes de Sierra (Sawtooth)

El comportamiento de los modelos determinísticos se representa visualmente mediante el gráfico de **Dientes de Sierra**, el cual ilustra el nivel de existencias en función del tiempo:

```
Nivel de Stock (Q)
   ^
Q  |    /\         /\
   |   /  \       /  \
R  |  /....\...../....\   <-- Punto de Reorden (R)
   | /      \   /      \
0  +---------\-/--------\---> Tiempo (t)
             | |
             |Lt|         <-- Lead Time (Tiempo de demora)
```

**Variables Clave:**
- **$Q$ (Cantidad del Lote):** El tamaño del pedido solicitado al proveedor.
- **$R$ (Punto de Reorden):** El nivel de stock crítico que gatilla un nuevo pedido. Se calcula como:
  $$R = d \cdot L_t$$
  *Donde $d$ es la demanda promedio diaria y $L_t$ (Lead Time) es el tiempo de entrega del proveedor.*
- **$L_t$ (Lead Time o Demora):** El tiempo que transcurre desde que se emite la orden de compra hasta que los productos están físicamente disponibles en el almacén.
- **Consumo Diario ($-D$):** La pendiente negativa que representa la salida constante de mercancías debido a las ventas diarias.

---

## 🛠️ Funcionamiento y Características de la Aplicación

El desarrollo técnico de la plataforma fue estructurado bajo las siguientes directrices:

1. **Base de Datos Simulada en LocalStorage:**
   Toda la persistencia de productos y transacciones se realiza de manera local en el navegador. Si refrescas la página, tus cambios se mantienen. Incluye un botón para restaurar los datos predeterminados en cualquier momento.

2. **Punto de Venta (POS) en Tiempo Real:**
   Permite agregar múltiples artículos al carrito de compra. Al procesar el cobro:
   - Se valida la existencia física en almacén.
   - Se descuentan las unidades vendidas en la base de datos de manera atómica.
   - Se genera una transacción en el historial.

3. **Costo Promedio Ponderado (Weighted Average Cost):**
   Al ingresar nuevas compras a través del formulario de adquisición, el sistema recalcula automáticamente el costo del producto utilizando la fórmula financiera:
   $$Costo\ Promedio = \frac{(Stock\ Anterior \cdot Costo\ Promedio\ Anterior) + (Cantidad\ Nueva \cdot Costo\ de\ Compra\ Nuevo)}{Stock\ Total\ Nuevo}$$

4. **Alertas de Reorden Visuales:**
   Los productos cuyo stock cae por debajo de su **Stock Mínimo (Punto de Reorden)** se destacan automáticamente en color rojo en la tabla. Además, se actualiza el indicador de alertas del panel de control principal y se emiten notificaciones emergentes (toasts) dinámicas.

---

## 👥 Equipo de Trabajo - Sección IF02

Este proyecto fue desarrollado por el grupo de trabajo de la sección **IF02**:

- 👨‍💻 **Gabriel Azócar** — C.I. `19.789.539`
- 👩‍💻 **Nancy Rodriguez** — C.I. `12.664.288`
- 👩‍💻 **Rodilis Zapata** — C.I. `19.630.763`
- 👨‍💻 **Ramon Morao** — C.I. `30.545.105`

---

## 🚀 Instalación y Uso Local

La aplicación es completamente "serverless" del lado del cliente, por lo que no requiere bases de datos complejas instaladas localmente.

### Requisitos
- Un navegador web moderno (Chrome, Edge, Firefox, Safari).

### Ejecución
1. Descarga o clona este repositorio en tu máquina:
   ```bash
   git clone https://github.com/Azocar/CyberInterComputer.git
   ```
2. Navega al directorio del proyecto:
   ```bash
   cd cyber-inventory-app
   ```
3. Abre el archivo `index.html` en tu navegador favorito haciendo doble clic sobre él o sirviéndolo localmente.
