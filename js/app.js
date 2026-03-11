// js/app.js
import * as api from './api.js';
import * as dom from './dom.js';
import { initMotorAnimaciones } from './animations.js';
import { CoockNetCarousel } from './carousel.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.time("🚀 Carga Total SPA"); // Medición Parte 5.6
    
    initMotorAnimaciones();
    new CoockNetCarousel('main-carousel');

    const contenedor = document.getElementById('listaRecetas');
    const inputBuscar = document.getElementById('buscarReceta');

    if (contenedor) {
        let recetasCache = await api.obtenerRecetas();
        dom.renderizarRecetas(recetasCache, contenedor);

        // Buscador con Debounce
        inputBuscar?.addEventListener('input', dom.debounce((e) => {
            const query = e.target.value.toLowerCase();
            const filtradas = recetasCache.filter(r => r.nombre.toLowerCase().includes(query));
            dom.renderizarRecetas(filtradas, contenedor);
        }, 400));

        // RETO FINAL: Polling Inteligente (Parte 6)
        setInterval(async () => {
            const nuevas = await api.obtenerRecetas();
            // Prevención de duplicados (Parte 6.2)
            if (nuevas.length > recetasCache.length) {
                dom.mostrarNotificacion("¡Nueva receta detectada en tiempo real! 🍲");
                recetasCache = nuevas;
                dom.renderizarRecetas(recetasCache, contenedor);
            }
        }, 30000); // 30 segundos
    }

    console.timeEnd("🚀 Carga Total SPA");
});