const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const axios = require('axios');
const { OAuth2Client } = require('google-auth-library');
const multer = require('multer'); // Nuevo: para manejar subida de archivos
const path = require('path');

const app = express();
const port = 3000;
const saltRounds = 10;

// --- CONFIGURACIÓN DE ALMACENAMIENTO (MULTER) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Asegúrate de crear esta carpeta en Ubuntu (mkdir uploads)
    },
    filename: (req, file, cb) => {
        // Guarda el archivo con la fecha actual para evitar nombres duplicados
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Configuración de Google Auth
const googleClient = new OAuth2Client('1012990864122-9so0869juj8fqbv7tan76ji9952g9k5e.apps.googleusercontent.com');

// Conexión a MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'safecook_db'
});

app.use(bodyParser.json());
app.use(express.static(__dirname));
// Hacer que la carpeta de imágenes sea accesible desde el navegador
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 1. REGISTRO CON HASHING ---
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const query = 'INSERT INTO usuarios (email, password, role) VALUES (?, ?, "usuario")';
        db.query(query, [email, hashedPassword], (err) => {
            if (err) return res.status(400).json({ success: false, message: "El correo ya existe." });
            res.json({ success: true });
        });
    } catch (e) { res.status(500).json({ success: false }); }
});

// --- 2. LOGIN CON RECAPTCHA Y BCRYPT ---
app.post('/api/login', async (req, res) => {
    const { email, password, captchaResponse } = req.body;
    const secretKey = '6LcV8W0sAAAAAC8cLVfBDj0GhiF3bQOvuEgUTr9e'; 

    try {
        const vUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaResponse}`;
        const vRes = await axios.post(vUrl);
        if (!vRes.data.success) return res.status(401).json({ success: false, message: "Captcha inválido." });

        db.query('SELECT password, role FROM usuarios WHERE email = ?', [email], async (err, results) => {
            if (results.length > 0) {
                const match = await bcrypt.compare(password, results[0].password);
                if (match) return res.json({ success: true, role: results[0].role });
            }
            res.status(401).json({ success: false, message: "Credenciales incorrectas." });
        });
    } catch (e) { res.status(500).json({ success: false }); }
});

// --- 3. LOGIN CON GOOGLE ---
app.post('/api/google-login', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: '1012990864122-9so0869juj8fqbv7tan76ji9952g9k5e.apps.googleusercontent.com',
        });
        const { email, name } = ticket.getPayload();

        db.query('SELECT role FROM usuarios WHERE email = ?', [email], (err, results) => {
            if (results.length > 0) {
                res.json({ success: true, role: results[0].role, name });
            } else {
                db.query('INSERT INTO usuarios (email, password, role) VALUES (?, "GOOGLE_USER", "usuario")', [email], () => {
                    res.json({ success: true, role: 'usuario', name });
                });
            }
        });
    } catch (e) { res.status(401).json({ success: false }); }
});

// --- 4. SUBIR RECETA CON IMAGEN ---
app.post('/api/subir-receta', upload.single('imagen'), (req, res) => {
    const { titulo, descripcion, categoria, dificultad, tiempo } = req.body;
    // req.file contiene la información de la imagen subida
    const imagen_url = req.file ? `/uploads/${req.file.filename}` : null;

    const query = 'INSERT INTO recetas (titulo, descripcion, categoria, dificultad, tiempo, imagen_url) VALUES (?, ?, ?, ?, ?, ?)';
    
    db.query(query, [titulo, descripcion, categoria, dificultad, tiempo, imagen_url], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Error al guardar la receta." });
        }
        res.json({ success: true, message: "Receta publicada con éxito." });
    });
});

app.listen(port, () => console.log(`Servidor CookNet en http://localhost:${port}`));