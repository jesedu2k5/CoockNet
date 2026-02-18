document.addEventListener('DOMContentLoaded', () => {
    // === 1. VARIABLES Y REFERENCIAS ===
    let recetasReales = [];
    
    // Referencias al HTML (Aseguramos que coincidan con tus IDs)
    const contenedor = document.getElementById('listaRecetas'); 
    const inputBuscar = document.getElementById('buscarReceta');
    const selectCategoria = document.getElementById('filtrarCategoria');
    const selectOrden = document.getElementById('ordenarPor');

    // === 2. CONECTAR CON LA BASE DE DATOS (Server.js) ===
    async function cargarRecetas() {
        try {
            // Verificamos que el contenedor exista para evitar errores
            if (!contenedor) {
                console.error("❌ Error: No se encontró el elemento <div id='listaRecetas'> en el HTML.");
                return;
            }

            contenedor.innerHTML = '<p class="loading-msg">⏳ Conectando con la base de datos...</p>';
            
            // Petición al Backend
            const response = await fetch('http://localhost:3000/api/recetas');
            
            if (!response.ok) {
                throw new Error("El servidor no respondió bien");
            }

            // Guardar datos
            recetasReales = await response.json();
            console.log("✅ Recetas cargadas:", recetasReales);
            
            // Mostrar
            aplicarFiltros();

        } catch (error) {
            console.error('Error:', error);
            if (contenedor) {
                contenedor.innerHTML = `
                    <div class="empty-msg" style="color: red">
                        <h3>❌ No hay conexión</h3>
                        <p>Asegúrate de que 'node server.js' esté corriendo.</p>
                    </div>
                `;
            }
        }
    }

    // === 3. LÓGICA DE FILTRADO ===
    function aplicarFiltros() {
        // Si no hay datos, no hacemos nada
        if (!recetasReales.length) return;

        const texto = inputBuscar ? inputBuscar.value.toLowerCase().trim() : '';
        const categoria = selectCategoria ? selectCategoria.value : 'todas';
        const orden = selectOrden ? selectOrden.value : 'recientes';

        let resultados = recetasReales.filter(receta => {
            // Filtro Texto
            const cumpleTexto = (receta.nombre || '').toLowerCase().includes(texto) || 
                                (receta.ingredientes || '').toLowerCase().includes(texto);

            // Filtro Categoría (Ignoramos la 's' final para que coincida singular/plural)
            let cumpleCategoria = true;
            if (categoria !== 'todas') {
                const catBD = (receta.categoria || 'General').toLowerCase();
                const catFiltro = categoria.slice(0, -1).toLowerCase(); 
                cumpleCategoria = catBD.includes(catFiltro);
            }

            return cumpleTexto && cumpleCategoria;
        });

        // Ordenamiento
        if (orden === 'recientes') {
            resultados.sort((a, b) => b.id - a.id);
        } else if (orden === 'nombre') {
            resultados.sort((a, b) => a.nombre.localeCompare(b.nombre));
        }

        renderizar(resultados);
    }

    // === 4. DIBUJAR LAS TARJETAS ===
    function renderizar(lista) {
        if (!contenedor) return;

        contenedor.innerHTML = '';

        if (lista.length === 0) {
            contenedor.innerHTML = '<div class="empty-msg">🥺 No hay recetas que coincidan.</div>';
            return;
        }

        lista.forEach(receta => {
            // Corrección de URL de imagen
            let imagenUrl = receta.imagen;
            if (imagenUrl && !imagenUrl.startsWith('http') && !imagenUrl.startsWith('data:')) {
                imagenUrl = `http://localhost:3000${imagenUrl}`;
            }
            if (!imagenUrl) imagenUrl = 'https://via.placeholder.com/300x200?text=Sin+Foto';

            // Limpiamos el texto de instrucciones para que no rompa el alert (quitamos comillas y saltos de línea)
            const instruccionesLimpias = (receta.instrucciones || '')
                .replace(/'/g, "\\'")  // Escapar comillas simples
                .replace(/\n/g, "\\n"); // Preservar saltos de línea visualmente

            const card = document.createElement('div');
            card.className = 'recipe-card';
            card.innerHTML = `
                <div class="card-image">
                    <img src="${imagenUrl}" alt="${receta.nombre}" onerror="this.src='https://via.placeholder.com/300?text=Error'">
                    <span class="card-category">${receta.categoria || 'General'}</span>
                </div>
                <div class="card-content">
                    <h3>${receta.nombre}</h3>
                    <p class="ingredients-preview">
                        ${(receta.ingredientes || '').substring(0, 60)}...
                    </p>
                    <div style="margin-top: 10px; display:flex; gap:10px;">
                        <span class="badge" style="background:#eee; font-size:0.8rem;">⏳ ${receta.tiempo || 'N/A'}</span>
                    </div>
                    <button class="btn-ver" style="margin-top:15px;" onclick="alert('${receta.nombre}\\n\\n${instruccionesLimpias}')">
                        Ver Preparación
                    </button>
                </div>
            `;
            contenedor.appendChild(card);
        });
    }

    // === 5. EVENT LISTENERS ===
    if (inputBuscar) inputBuscar.addEventListener('input', aplicarFiltros);
    if (selectCategoria) selectCategoria.addEventListener('change', aplicarFiltros);
    if (selectOrden) selectOrden.addEventListener('change', aplicarFiltros);

    // Iniciar
    cargarRecetas();
});