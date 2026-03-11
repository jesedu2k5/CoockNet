/**
 * ACTIVIDAD 1: Implementación de API de búsqueda (Conectada a MySQL)
 * Tipo de API: REST
 * Método: GET 
 * Ruta: http://localhost:3000/api/recetas
 */

export async function searchRecipes(query = '', category = '', difficulty = '') {
    try {
        // 1. Hacemos la petición real a tu servidor backend
        const response = await fetch('http://localhost:3000/api/recetas');
        
        if (!response.ok) {
            throw new Error('Error al obtener las recetas del servidor');
        }

        // 2. Convertimos la respuesta a JSON
        const recetasBD = await response.json();

        // 3. Formateamos los datos para que tu UI los entienda perfectamente
        // y arreglamos la ruta de las imágenes
        let resultados = recetasBD.map(receta => {
            return {
                id: receta.id,
                // Mapeamos los nombres por si tu UI usa los nombres en inglés o español
                nombre: receta.nombre, 
                title: receta.nombre, 
                
                ingredientes: receta.ingredientes,
                instrucciones: receta.instrucciones,
                
                categoria: receta.categoria,
                category: receta.categoria, 
                
                // ⚠️ ARREGLO DE IMAGEN: Le pegamos el "http://localhost:3000" a la ruta
                // Si la receta no tiene imagen, pone una por defecto
                imagen: receta.imagen ? `http://localhost:3000${receta.imagen}` : 'https://via.placeholder.com/300x200?text=Cocina+Segura',
                image: receta.imagen ? `http://localhost:3000${receta.imagen}` : 'https://via.placeholder.com/300x200?text=Cocina+Segura',
                
                dificultad: 'Media', // Valor por defecto ya que tu BD no tiene columna dificultad
                difficulty: 'Medium'
            };
        });

        // 4. Aplicamos los filtros de búsqueda que ya tenías programados
        if (query) {
            const lowerQuery = query.toLowerCase();
            resultados = resultados.filter(r => 
                (r.nombre && r.nombre.toLowerCase().includes(lowerQuery)) || 
                (r.ingredientes && r.ingredientes.toLowerCase().includes(lowerQuery))
            );
        }

        if (category && category !== 'Todas' && category !== 'All' && category !== '') {
            resultados = resultados.filter(r => r.categoria === category);
        }

        // Devolvemos las recetas ya filtradas y listas para pintarse en el HTML
        return resultados;

    } catch (error) {
        console.error("❌ Error en searchRecipes:", error);
        // Si el servidor está apagado o falla, devolvemos un arreglo vacío para no romper la página
        return []; 
    }
}