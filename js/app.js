// js/app.js
import { obtenerRecetas } from './api.js';
import { UIService, debounce } from './ui.js';
import { CoockNetCarousel } from './carousel.js';

document.addEventListener('DOMContentLoaded', async () => {
    const contenedor = document.getElementById('listaRecetas');
    const inputBuscar = document.getElementById('buscarReceta');

    // Inicializar Carrusel
    try {
        new CoockNetCarousel('main-carousel');
    } catch(e) { console.warn("Carrusel no iniciado"); }

    // Cargar Datos
    if (contenedor) {
        const recetas = await obtenerRecetas();
        UIService.renderRecetas(recetas, contenedor);

        // Buscador
        inputBuscar?.addEventListener('input', debounce((e) => {
            const query = e.target.value.toLowerCase();
            const filtradas = recetas.filter(r => 
                r.nombre.toLowerCase().includes(query) || 
                r.ingredientes.toLowerCase().includes(query)
            );
            UIService.renderRecetas(filtradas, contenedor);
        }, 400));
    }
});