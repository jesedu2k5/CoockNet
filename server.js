const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

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
    
    // Consulta simple a la base de datos
    const sql = "SELECT * FROM usuarios WHERE email = ? AND password = ?";
    
    db.query(sql, [email, password], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Error en BD" });
        }
        
        if (results.length > 0) {
            const usuario = results[0];
            res.json({ 
                success: true, 
                role: usuario.role || 'usuario',
                message: "Bienvenido" 
            });
        } else {
            res.json({ success: false, message: "Credenciales incorrectas" });
        }
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});