document.addEventListener('DOMContentLoaded', () => {

    const TU_NUMERO_WHATSAPP = '56961422962';
    let productos = [];
    let carrito = [];
    let regionesComunasData = [];

    // --- Función de ayuda para formatear precios en CLP ---
    function formatCLP(amount) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0, // Asegura que no haya decimales
            maximumFractionDigits: 0  // Asegura que no haya decimales
        }).format(amount);
    }
    // --- Fin Función de ayuda ---

    // Elementos del DOM
    const catalogoProductos = document.getElementById('catalogo-productos');
    const filtrosCategoria = document.getElementById('filtros-categoria');
    const notificacionContainer = document.getElementById('notificacion-container');

    // --- ELEMENTOS DEL DOM PARA EL MODAL DE CARRITO ---
    const modalCarrito = document.getElementById('modal-carrito');
    const btnVerCarrito = document.getElementById('btn-ver-carrito');
    const modalCloseBtn = document.querySelector('.modal-close-btn');
    const carritoItems = document.getElementById('carrito-items');
    const carritoTotal = document.getElementById('carrito-total');
    const carritoContador = document.getElementById('carrito-contador');
    const btnComprar = document.getElementById('btn-comprar');
    const btnVaciarCarrito = document.getElementById('btn-vaciar-carrito');
    const regionSelect = document.getElementById('region-select');
    const comunaSelect = document.getElementById('comuna-select');

    // --- ELEMENTOS DEL DOM PARA EL MODAL DE CONFIRMACIÓN ---
    const modalConfirmacion = document.getElementById('modal-confirmacion');
    const btnVolverMenu = document.getElementById('btn-volver-menu');


    // --- FUNCIONES DEL MODAL DE CARRITO ---
    function abrirModal() {
        modalCarrito.classList.add('active');
        actualizarCarritoUI();
        poblarRegiones();
    } // <--- Cierre corregido aquí

    function cerrarModal() { // <--- Función fuera de abrirModal
        modalCarrito.classList.remove('active');
        regionSelect.value = '';
        comunaSelect.innerHTML = '<option value="">Selecciona tu Comuna</option>';
        comunaSelect.disabled = true;
    }

    // --- FUNCIONES DEL MODAL DE CONFIRMACIÓN ---
    function abrirModalConfirmacion() {
        modalConfirmacion.classList.add('active');
    }

    function cerrarModalConfirmacion() {
        modalConfirmacion.classList.remove('active');
    }

    // Función para actualizar el contador de ítems del botón flotante
    function actualizarContadorCarrito() {
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        carritoContador.innerText = totalItems;
    }

    // --- FUNCIONES PRINCIPALES ---

    // --- NUEVAS FUNCIONES PARA REGIÓN/COMUNA (Colocadas aquí para un ámbito correcto) ---
    async function cargarRegionesComunas() {
        try {
            const response = await fetch('regiones_comunas.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            regionesComunasData = await response.json();
            poblarRegiones(); // Llama a la función para llenar el select de regiones
        } catch (error) {
            console.error('Error al cargar regiones y comunas:', error);
            mostrarNotificacion('Error al cargar la información de regiones y comunas.', 'error');
        }
    }

    function poblarRegiones() {
        regionSelect.innerHTML = '<option value="">Selecciona tu Región</option>';
        regionesComunasData.forEach(region => {
            const option = document.createElement('option');
            option.value = region.nombre;
            option.textContent = region.nombre;
            regionSelect.appendChild(option);
        });
        comunaSelect.innerHTML = '<option value="">Selecciona tu Comuna</option>'; // Limpiar comunas
        comunaSelect.disabled = true; // Deshabilitar comuna hasta que se seleccione región
    }

    function poblarComunas(regionNombre) {
        comunaSelect.innerHTML = '<option value="">Selecciona tu Comuna</option>';
        comunaSelect.disabled = true;
        if (regionNombre) {
            const regionSeleccionada = regionesComunasData.find(region => region.nombre === regionNombre);
            if (regionSeleccionada) {
                regionSeleccionada.comunas.forEach(comuna => {
                    const option = document.createElement('option');
                    option.value = comuna;
                    option.textContent = comuna;
                    comunaSelect.appendChild(option);
                });
                comunaSelect.disabled = false;
            }
        }
    }
    // --- FIN NUEVAS FUNCIONES PARA REGIÓN/COMUNA ---


    function renderizarProductos(productosFiltrados) {
        catalogoProductos.innerHTML = '';
        productosFiltrados.forEach(producto => {
            const productoDiv = document.createElement('div');
            productoDiv.classList.add('producto');
            productoDiv.innerHTML = `
                <h3>${producto.nombre}</h3>
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <p class="producto-descripcion">${producto.descripcionCorta || ''}</p>
                <div class="producto-acciones">
                    <input type="number" value="1" min="1" class="producto-cantidad" data-id="${producto.id}">
                    <button class="btn-agregar" data-id="${producto.id}">Agregar</button>
                </div>
            `;
            catalogoProductos.appendChild(productoDiv);
        });
    }
// se usara el precio en otra ocacion ahora es solo para mostar los productos
// <p class="precio">Precio: ${formatCLP(producto.precio)}</p>
    function renderizarFiltros() {
        if (productos.length === 0) {
            console.warn("No hay productos cargados para renderizar filtros.");
            return;
        }
        const categorias = ['Todos', ...new Set(productos.map(p => p.categoria))];
        filtrosCategoria.innerHTML = '';
        categorias.forEach(categoria => {
            const boton = document.createElement('button');
            boton.innerText = categoria;
            boton.dataset.categoria = categoria;
            filtrosCategoria.appendChild(boton);
        });
        filtrosCategoria.querySelector('button').classList.add('active');
    }

    function renderizarCarrito() {
        carritoItems.innerHTML = '';
        if (carrito.length === 0) {
            carritoItems.innerHTML = '<p>Tu carrito está vacío.</p>';
        } else {
            carrito.forEach(item => {
                const carritoItemDiv = document.createElement('div');
                carritoItemDiv.classList.add('carrito-item');
                carritoItemDiv.innerHTML = `
                    <span>${item.nombre} (x${item.cantidad})</span>

                `;
                //<span>${formatCLP(item.precio * item.cantidad)}</span>
                carritoItems.appendChild(carritoItemDiv);
            });
        }
        //actualizarTotal();
        actualizarContadorCarrito();
    }

    function actualizarTotal() {
        const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        carritoTotal.innerText = formatCLP(total);
    }

    function agregarACarrito(idProducto, cantidad) {
        cantidad = Math.max(1, parseInt(cantidad) || 1);

        const productoEnCarrito = carrito.find(item => item.id === idProducto);

        if (productoEnCarrito) {
            productoEnCarrito.cantidad += cantidad;
        } else {
            const producto = productos.find(p => p.id === idProducto);
            if (producto) {
                carrito.push({ ...producto, cantidad: cantidad });
            } else {
                console.error(`Producto con ID ${idProducto} no encontrado.`);
                mostrarNotificacion('❌ Error: Producto no encontrado.');
                return;
            }
        }
        renderizarCarrito();
        mostrarNotificacion(`✅ ${cantidad} x ${productos.find(p => p.id === idProducto).nombre} agregado(s)`);
    }

    function enviarPedidoWhatsApp() {
        const regionSeleccionada = regionSelect.value; // <--- Declaración movida aquí
        const comunaSeleccionada = comunaSelect.value; // <--- Declaración movida aquí

        // <--- Validación movida aquí
        if (!regionSeleccionada) {
            mostrarNotificacion('Por favor, selecciona tu Región. Es un campo obligatorio.', 'error');
            regionSelect.focus();
            return;
        }
        if (!comunaSeleccionada) {
            mostrarNotificacion('Por favor, selecciona tu Comuna. Es un campo obligatorio.', 'error');
            comunaSelect.focus();
            return;
        }
        // <--- Fin de validación movida

        if (carrito.length === 0) {
            mostrarNotificacion('Tu carrito está vacío. Agrega productos antes de enviar el pedido.', 'error'); // Corregido para usar mostrarNotificacion
            return; // Detener si el carrito está vacío
        }

        let mensaje = '¡Hola! Me gustaría hacer el siguiente pedido:\n\n';
        carrito.forEach(item => {
            mensaje += `${item.nombre} || Cantidad: ${item.cantidad}\n`;
        });
        mensaje += `\nRegion: ${regionSeleccionada}\n`;
        mensaje += `\nComuna: ${comunaSeleccionada}\n`;

        //const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        //mensaje += `\nTOTAL DEL PEDIDO: ${formatCLP(total)}`;
        const urlWhatsApp = `https://wa.me/${TU_NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;

        window.open(urlWhatsApp, '_blank');

        carrito = [];
        renderizarCarrito();
        cerrarModal();

        abrirModalConfirmacion();
    }

    function mostrarNotificacion(mensaje, tipo = 'info') { // Agregado tipo para consistencia
        const toast = document.createElement('div');
        toast.classList.add('toast');
        // Agregado estilo para diferentes tipos de notificación
        if (tipo === 'error') {
            toast.style.backgroundColor = '#e74c3c';
        } else if (tipo === 'success') {
            toast.style.backgroundColor = '#2ecc71';
        }
        toast.innerText = mensaje;

        notificacionContainer.appendChild(toast);

        void toast.offsetWidth;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => {
                toast.remove();
            }, { once: true });
        }, 3000); // Duración de 3 segundos
    }

    function vaciarCarrito() {
        if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
            carrito = [];
            renderizarCarrito();
            mostrarNotificacion('🗑️ Carrito vaciado con éxito', 'info'); // Agregado tipo
        }
    }

    // --- INICIALIZACIÓN: Cargar productos desde JSON ---
    fetch('productos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            productos = data; // Asigna los productos cargados a la variable global
            renderizarProductos(productos); // Renderiza todos los productos iniciales
            renderizarFiltros(); // Renderiza los filtros basados en los productos cargados
        })
        .catch(error => {
            console.error('Error al cargar los productos:', error);
            catalogoProductos.innerHTML = '<p>Error al cargar los productos. Por favor, intente de nuevo más tarde.</p>';
            mostrarNotificacion('❌ Error al cargar productos.', 'error'); // Agregado tipo
        });


    // --- EVENT LISTENERS ---
    catalogoProductos.addEventListener('click', e => {
        if (e.target.classList.contains('btn-agregar')) {
            const id = parseInt(e.target.dataset.id);
            const cantidadInput = e.target.closest('.producto-acciones').querySelector('.producto-cantidad');
            const cantidad = parseInt(cantidadInput.value);

            agregarACarrito(id, cantidad);
        }
    });

    filtrosCategoria.addEventListener('click', e => {
        if (e.target.tagName === 'BUTTON') {
            filtrosCategoria.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            const categoria = e.target.dataset.categoria;
            const productosFiltrados = categoria === 'Todos' ? productos : productos.filter(p => p.categoria === categoria);
            renderizarProductos(productosFiltrados);
        }
    });

    // --- NUEVO: Listener para el cambio en el select de regiones ---
    regionSelect.addEventListener('change', (event) => {
        poblarComunas(event.target.value);
    });

    btnComprar.addEventListener('click', enviarPedidoWhatsApp);

    // --- LISTENERS PARA EL MODAL DE CARRITO ---
    btnVerCarrito.addEventListener('click', abrirModal);
    modalCloseBtn.addEventListener('click', cerrarModal);
    modalCarrito.addEventListener('click', e => {
        if (e.target === modalCarrito) {
            cerrarModal();
        }
    });
    btnVaciarCarrito.addEventListener('click', vaciarCarrito);

    // --- LISTENERS PARA EL MODAL DE CONFIRMACIÓN ---
    btnVolverMenu.addEventListener('click', () => {
        cerrarModalConfirmacion();
        window.location.reload();
    });

    // --- Cargar regiones y comunas al iniciar la app (Movido aquí para correcta inicialización) ---
    cargarRegionesComunas();
});