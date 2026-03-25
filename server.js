const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// IMPORTACIÓN DIRECTA (Sin llaves)
const loginLimiter = require('./middlewares/rateLimiter');

const app = express();
const port = process.env.PORT || 3000;

// ==========================================
// 1. MIDDLEWARES DE SEGURIDAD GLOBALES
// ==========================================
app.use(helmet({
    contentSecurityPolicy: false, 
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 2. SERVIR ARCHIVOS ESTÁTICOS
// ==========================================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname))); 

// ==========================================
// 3. RUTAS (API) - Arquitectura Limpia
// ==========================================
const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes'); // <-- ¡Línea descomentada!

// Aplicamos el 'loginLimiter' SÓLO a las rutas de autenticación.
app.use('/api/auth', loginLimiter, authRoutes);
app.use('/api/recipes', recipeRoutes); // <-- ¡Línea descomentada!

// ==========================================
// 4. INICIAR EL SERVIDOR
// ==========================================
app.listen(port, () => {
    console.log(`Servidor CoockNet seguro corriendo en http://localhost:${port}`);
});