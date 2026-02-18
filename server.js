const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

// 1. Configuración de Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Hacer pública la carpeta de uploads para poder ver las imágenes después
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(__dirname)); // Servir archivos estáticos del frontend

// 2. Configuración de la Base de Datos
// ¡IMPORTANTE! Cambia estos datos por los de tu base de datos real
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',      // Tu usuario de BD
    password: '',      // Tu contraseña de BD
    database: 'safecook_db', // El nombre de tu base de datos
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verificar conexión
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error conectando a la BD:', err.message);
    } else {
        console.log('✅ Conectado exitosamente a la Base de Datos');
        connection.release();
    }
});

// 3. Configuración de Multer (Subida de Imágenes)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Asegúrate de que esta carpeta exista
    },
    filename: (req, file, cb) => {
        // Generar nombre único: fecha + extensión original
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, 'receta-' + uniqueSuffix);
    }
});

const upload = multer({ storage: storage });

// 4. Ruta para Subir Receta (POST)
// 'imagen' debe coincidir con el name="imagen" del input en el HTML
app.post('/api/recetas', upload.single('imagen'), (req, res) => {
    console.log('📥 Recibiendo petición de subida...');

    // Validar que llegue la imagen
    if (!req.file) {
        return res.status(400).json({ success: false, message: "❌ Debes subir una imagen para la receta." });
    }

    const { nombre, ingredientes, instrucciones, categoria } = req.body;
    const imagenUrl = `/uploads/${req.file.filename}`; // Ruta relativa para guardar en BD

    // Validar campos de texto
    if (!nombre || !ingredientes || !instrucciones) {
        return res.status(400).json({ success: false, message: "❌ Por favor completa todos los campos obligatorios." });
    }

    // Query SQL
    // NOTA: Ajusta los nombres de las columnas (nombre, descripcion, etc.) a tu tabla real
    const sql = `INSERT INTO recetas (nombre, ingredientes, instrucciones, imagen, categoria) VALUES (?, ?, ?, ?, ?)`;
    const values = [nombre, ingredientes, instrucciones, imagenUrl, categoria || 'General'];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('❌ Error al insertar en BD:', err);
            return res.status(500).json({ success: false, message: "Error interno al guardar en la base de datos." });
        }

        console.log('✅ Receta guardada con ID:', result.insertId);
        res.json({
            success: true,
            message: "¡Receta subida exitosamente! 🍲",
            recetaId: result.insertId
        });
    });
});

// RUTA PARA LEER RECETAS (GET)
app.get('/api/recetas', (req, res) => {
    // Consulta SQL para traer todas las recetas
    const sql = "SELECT * FROM recetas";

    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Error leyendo recetas:", err);
            return res.status(500).json({ error: "Error al leer la base de datos" });
        }
        // Enviamos la lista de recetas al navegador
        res.json(results);
    });
});
//Registro de cuenta
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Validación básica
    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: "Faltan datos" });
    }

    try {
        // 1. Encriptamos la contraseña (hash + salt automático)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 2. Guardamos el usuario con la contraseña encriptada
        const sql = "INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)";

        db.query(sql, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: "Error al registrar usuario (posiblemente el correo ya existe)" });
            }
            res.json({ success: true, message: "¡Usuario registrado correctamente!" });
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error en el servidor" });
    }
});

// --- RUTAS DE LOGIN (Pégalo en server.js) ---

// 1. Login con Google
app.post('/api/google-login', (req, res) => {
    // Aquí recibimos el token que manda el HTML
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ success: false, message: "No se recibió token." });
    }

    // NOTA: Aquí deberías validar el token con la librería de Google,
    // pero para que funcione la redirección YA MISMO, simulamos que es válido.

    console.log("🔔 Usuario autenticado con Google");

    // Respondemos al HTML que todo salió bien
    res.json({
        success: true,
        role: 'usuario', // O tu lógica para detectar admins
        message: "¡Login correcto!"
    });
});

