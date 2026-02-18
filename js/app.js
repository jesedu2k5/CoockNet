import { DataService } from './data.js';
import { UIService } from './ui.js';

const contenedor = document.getElementById('listaRecetas');

async function cargarPagina() {
    try {
        const recetas = await DataService.fetchRecetas();
        UIService.renderRecetas(recetas, contenedor);
    } catch (err) {
        console.error("Fallo al cargar recetas", err);
    }
}

document.addEventListener('DOMContentLoaded', cargarPagina);