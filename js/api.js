// js/api.js

const API_URL = 'http://localhost:3000/api/recetas';

// OPCIÓN A: Exportación directa (la más segura)
export async function obtenerRecetas() {
    try {
        const respuesta = await fetch(API_URL);
        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }
        const datos = await respuesta.json();
        return datos;
    } catch (error) {
        console.error("Fallo en api.js:", error);
        return []; 
    }
}

