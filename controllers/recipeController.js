const db = require('../config/db');

exports.getAllRecipes = async (req, res) => {
    try {
        const [recipes] = await db.query('SELECT * FROM recetas');
        res.json(recipes);
    } catch (error) {
        console.error('Error al obtener recetas:', error);
        res.status(500).json({ error: 'Error de servidor' });
    }
};

exports.createRecipe = async (req, res) => {
    try {
        const { title, description, ingredients, steps } = req.body;
        const imagen = req.file ? '/uploads/' + req.file.filename : null;
        const user_id = req.user.id;

        await db.query(
            'INSERT INTO recetas (nombre, categoria, ingredientes, instrucciones, imagen) VALUES (?, ?, ?, ?, ?)',
            [title, description, ingredients, steps, imagen]
        );

        res.status(201).json({ message: 'Receta creada correctamente', imagen });
    } catch (error) {
        console.error('Error al crear receta:', error);
        res.status(500).json({ error: 'Error de servidor' });
    }
};