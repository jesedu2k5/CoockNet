const rateLimit = require('express-rate-limit');

// Bloquea IPs que hagan más de 5 intentos de login en 15 minutos
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Límite de 5 intentos
    message: { error: 'Demasiados intentos de inicio de sesión. Protección contra fuerza bruta activada. Intenta en 15 minutos.' }
});

// EXPORTACIÓN DIRECTA (Sin llaves)
module.exports = loginLimiter;