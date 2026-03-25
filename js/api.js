// js/api.js
const API_URL = 'http://localhost:3000/api/recipes';

export async function obtenerRecetas() {
    try {
        // Magia aquí: cache: 'no-store' obliga al navegador a ir SIEMPRE a la base de datos
        const respuesta = await fetch(API_URL, {
            cache: 'no-store' 
        });
        
        if (!respuesta.ok) throw new Error("Error en red");
        return await respuesta.json();
    } catch (error) {
        console.error("Fallo API:", error);
        return [];
    }
}