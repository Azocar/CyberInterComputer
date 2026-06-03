// ==========================================================================
// Application Defaults & Constants
// ==========================================================================

const DEFAULT_PRODUCTS = [
    {
        id: 1,
        nombre: "Resmas de Papel Bond A4",
        descripcion: "Papel de 75g, 500 hojas para copiado e impresiones",
        clasificacion: "Consumible",
        stock_actual: 15,
        stock_minimo: 5,
        precio_compra: 4.50,
        costo_promedio: 4.50,
        precio_venta: 6.00
    },
    {
        id: 2,
        nombre: "Tóner Impresora HP Monocromático",
        descripcion: "Rendimiento para 2000 impresiones de texto",
        clasificacion: "Consumible",
        stock_actual: 4,
        stock_minimo: 2,
        precio_compra: 35.00,
        costo_promedio: 35.00,
        precio_venta: 50.00
    },
    {
        id: 3,
        nombre: "Pendrives Kingston 64GB USB 3.2",
        descripcion: "Memorias flash de alta velocidad para venta directa",
        clasificacion: "Venta Directa",
        stock_actual: 10,
        stock_minimo: 3,
        precio_compra: 5.50,
        costo_promedio: 5.50,
        precio_venta: 9.00
    },
    {
        id: 4,
        nombre: "Audífonos de Diadema con Micrófono",
        descripcion: "Para cabina de internet o venta a estudiantes",
        clasificacion: "Venta Directa",
        stock_actual: 6,
        stock_minimo: 2,
        precio_compra: 12.00,
        costo_promedio: 12.00,
        precio_venta: 18.50
    },
    {
        id: 5,
        nombre: "Combo Escolar Básico",
        descripcion: "Cuaderno + Bolígrafo + Lápiz (Empacado en local)",
        clasificacion: "Venta Directa",
        stock_actual: 8,
        stock_minimo: 3,
        precio_compra: 3.00,
        costo_promedio: 3.00,
        precio_venta: 5.00
    }
];

const DEFAULT_TRANSACTIONS = [
    {
        id: 1,
        producto_id: 1,
        producto_nombre: "Resmas de Papel Bond A4",
        cantidad: 20,
        valor_total: 90.00,
        fecha: "2026-06-01 10:15",
        tipo: "Compra",
        detalle: "Proveedor: Papelera Nacional S.A."
    },
    {
        id: 2,
        producto_id: 1,
        producto_nombre: "Resmas de Papel Bond A4",
        cantidad: 5,
        valor_total: 30.00,
        fecha: "2026-06-02 14:30",
        tipo: "Venta",
        detalle: "Consumo Interno (Impresión)"
    },
    {
        id: 3,
        producto_id: 3,
        producto_nombre: "Pendrives Kingston 64GB USB 3.2",
        cantidad: 2,
        valor_total: 18.00,
        fecha: "2026-06-03 09:45",
        tipo: "Venta",
        detalle: "Venta Directa (Efectivo)"
    }
];

// ==========================================================================
// Class Definition: CyberInventoryApp
// ==========================================================================

class CyberInventoryApp {
    constructor() {
        // Load data from LocalStorage or initialize with defaults
        this.products = this.loadFromStorage('cyber_products', DEFAULT_PRODUCTS);
        this.transactions = this.loadFromStorage('cyber_transactions', DEFAULT_TRANSACTIONS);
        
        // Active states for filters and checkout
        this.searchQuery = "";
        this.filterClassification = "All";
        this.filterStockStatus = "All"; // 'All' or 'Low'
        this.filterLogType = "All"; // 'All', 'Compra' or 'Venta'
        
        this.cart = []; // POS cart state: { id, nombre, precio_venta, cantidad, stock_actual }
        
        // DOM cache
        this.dom = {};
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.initClock();
        this.renderAll();
        
        this.showToast("Sistema Conectado", "Base de datos local iniciada correctamente.", "success");
    }