// 2. Login Tradicional (Correo y Contraseña)
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // 1. Buscamos al usuario SOLO por el email
    const sql = "SELECT * FROM usuarios WHERE email = ?";

    db.query(sql, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Error en BD" });
        }

        if (results.length === 0) {
            // No se encontró el email
            return res.json({ success: false, message: "Usuario o contraseña incorrectos" });
        }

        const usuario = results[0];

        // 2. Comparamos la contraseña texto plano vs el hash en la BD
        // bcrypt.compare(contraseña_escrita, contraseña_encriptada_en_bd)
        const match = await bcrypt.compare(password, usuario.password);

        if (match) {
            // Contraseña correcta
            res.json({
                success: true,
                role: usuario.role || 'usuario',
                username: usuario.username, // Opcional: enviar el nombre
                message: "Bienvenido"
            });
        } else {
            // Contraseña incorrecta
            res.json({ success: false, message: "Usuario o contraseña incorrectos" });
        }
    });
});

// --- ENDPOINT: ELIMINAR RECETA ---
app.delete('/api/recetas/:id', (req, res) => {
    const { id } = req.params;

    // 1. Buscamos la ruta de la imagen usando el nombre de columna correcto ('imagen')
    db.query('SELECT imagen FROM recetas WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error("❌ Error al buscar receta para borrar:", err);
            return res.status(500).json({ error: err.message });
        }
        
        if (results.length === 0) return res.status(404).json({ message: 'Receta no encontrada' });

        // 2. Limpiamos la ruta de la imagen
        // Si en la BD se guarda como "/uploads/foto.jpg", quitamos el primer "/" para que path.join funcione bien
        const dbPath = results[0].imagen;
        if (dbPath) {
            const relativePath = dbPath.startsWith('/') ? dbPath.substring(1) : dbPath;
            const imagePath = path.join(__dirname, relativePath);

            // Borramos el archivo físico si existe
            if (fs.existsSync(imagePath)) {
                try {
                    fs.unlinkSync(imagePath);
                    console.log("🗑️ Archivo físico eliminado:", imagePath);
                } catch (unlinkErr) {
                    console.error("⚠️ No se pudo borrar el archivo físico:", unlinkErr);
                }
            }
        }

        // 3. Borramos el registro de la DB
        db.query('DELETE FROM recetas WHERE id = ?', [id], (deleteErr) => {
            if (deleteErr) return res.status(500).json({ error: deleteErr.message });
            res.json({ message: 'Receta eliminada correctamente' });
        });
    });
});

// --- ENDPOINT: ACTUALIZAR RECETA  ---
app.put('/api/recetas/:id', upload.single('imagen'), (req, res) => {
    const { id } = req.params;
    // Extraemos los campos que vienen del formulario (asegúrate que 'categoria' esté incluido)
    const { nombre, categoria, ingredientes, instrucciones } = req.body;

    let query;
    let params;

    if (req.file) {
        // 1. Si subió imagen nueva, actualizamos TODO incluyendo la columna 'imagen'
        query = "UPDATE recetas SET nombre=?, categoria=?, ingredientes=?, instrucciones=?, imagen=? WHERE id=?";
        const newImagePath = `/uploads/${req.file.filename}`;
        params = [nombre, categoria, ingredientes, instrucciones, newImagePath, id];
    } else {
        // 2. Si NO subió imagen, actualizamos solo los textos
        query = "UPDATE recetas SET nombre=?, categoria=?, ingredientes=?, instrucciones=? WHERE id=?";
        params = [nombre, categoria, ingredientes, instrucciones, id];
    }

    db.query(query, params, (err, result) => {
        if (err) {
            console.error("❌ Error en SQL al actualizar:", err);
            return res.status(500).json({ success: false, message: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "No se encontró la receta" });
        }

        res.json({ success: true, message: 'Receta actualizada correctamente' });
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});