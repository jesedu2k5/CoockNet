const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

// 1. Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(__dirname));

// Crear carpeta uploads si no existe
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// 2. Base de Datos
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',      
    password: '',      
    database: 'safecook_db', 
    waitForConnections: true,
    connectionLimit: 10
});

db.getConnection((err, conn) => {
    if (err) console.error('❌ Error BD:', err.message);
    else {
        console.log('✅ Conectado a la Base de Datos');
        conn.release();
    }
});

// 3. Multer (Imágenes)
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// --- RUTAS API ---

// GET: Obtener todas
app.get('/api/recetas', (req, res) => {
    db.query("SELECT * FROM recetas", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// POST: Nueva receta
app.post('/api/recetas', upload.single('imagen'), (req, res) => {
    const { nombre, ingredientes, instrucciones, categoria } = req.body;
    const imagenUrl = req.file ? `/uploads/${req.file.filename}` : null;
    
    const sql = "INSERT INTO recetas (nombre, ingredientes, instrucciones, imagen, categoria) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [nombre, ingredientes, instrucciones, imagenUrl, categoria || 'General'], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, id: result.insertId });
    });
});

// DELETE: Eliminar por ID
app.delete('/api/recetas/:id', (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM recetas WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: "Eliminado" });
    });
});

// PUT: Actualizar
app.put('/api/recetas/:id', upload.single('imagen'), (req, res) => {
    const { id } = req.params;
    const { nombre, categoria, ingredientes, instrucciones } = req.body;
    let sql, params;

    if (req.file) {
        sql = "UPDATE recetas SET nombre=?, categoria=?, ingredientes=?, instrucciones=?, imagen=? WHERE id=?";
        params = [nombre, categoria, ingredientes, instrucciones, `/uploads/${req.file.filename}`, id];
    } else {
        sql = "UPDATE recetas SET nombre=?, categoria=?, ingredientes=?, instrucciones=? WHERE id=?";
        params = [nombre, categoria, ingredientes, instrucciones, id];
    }

    db.query(sql, params, (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true });
    });
});

// AUTH: Registro
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    db.query("INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)", [username, email, hash], (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

// AUTH: Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.query("SELECT * FROM usuarios WHERE email = ?", [email], async (err, results) => {
        if (err || results.length === 0) return res.json({ success: false });
        const match = await bcrypt.compare(password, results[0].password);
        res.json({ success: match, role: results[0].role || 'usuario' });
    });
});

app.listen(port, () => {
    console.log(`🚀 Servidor en http://localhost:${port}`);
});