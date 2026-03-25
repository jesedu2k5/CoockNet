// js/app.js
import { obtenerRecetas } from './api.js';
import { DOMService, debounce } from './dom.js';
import { RecetasCache } from './cache.js';
import { CoockNetCarousel } from './carousel.js';

document.addEventListener('DOMContentLoaded', async () => {
    const contenedor = document.getElementById('listaRecetas');
    const inputBuscar = document.getElementById('buscarReceta');

    try { new CoockNetCarousel('main-carousel'); } catch(e) {}

    if (contenedor) {
        // Suscriptor: Se encarga de dibujar cada vez que la Caché se actualiza
        RecetasCache.subscribe((nuevosDatos) => {
            // Mantiene el filtro de búsqueda si el usuario está escribiendo algo
            const query = inputBuscar ? inputBuscar.value.toLowerCase() : '';
            const filtradas = nuevosDatos.filter(r => 
                (r.nombre || '').toLowerCase().includes(query) || 
                (r.ingredientes || '').toLowerCase().includes(query)
            );
            DOMService.renderRecetas(filtradas, contenedor);
        });

        // 1. CARGA INICIAL
        console.time("Tiempo de carga API");
        const datosBD = await obtenerRecetas();
        console.timeEnd("Tiempo de carga API");
        RecetasCache.set(datosBD); // Esto dispara el render inicial

        // 2. BUSCADOR CON DEBOUNCE
        inputBuscar?.addEventListener('input', debounce((e) => {
            // Forzamos la actualización pasándole los mismos datos al observer
            RecetasCache.notify(); 
        }, 400));

        // 🚀 3. RETO FINAL OBLIGATORIO: POLLING INTELIGENTE (15 pts)
        // Control de frecuencia: Cada 10 segundos (10000 ms)
        setInterval(async () => {
            try {
                const recetasNuevas = await obtenerRecetas();
                const recetasActuales = RecetasCache.get();

                // Prevención de duplicados: Solo actualizamos si el total de recetas cambia
                if (recetasNuevas.length > recetasActuales.length) {
                    RecetasCache.set(recetasNuevas);
                    
                    // Notificación Visual + Animación (Se animan al entrar por la clase fade-in del DOMService)
                    DOMService.mostrarNotificacion('¡Alguien acaba de compartir una nueva receta! 👨‍🍳', 'exito');
                } 
                else if (recetasNuevas.length < recetasActuales.length) {
                    RecetasCache.set(recetasNuevas);
                    DOMService.mostrarNotificacion('Lista de recetas actualizada 🔄', 'exito');
                }
                // Si son iguales, el "Polling" es inteligente y no hace nada, ahorrando memoria.
            } catch (error) {
                console.warn("Fallo silencioso en el polling:", error);
            }
        }, 10000); 
    }
});