// IMPORTANTE: Asegúrate de que diga 'mysql2/promise' y no solo 'mysql2'
const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root', // Cambia esto si tu usuario de MySQL es diferente
    password: '', // Cambia esto si tu MySQL tiene contraseña
    database: 'safecook_db', 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Exportamos la conexión directamente
module.exports = db;