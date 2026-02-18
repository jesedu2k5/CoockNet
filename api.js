/**
 * ACTIVIDAD 1: Implementación de API de búsqueda (Simulada)
 * Tipo de API: REST (Simulación local con Array JSON)
 * Método: GET (Simulado mediante función searchRecipes)
 * Parámetros: query (string), category (string), difficulty (string)
 */

const MOCK_DB = [
    {
        id: 1,
        title: "Ensalada César",
        category: "cenas",
        difficulty: "facil",
        time: 15,
        image: "🥗",
        desc: "La receta original de Tijuana. Fresca y con mucho parmesano.",
        url: "ensalada.html"
    },
    {
        id: 2,
        title: "Tacos al Pastor",
        category: "comidas",
        difficulty: "media",
        time: 45,
        image: "🌮",
        desc: "Carne marinada con achiote y piña. ¡Clásico mexicano!",
        url: "fail.html"
    },
    {
        id: 3,
        title: "Pasta Alfredo",
        category: "comidas",
        difficulty: "facil",
        time: 20,
        image: "🍝",
        desc: "Salsa cremosa blanca ideal para una cena rápida.",
        url: "fail.html"
    },
    {
        id: 4,
        title: "Brownies Fudgy",
        category: "postres",
        difficulty: "media",
        time: 60,
        image: "🍫",
        desc: "Chocolate intenso con nuez. Centro suave.",
        url: "fail.html"
    },
    {
        id: 5,
        title: "Hot Cakes de Avena",
        category: "desayunos",
        difficulty: "facil",
        time: 15,
        image: "🥞",
        desc: "Opción saludable y llena de energía para la mañana.",
        url: "fail.html"
    }
];

// Función que simula el Endpoint de Búsqueda
function searchApi(params) {
    console.log("Consultando API con parámetros:", params); // Evidencia de consola
    
    return MOCK_DB.filter(recipe => {
        // 1. Filtro de Texto (Búsqueda Simple)
        const matchText = recipe.title.toLowerCase().includes(params.query.toLowerCase()) || 
                          recipe.desc.toLowerCase().includes(params.query.toLowerCase());
        
        // 2. Filtros Avanzados (Categoría y Dificultad)
        const matchCategory = params.category === "all" || recipe.category === params.category;
        const matchDifficulty = params.difficulty === "all" || recipe.difficulty === params.difficulty;

        return matchText && matchCategory && matchDifficulty;
    });
}