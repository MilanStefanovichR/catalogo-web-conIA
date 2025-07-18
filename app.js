document.addEventListener('DOMContentLoaded', () => {
    //const TU_NUMERO_WHATSAPP = '56961422962';
    const TU_NUMERO_WHATSAPP = '56936710143';

    let productos = [];
    let carrito = [];
    let regionesComunasData = [];

    const catalogoProductos = document.getElementById('catalogo-productos');
    const filtrosCategoria = document.getElementById('filtros-categoria');
    const notificacionContainer = document.getElementById('notificacion-container');
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
    const modalConfirmacion = document.getElementById('modal-confirmacion');
    const btnVolverMenu = document.getElementById('btn-volver-menu');

    function formatCLP(amount) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    function abrirModal() {
        modalCarrito.classList.add('active');
        actualizarCarritoUI();
        poblarRegiones();
    }

    function cerrarModal() {
        modalCarrito.classList.remove('active');
        regionSelect.value = '';
        comunaSelect.innerHTML = '<option value="">Selecciona tu Comuna</option>';
        comunaSelect.disabled = true;
    }

    function abrirModalConfirmacion() {
        modalConfirmacion.classList.add('active');
    }

    function cerrarModalConfirmacion() {
        modalConfirmacion.classList.remove('active');
    }

    function actualizarContadorCarrito() {
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        carritoContador.innerText = totalItems;
    }

    async function cargarRegionesComunas() {
        try {
            const response = await fetch('regiones_comunas.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            regionesComunasData = await response.json();
            poblarRegiones();
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
        comunaSelect.innerHTML = '<option value="">Selecciona tu Comuna</option>';
        comunaSelect.disabled = true;
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

    function renderizarFiltros() {
        if (productos.length === 0) return;
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
                carritoItemDiv.innerHTML = `<span>${item.nombre} (x${item.cantidad})</span>`;
                carritoItems.appendChild(carritoItemDiv);
            });
        }
        actualizarContadorCarrito();
    }

    function agregarACarrito(idProducto, cantidad) {
        cantidad = Math.max(1, parseInt(cantidad) || 1);
        const productoEnCarrito = carrito.find(item => item.id === idProducto);
        if (productoEnCarrito) {
            productoEnCarrito.cantidad += cantidad;
        } else {
            const producto = productos.find(p => p.id === idProducto);
            if (producto) carrito.push({ ...producto, cantidad });
        }
        renderizarCarrito();
        mostrarNotificacion(`✅ ${cantidad} x ${productos.find(p => p.id === idProducto).nombre} agregado(s)`);
    }

    function enviarPedidoWhatsApp() {
        const regionSeleccionada = regionSelect.value;
        const comunaSeleccionada = comunaSelect.value;

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

        if (carrito.length === 0) {
            mostrarNotificacion('Tu carrito está vacío. Agrega productos antes de enviar el pedido.', 'error');
            return;
        }

        let mensaje = '¡Hola! Me gustaría hacer el siguiente pedido:';
        carrito.forEach(item => {
            mensaje += `${item.nombre} || Cantidad: ${item.cantidad}
`;
        });
        mensaje += `
Región: ${regionSeleccionada}
Comuna: ${comunaSeleccionada}
`;

        const datosPedido = {
            productos: carrito.map(item => `${item.nombre} (x${item.cantidad})`).join(', '),
            cantidad: carrito.reduce((acc, item) => acc + item.cantidad, 0),
            region: regionSeleccionada,
            comuna: comunaSeleccionada
        };

        fetch("registrar_pedido.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(datosPedido)
        })
        .then(res => res.text())
        .then(data => console.log("Pedido registrado:", data))
        .catch(err => console.error("Error al guardar el pedido:", err));

        const urlWhatsApp = `https://wa.me/${TU_NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
        window.open(urlWhatsApp, '_blank');

        carrito = [];
        renderizarCarrito();
        cerrarModal();
        abrirModalConfirmacion();
    }

    function mostrarNotificacion(mensaje, tipo = 'info') {
        const toast = document.createElement('div');
        toast.classList.add('toast');
        toast.style.backgroundColor = tipo === 'error' ? '#e74c3c' : '#2ecc71';
        toast.innerText = mensaje;
        notificacionContainer.appendChild(toast);
        void toast.offsetWidth;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        }, 3000);
    }

    function vaciarCarrito() {
        if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
            carrito = [];
            renderizarCarrito();
            mostrarNotificacion('🗑️ Carrito vaciado con éxito', 'info');
        }
    }

    fetch('productos.json')
        .then(res => res.json())
        .then(data => {
            productos = data;
            renderizarProductos(productos);
            renderizarFiltros();
        });

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
            const filtrados = categoria === 'Todos' ? productos : productos.filter(p => p.categoria === categoria);
            renderizarProductos(filtrados);
        }
    });

    regionSelect.addEventListener('change', e => {
        poblarComunas(e.target.value);
    });

    btnComprar.addEventListener('click', enviarPedidoWhatsApp);
    btnVerCarrito.addEventListener('click', abrirModal);
    modalCloseBtn.addEventListener('click', cerrarModal);
    modalCarrito.addEventListener('click', e => {
        if (e.target === modalCarrito) cerrarModal();
    });
    btnVaciarCarrito.addEventListener('click', vaciarCarrito);
    btnVolverMenu.addEventListener('click', () => {
        cerrarModalConfirmacion();
        window.location.reload();
    });

    cargarRegionesComunas();
});