    // ==========================================================================
    // LocalStorage Helper Functions
    // ==========================================================================
    loadFromStorage(key, defaultVal) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultVal;
        } catch (e) {
            console.error("Error reading LocalStorage", e);
            return defaultVal;
        }
    }

    saveToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error("Error writing to LocalStorage", e);
        }
    }

    cacheDOM() {
        this.dom.clock = document.getElementById('system-clock');
        this.dom.resetBtn = document.getElementById('reset-sim-btn');
        this.dom.toastContainer = document.getElementById('toast-container');

        // Dashboard Stats
        this.dom.statProducts = document.getElementById('stat-total-products');
        this.dom.statValue = document.getElementById('stat-total-value');
        this.dom.statTransactions = document.getElementById('stat-total-transactions');
        this.dom.statRatio = document.getElementById('stat-sales-purchases-ratio');
        this.dom.statAlertsCard = document.getElementById('stat-alerts-card');
        this.dom.statReorderAlerts = document.getElementById('stat-reorder-alerts');
        this.dom.statAlertStatus = document.getElementById('stat-alert-status');

        // Tables, Filters & Lists
        this.dom.productsTableBody = document.getElementById('products-table-body');
        this.dom.searchInput = document.getElementById('search-input');
        this.dom.filterClass = document.getElementById('filter-classification');
        this.dom.btnStockAll = document.getElementById('btn-filter-stock-all');
        this.dom.btnStockLow = document.getElementById('btn-filter-stock-low');
        this.dom.historyList = document.getElementById('transaction-history-list');

        // History Log Filters
        this.dom.logFilterAll = document.getElementById('log-filter-all');
        this.dom.logFilterIn = document.getElementById('log-filter-in');
        this.dom.logFilterOut = document.getElementById('log-filter-out');

        // POS Elements
        this.dom.cartList = document.getElementById('pos-cart-list');
        this.dom.cartTotal = document.getElementById('pos-cart-total');
        this.dom.paymentType = document.getElementById('pos-payment-type');
        this.dom.clearCartBtn = document.getElementById('pos-clear-btn');
        this.dom.checkoutBtn = document.getElementById('pos-checkout-btn');
        this.dom.posItemsBadge = document.getElementById('pos-items-count');

        // Modals
        this.dom.modalProduct = document.getElementById('modal-product');
        this.dom.closeProductBtn = document.getElementById('close-modal-product-btn');
        this.dom.cancelProductBtn = document.getElementById('cancel-product-btn');
        this.dom.productForm = document.getElementById('product-form');
        this.dom.modalProductTitle = document.getElementById('modal-product-title');
        this.dom.saveProductSubmitBtn = document.getElementById('save-product-submit-btn');

        // Modal inputs
        this.dom.pId = document.getElementById('p-id');
        this.dom.pNombre = document.getElementById('p-nombre');
        this.dom.pDescripcion = document.getElementById('p-descripcion');
        this.dom.pClasificacion = document.getElementById('p-clasificacion');
        this.dom.pStockMin = document.getElementById('p-stock-min');
        this.dom.pStockActual = document.getElementById('p-stock-actual');
        this.dom.pPrecioCompra = document.getElementById('p-precio-compra');
        this.dom.pPrecioVenta = document.getElementById('p-precio-venta');
        this.dom.stockFieldGroup = document.getElementById('stock-inicial-field-group');

        // Inline Purchase Form
        this.dom.entradaFormInline = document.getElementById('entrada-form-inline');
        this.dom.entProductSelect = document.getElementById('ent-producto-id');
        this.dom.entCantidad = document.getElementById('ent-cantidad');
        this.dom.entCosto = document.getElementById('ent-costo');
        this.dom.entProveedor = document.getElementById('ent-proveedor');
        this.dom.addProductBtn = document.getElementById('add-product-btn');
        this.dom.theoryToggleBtn = document.getElementById('theory-toggle-btn');
        this.dom.theoryContent = document.getElementById('theory-content');
    }

    bindEvents() {
        // Reset base de datos
        this.dom.resetBtn.addEventListener('click', () => this.factoryReset());

        // Search & Filters inputs
        this.dom.searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.renderProductsTable();
        });
        
        this.dom.filterClass.addEventListener('change', (e) => {
            this.filterClassification = e.target.value;
            this.renderProductsTable();
        });

        this.dom.btnStockAll.addEventListener('click', () => {
            this.dom.btnStockAll.classList.add('active');
            this.dom.btnStockLow.classList.remove('active');
            this.filterStockStatus = "All";
            this.renderProductsTable();
        });

        this.dom.btnStockLow.addEventListener('click', () => {
            this.dom.btnStockLow.classList.add('active');
            this.dom.btnStockAll.classList.remove('active');
            this.filterStockStatus = "Low";
            this.renderProductsTable();
        });

        // Log filters
        this.dom.logFilterAll.addEventListener('click', () => {
            this.dom.logFilterAll.classList.add('active');
            this.dom.logFilterIn.classList.remove('active');
            this.dom.logFilterOut.classList.remove('active');
            this.filterLogType = "All";
            this.renderHistoryLog();
        });

        this.dom.logFilterIn.addEventListener('click', () => {
            this.dom.logFilterIn.classList.add('active');
            this.dom.logFilterAll.classList.remove('active');
            this.dom.logFilterOut.classList.remove('active');
            this.filterLogType = "Compra";
            this.renderHistoryLog();
        });

        this.dom.logFilterOut.addEventListener('click', () => {
            this.dom.logFilterOut.classList.add('active');
            this.dom.logFilterAll.classList.remove('active');
            this.dom.logFilterIn.classList.remove('active');
            this.filterLogType = "Venta";
            this.renderHistoryLog();
        });

        // Cart Actions
        this.dom.clearCartBtn.addEventListener('click', () => this.clearCart());
        this.dom.checkoutBtn.addEventListener('click', () => this.checkoutPOS());

        // Add Product Trigger
        this.dom.addProductBtn.addEventListener('click', () => this.openAddModal());

        // Modal Action Buttons (Close/Cancel)
        const closeProductModal = () => this.closeModal();
        this.dom.closeProductBtn.addEventListener('click', closeProductModal);
        this.dom.cancelProductBtn.addEventListener('click', closeProductModal);

        // Product Form Submit (Create/Update)
        this.dom.productForm.addEventListener('submit', (e) => this.handleProductSubmit(e));

        // Inline Purchase Form select change and Submit
        this.dom.entProductSelect.addEventListener('change', () => {
            const prodId = parseInt(this.dom.entProductSelect.value);
            const product = this.products.find(p => p.id === prodId);
            if (product) {
                this.dom.entCosto.value = product.precio_compra.toFixed(2);
            }
        });

        this.dom.entradaFormInline.addEventListener('submit', (e) => this.handlePurchaseSubmit(e));
        this.dom.theoryToggleBtn.addEventListener('click', () => this.toggleTheoryPanel());
    }

    initClock() {
        const updateTime = () => {
            const now = new Date();
            this.dom.clock.textContent = now.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit', second:'2-digit'});
        };
        updateTime();
        setInterval(updateTime, 1000);
    }

    factoryReset() {
        if (confirm("¿Estás seguro de que deseas restablecer todos los productos y transacciones a sus valores predeterminados?")) {
            this.products = DEFAULT_PRODUCTS.map(p => ({...p}));
            this.transactions = DEFAULT_TRANSACTIONS.map(t => ({...t}));
            this.cart = [];
            
            this.saveToStorage('cyber_products', this.products);
            this.saveToStorage('cyber_transactions', this.transactions);
            
            this.renderAll();
            this.showToast("Base de Datos Restablecida", "Se han cargado los productos predeterminados.", "warning");
        }
    }

    renderAll() {
        this.renderProductsTable();
        this.renderHistoryLog();
        this.renderStats();
        this.renderCart();
        this.populateProductSelect();
    }

    // ==========================================================================
    // Render Functions
    // ==========================================================================

    renderProductsTable() {
        this.dom.productsTableBody.innerHTML = '';
        
        // Filter products list
        const filtered = this.products.filter(p => {
            const matchesSearch = p.nombre.toLowerCase().includes(this.searchQuery.toLowerCase());
            
            const matchesClass = this.filterClassification === "All" || p.clasificacion === this.filterClassification;
            
            let matchesStock = true;
            if (this.filterStockStatus === "Low") {
                matchesStock = p.stock_actual <= p.stock_minimo;
            }
            
            return matchesSearch && matchesClass && matchesStock;
        });

        if (filtered.length === 0) {
            this.dom.productsTableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center" style="color: var(--text-muted); padding: 2rem 0;">
                        No se encontraron productos con los filtros seleccionados.
                    </td>
                </tr>
            `;
            return;
        }

        filtered.forEach(p => {
            const isReorderActive = p.stock_actual <= p.stock_minimo;
            const margin = ((p.precio_venta - p.costo_promedio) / p.precio_venta) * 100;
            
            const tr = document.createElement('tr');
            if (isReorderActive) {
                tr.classList.add('alert-row');
            }

            tr.innerHTML = `
                <td>#${p.id}</td>
                <td>
                    <strong style="color: var(--text-main);">${p.nombre}</strong>
                    <span style="display:block; font-size:0.75rem; color:var(--text-muted);">${p.descripcion}</span>
                </td>
                <td>
                    <span class="badge ${p.clasificacion === 'Consumible' ? 'badge-purple' : 'badge-emerald'}">
                        ${p.clasificacion}
                    </span>
                </td>
                <td class="text-right font-heading" style="font-weight:700; ${isReorderActive ? 'color: var(--color-danger); text-shadow: 0 0 4px var(--color-danger-glow);' : ''}">
                    ${p.stock_actual}
                </td>
                <td class="text-right font-heading" style="font-weight:600; color:var(--color-warning);">
                    ${p.stock_minimo}
                </td>
                <td class="text-right">
                    <span style="font-size: 0.8rem; color: var(--text-muted); text-decoration: line-through; display:block;">$${p.precio_compra.toFixed(2)}</span>
                    <strong class="font-heading">$${p.costo_promedio.toFixed(2)}</strong>
                </td>
                <td class="text-right font-heading" style="font-weight:600;">
                    $${p.precio_venta.toFixed(2)}
                </td>
                <td class="text-center font-heading">
                    <span class="badge badge-emerald" style="background-color: hsla(145, 80%, 45%, 0.05); color: var(--color-success);">
                        ${margin.toFixed(0)}%
                    </span>
                </td>
                <td>
                    <div class="actions-cell">
                        <button class="btn btn-emerald btn-sm" onclick="app.addToCart(${p.id})" title="Agregar al Carrito POS" ${p.stock_actual === 0 ? 'disabled' : ''}>
                            + Venta
                        </button>
                        <button class="btn btn-secondary btn-icon-only btn-sm" onclick="app.openEditModal(${p.id})" title="Editar Producto">
                            ✏️
                        </button>
                        <button class="btn btn-rose btn-icon-only btn-sm" onclick="app.deleteProduct(${p.id})" title="Eliminar Producto">
                            &times;
                        </button>
                    </div>
                </td>
            `;
            this.dom.productsTableBody.appendChild(tr);
        });
    }

    renderHistoryLog() {
        this.dom.historyList.innerHTML = '';
        
        let filteredLog = this.transactions;
        if (this.filterLogType !== "All") {
            filteredLog = this.transactions.filter(t => t.tipo === this.filterLogType);
        }

        const sorted = [...filteredLog].sort((a,b) => b.id - a.id);
        
        if (sorted.length === 0) {
            this.dom.historyList.innerHTML = `
                <div style="text-align: center; padding: 2rem 0; color: var(--text-muted); font-size: 0.8rem;">
                    Sin movimientos registrados.
                </div>
            `;
            return;
        }

        sorted.forEach(t => {
            const isPurchase = t.tipo === 'Compra';
            
            const div = document.createElement('div');
            div.classList.add('history-item');
            div.innerHTML = `
                <div class="history-badge ${isPurchase ? 'in' : 'out'}">
                    ${isPurchase ? '📥' : '📤'}
                </div>
                <div class="history-details">
                    <h4>${t.producto_nombre}</h4>
                    <p>${t.detalle} | ${t.fecha}</p>
                </div>
                <div class="history-value ${isPurchase ? 'positive' : 'negative'}">
                    ${isPurchase ? '+' : '-'}${t.cantidad}
                    <span style="display:block; font-size:0.75rem; color:var(--text-muted); font-weight:500;">
                        $${t.valor_total.toFixed(2)}
                    </span>
                </div>
            `;
            this.dom.historyList.appendChild(div);
        });
    }

    renderStats() {
        // Total products count
        this.dom.statProducts.textContent = this.products.length;
        
        // Categories counter
        const categories = new Set(this.products.map(p => p.clasificacion));
        document.getElementById('stat-categories-count').textContent = `${categories.size} Categorías`;

        // Total inventory valuation
        const totalVal = this.products.reduce((acc, p) => acc + (p.stock_actual * p.costo_promedio), 0);
        this.dom.statValue.textContent = `$${totalVal.toFixed(2)}`;

        // Total sales/transactions transactions
        const salesTransactions = this.transactions.filter(t => t.tipo === 'Venta');
        this.dom.statTransactions.textContent = salesTransactions.length;
        
        const totalRevenue = salesTransactions.reduce((acc, t) => acc + t.valor_total, 0);
        this.dom.statRatio.textContent = `Ingresos: $${totalRevenue.toFixed(2)}`;

        // Active alerts (Low stock)
        const lowStockCount = this.products.filter(p => p.stock_actual <= p.stock_minimo).length;
        this.dom.statReorderAlerts.textContent = lowStockCount;
        
        if (lowStockCount > 0) {
            this.dom.statAlertsCard.classList.add('warning-active');
            this.dom.statAlertStatus.textContent = `${lowStockCount} Alertas de Stock`;
            this.dom.statAlertStatus.className = "stat-subtext text-danger";
        } else {
            this.dom.statAlertsCard.classList.remove('warning-active');
            this.dom.statAlertStatus.textContent = "Existencias Óptimas";
            this.dom.statAlertStatus.className = "stat-subtext text-success";
        }
    }

    populateProductSelect() {
        this.dom.entProductSelect.innerHTML = '';
        
        this.products.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.nombre;
            this.dom.entProductSelect.appendChild(opt);
        });

        if (this.products.length > 0) {
            const firstProd = this.products[0];
            this.dom.entCosto.value = firstProd.precio_compra.toFixed(2);
        }
    }

    // ==========================================================================
    // POS Cart Operations
    // ==========================================================================

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Check if there is physical stock
        if (product.stock_actual <= 0) {
            this.showToast("Stock Agotado", `No hay stock físico disponible para ${product.nombre}`, "danger");
            return;
        }

        const existing = this.cart.find(item => item.product_id === productId);
        if (existing) {
            if (existing.cantidad + 1 > product.stock_actual) {
                this.showToast("Límite de Stock", `Solo hay ${product.stock_actual} unidades físicas de ${product.nombre}`, "warning");
                return;
            }
            existing.cantidad += 1;
        } else {
            this.cart.push({
                product_id: productId,
                nombre: product.nombre,
                precio_venta: product.precio_venta,
                cantidad: 1,
                stock_actual: product.stock_actual
            });
        }

        this.renderCart();
        this.showToast("Producto Agregado", `${product.nombre} añadido al carrito POS.`, "success");
    }

    updateCartQty(productId, amount) {
        const item = this.cart.find(i => i.product_id === productId);
        if (!item) return;

        const newQty = item.cantidad + amount;
        
        if (newQty <= 0) {
            this.removeFromCart(productId);
            return;
        }

        // Validate stock limit
        if (newQty > item.stock_actual) {
            this.showToast("Límite de Stock", `Solo hay ${item.stock_actual} unidades físicas disponibles.`, "warning");
            return;
        }

        item.cantidad = newQty;
        this.renderCart();
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.product_id !== productId);
        this.renderCart();
    }

    clearCart() {
        this.cart = [];
        this.renderCart();
    }

    renderCart() {
        this.dom.cartList.innerHTML = '';
        
        if (this.cart.length === 0) {
            this.dom.cartList.innerHTML = `
                <div class="empty-cart-prompt">
                    <p>🛒 Carrito Vacío</p>
                    <span>Haz clic en "+ Venta" en la tabla para agregar productos.</span>
                </div>
            `;
            this.dom.cartTotal.textContent = "$0.00";
            this.dom.checkoutBtn.disabled = true;
            this.dom.posItemsBadge.textContent = "0 items";
            this.dom.posItemsBadge.className = "badge badge-purple";
            return;
        }

        let total = 0;
        let itemsCount = 0;

        this.cart.forEach(item => {
            const itemTotal = item.precio_venta * item.cantidad;
            total += itemTotal;
            itemsCount += item.cantidad;

            const div = document.createElement('div');
            div.className = 'pos-cart-item';
            div.innerHTML = `
                <div class="pos-cart-item-info">
                    <h4>${item.nombre}</h4>
                    <p>$${item.precio_venta.toFixed(2)} c/u</p>
                </div>
                <div class="pos-cart-qty-ctrl">
                    <button class="btn-qty" onclick="app.updateCartQty(${item.product_id}, -1)">-</button>
                    <span>${item.cantidad}</span>
                    <button class="btn-qty" onclick="app.updateCartQty(${item.product_id}, 1)">+</button>
                </div>
                <div class="pos-cart-item-price">
                    $${itemTotal.toFixed(2)}
                </div>
                <button class="btn-cart-remove" onclick="app.removeFromCart(${item.product_id})">&times;</button>
            `;
            this.dom.cartList.appendChild(div);
        });

        this.dom.cartTotal.textContent = `$${total.toFixed(2)}`;
        this.dom.checkoutBtn.disabled = false;
        this.dom.posItemsBadge.textContent = `${itemsCount} ${itemsCount === 1 ? 'item' : 'items'}`;
        this.dom.posItemsBadge.className = "badge badge-emerald";
    }

    checkoutPOS() {
        if (this.cart.length === 0) return;

        const payment = this.dom.paymentType.value;
        let groupedNames = [];
        let totalVal = 0;
        let totalQty = 0;

        // Perform stock updates
        this.cart.forEach(cartItem => {
            const product = this.products.find(p => p.id === cartItem.product_id);
            if (product) {
                product.stock_actual -= cartItem.cantidad;
                groupedNames.push(`${product.nombre} (x${cartItem.cantidad})`);
                totalVal += product.precio_venta * cartItem.cantidad;
                totalQty += cartItem.cantidad;
            }
        });

        // Register consolidated transaction
        const now = new Date();
        const dateStr = now.toISOString().replace('T', ' ').substring(0, 16);

        this.transactions.push({
            id: this.transactions.length + 1,
            producto_id: this.cart[0].product_id, // Reference first ID
            producto_nombre: this.cart.length === 1 ? this.cart[0].nombre : "Venta Múltiple",
            cantidad: totalQty,
            valor_total: totalVal,
            fecha: dateStr,
            tipo: "Venta",
            detalle: `${payment}: ${groupedNames.join(', ')}`
        });

        // Check if any product has fallen below stock limit
        this.cart.forEach(cartItem => {
            const product = this.products.find(p => p.id === cartItem.product_id);
            if (product && product.stock_actual <= product.stock_minimo) {
                this.showToast("Bajo Stock", `🚨 ${product.nombre} ha alcanzado el punto de reorden (${product.stock_actual} unid. restantes).`, "danger");
            }
        });

        // Clean cart and save
        this.cart = [];
        this.saveToStorage('cyber_products', this.products);
        this.saveToStorage('cyber_transactions', this.transactions);
        
        this.renderAll();
        this.showToast("Venta Exitosa", `Se procesó el cobro de $${totalVal.toFixed(2)} por ${payment}.`, "success");
    }

    // ==========================================================================
    // CRUD Operations & Forms
    // ==========================================================================

    openAddModal() {
        this.dom.modalProductTitle.textContent = "Registrar Nuevo Producto";
        this.dom.saveProductSubmitBtn.textContent = "Guardar Producto";
        
        this.dom.pId.value = "";
        this.dom.productForm.reset();
        
        // Show stock actual for new items
        this.dom.stockFieldGroup.style.display = 'block';
        this.dom.pStockActual.required = true;

        this.dom.modalProduct.classList.add('active');
    }

    openEditModal(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        this.dom.modalProductTitle.textContent = "Editar Producto";
        this.dom.saveProductSubmitBtn.textContent = "Guardar Cambios";

        this.dom.pId.value = product.id;
        this.dom.pNombre.value = product.nombre;
        this.dom.pDescripcion.value = product.descripcion;
        this.dom.pClasificacion.value = product.clasificacion;
        this.dom.pStockMin.value = product.stock_minimo;
        this.dom.pPrecioCompra.value = product.precio_compra;
        this.dom.pPrecioVenta.value = product.precio_venta;

        // Hide stock actual input for edit (stocks are modified via Purchases/Entradas and POS/Salidas only)
        this.dom.stockFieldGroup.style.display = 'none';
        this.dom.pStockActual.required = false;

        this.dom.modalProduct.classList.add('active');
    }

    closeModal() {
        this.dom.modalProduct.classList.remove('active');
    }

    handleProductSubmit(e) {
        e.preventDefault();

        const idVal = this.dom.pId.value;
        const nombreVal = this.dom.pNombre.value;
        const descVal = this.dom.pDescripcion.value;
        const classVal = this.dom.pClasificacion.value;
        const minVal = parseInt(this.dom.pStockMin.value);
        const costVal = parseFloat(this.dom.pPrecioCompra.value);
        const sellVal = parseFloat(this.dom.pPrecioVenta.value);

        if (idVal === "") {
            // Create mode
            const initStock = parseInt(this.dom.pStockActual.value);
            
            const newProduct = {
                id: this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) + 1 : 1,
                nombre: nombreVal,
                descripcion: descVal,
                clasificacion: classVal,
                stock_actual: initStock,
                stock_minimo: minVal,
                precio_compra: costVal,
                costo_promedio: costVal,
                precio_venta: sellVal
            };

            this.products.push(newProduct);
            this.showToast("Producto Guardado", `"${newProduct.nombre}" agregado con stock inicial de ${initStock}.`, "success");
        } else {
            // Edit mode
            const editId = parseInt(idVal);
            const product = this.products.find(p => p.id === editId);
            if (product) {
                // If purchase cost changes directly, let's adjust cost promedio accordingly
                if (product.precio_compra !== costVal) {
                    product.costo_promedio = costVal; 
                }
                
                product.nombre = nombreVal;
                product.descripcion = descVal;
                product.clasificacion = classVal;
                product.stock_minimo = minVal;
                product.precio_compra = costVal;
                product.precio_venta = sellVal;
                
                this.showToast("Producto Modificado", `"${product.nombre}" actualizado con éxito.`, "success");
            }
        }

        this.saveToStorage('cyber_products', this.products);
        this.closeModal();
        this.renderAll();
    }

    deleteProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        if (confirm(`¿Estás seguro de que deseas eliminar permanentemente el producto "${product.nombre}" de la base de datos de inventario?`)) {
            // Remove from cart if present
            this.removeFromCart(productId);
            
            // Remove from catalog
            this.products = this.products.filter(p => p.id !== productId);
            
            this.saveToStorage('cyber_products', this.products);
            this.renderAll();
            this.showToast("Producto Eliminado", `Se eliminó "${product.nombre}" del catálogo.`, "warning");
        }
    }

    handlePurchaseSubmit(e) {
        e.preventDefault();

        const prodId = parseInt(this.dom.entProductSelect.value);
        const qtyVal = parseInt(this.dom.entCantidad.value);
        const costVal = parseFloat(this.dom.entCosto.value);
        const provVal = this.dom.entProveedor.value;

        const product = this.products.find(p => p.id === prodId);
        if (!product) return;

        // Perform weighted average cost calculation
        const stockPrev = product.stock_actual;
        const totalPrevCost = stockPrev * product.costo_promedio;
        const newBatchCost = qtyVal * costVal;
        
        const newStock = stockPrev + qtyVal;
        const newAverage = (totalPrevCost + newBatchCost) / newStock;

        product.stock_actual = newStock;
        product.precio_compra = costVal;
        product.costo_promedio = Math.round(newAverage * 100) / 100;

        // Register purchase transaction
        const now = new Date();
        const dateStr = now.toISOString().replace('T', ' ').substring(0, 16);

        this.transactions.push({
            id: this.transactions.length + 1,
            producto_id: prodId,
            producto_nombre: product.nombre,
            cantidad: qtyVal,
            valor_total: newBatchCost,
            fecha: dateStr,
            tipo: "Compra",
            detalle: `Proveedor: ${provVal}`
        });

        // Save
        this.saveToStorage('cyber_products', this.products);
        this.saveToStorage('cyber_transactions', this.transactions);
        
        this.dom.entradaFormInline.reset();
        this.renderAll();
        
        this.showToast("Adquisición Completada", `Ingresaron ${qtyVal} unidades de ${product.nombre}. Costo promedio: $${product.costo_promedio.toFixed(2)}.`, "success");
    }

    // ==========================================================================
    // Toast Notification System
    // ==========================================================================

    showToast(title, message, type = "success") {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = "🔔";
        if (type === "success") icon = "✅";
        if (type === "danger") icon = "🚨";
        if (type === "warning") icon = "⚠️";

        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-msg">${message}</div>
            </div>
            <button class="toast-close" onclick="app.removeToast(this.parentElement)">&times;</button>
            <div class="toast-progress"></div>
        `;

        this.dom.toastContainer.appendChild(toast);

        // Progress bar animation
        const progressBar = toast.querySelector('.toast-progress');
        progressBar.style.transition = 'width 4.5s linear';
        // Trigger reflow
        progressBar.offsetWidth;
        progressBar.style.width = '0%';

        // Auto remove toast
        setTimeout(() => {
            this.removeToast(toast);
        }, 4500);
    }

    removeToast(toastElement) {
        if (!toastElement) return;
        toastElement.classList.add('removing');
        setTimeout(() => {
            if (toastElement.parentNode) {
                toastElement.parentNode.removeChild(toastElement);
            }
        }, 300);
    }

    toggleTheoryPanel() {
        const isExpanded = this.dom.theoryContent.classList.contains('expanded');
        if (isExpanded) {
            this.dom.theoryContent.classList.remove('expanded');
            this.dom.theoryToggleBtn.classList.remove('expanded');
        } else {
            this.dom.theoryContent.classList.add('expanded');
            this.dom.theoryToggleBtn.classList.add('expanded');
        }
    }
}

// Instantiate App
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new CyberInventoryApp();
    app.init();
});
