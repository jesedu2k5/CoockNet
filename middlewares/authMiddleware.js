const jwt = require('jsonwebtoken');
const JWT_SECRET = 'Super_Secreto_CoockNet_2026_!#';

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ error: 'Acceso denegado. No se proporcionó un token.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(403).json({ error: 'Formato de token inválido.' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token inválido o expirado.' });
        }
        req.user = decoded;
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.user.role_id !== 1) {
        return res.status(403).json({ error: 'Acceso denegado. Requiere permisos de administrador.' });
    }
    next();
};

module.exports = { verifyToken, isAdmin };