const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = 'Super_Secreto_CoockNet_2026_!#';
const JWT_REFRESH_SECRET = 'Refresh_Secreto_CoockNet_2026_!#';

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        // Si tiene MFA activo, generar código OTP
        if (user.mfa_enabled) {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

            await db.query(
                'INSERT INTO mfa_codes (user_id, code, delivery_method, expires_at) VALUES (?, ?, ?, ?)',
                [user.id, code, 'app', expiresAt]
            );

            console.log('\n=== CÓDIGO MFA ===');
            console.log(`Usuario: ${email}`);
            console.log(`Código: ${code}`);
            console.log(`Expira en: 5 minutos`);
            console.log('==================\n');

            return res.json({ mfa: true, userId: user.id });
        }

        // Sin MFA — login normal
        const token = jwt.sign(
            { id: user.id, role_id: user.role_id, username: user.username },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = crypto.randomBytes(64).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await db.query(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
            [user.id, refreshToken, expiresAt]
        );

        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'] || 'Desconocido';

        await db.query(
            'INSERT INTO sessions (user_id, session_token, ip_address, user_agent) VALUES (?, ?, ?, ?)',
            [user.id, token, ip, userAgent]
        );

        res.json({
            token,
            refreshToken,
            user: { id: user.id, username: user.username, role_id: user.role_id }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const [existe] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existe.length > 0) {
            return res.status(400).json({ error: 'Este correo ya está registrado' });
        }
        const hash = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (username, email, password_hash, role_id) VALUES (?, ?, ?, 2)',
            [username, email, hash]
        );
        res.status(201).json({ success: true, message: 'Cuenta creada correctamente' });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token requerido' });
        }
        const [tokens] = await db.query(
            'SELECT * FROM refresh_tokens WHERE token = ? AND revoked = 0 AND expires_at > NOW()',
            [refreshToken]
        );
        if (tokens.length === 0) {
            return res.status(401).json({ error: 'Refresh token inválido o expirado' });
        }
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [tokens[0].user_id]);
        const user = users[0];
        const newToken = jwt.sign(
            { id: user.id, role_id: user.role_id, username: user.username },
            JWT_SECRET,
            { expiresIn: '15m' }
        );
        res.json({ token: newToken });
    } catch (error) {
        console.error('Error en refresh:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

exports.logout = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
            await db.query(
                'UPDATE sessions SET is_active = 0 WHERE session_token = ?',
                [token]
            );
        }
        res.json({ message: 'Sesión cerrada correctamente' });
    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

exports.getSessions = async (req, res) => {
    try {
        const [sessions] = await db.query(
            `SELECT id, ip_address, user_agent, created_at, last_activity
             FROM sessions
             WHERE user_id = ? AND is_active = 1
             ORDER BY last_activity DESC`,
            [req.user.id]
        );
        const parsed = sessions.map(s => ({
            id: s.id,
            ip: s.ip_address,
            dispositivo: parseUserAgent(s.user_agent),
            fecha: s.created_at,
            ultima_actividad: s.last_activity
        }));
        res.json(parsed);
    } catch (error) {
        console.error('Error al obtener sesiones:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

exports.closeSession = async (req, res) => {
    try {
        const { id } = req.params;
        const [sessions] = await db.query(
            'SELECT id FROM sessions WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );
        if (sessions.length === 0) {
            return res.status(404).json({ error: 'Sesión no encontrada' });
        }
        await db.query('UPDATE sessions SET is_active = 0 WHERE id = ?', [id]);
        res.json({ message: 'Sesión cerrada correctamente' });
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

function parseUserAgent(ua) {
    if (!ua) return 'Dispositivo desconocido';
    if (ua.includes('PostmanRuntime')) return 'Postman';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Navegador desconocido';
}

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            // Respuesta genérica para no revelar si el email existe
            return res.json({ message: 'Si el correo existe, recibirás un enlace.' });
        }

        const user = users[0];
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

        // Invalidar tokens anteriores
        await db.query(
            'UPDATE password_resets SET is_used = 1 WHERE user_id = ?',
            [user.id]
        );

        await db.query(
            'INSERT INTO password_resets (user_id, reset_token, expires_at) VALUES (?, ?, ?)',
            [user.id, token, expiresAt]
        );

        // Simulación de envío — en producción aquí iría nodemailer
        const enlace = `http://localhost:3000/reset_password.html?token=${token}`;
        console.log('\n=== SIMULACIÓN DE EMAIL ===');
        console.log(`Para: ${email}`);
        console.log(`Enlace: ${enlace}`);
        console.log('===========================\n');

        res.json({ message: 'Si el correo existe, recibirás un enlace.' });

    } catch (error) {
        console.error('Error en forgotPassword:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const [resets] = await db.query(
            `SELECT * FROM password_resets 
             WHERE reset_token = ? AND is_used = 0 AND expires_at > NOW()`,
            [token]
        );

        if (resets.length === 0) {
            return res.status(400).json({ error: 'Token inválido o expirado.' });
        }

        const reset = resets[0];
        const hash = await bcrypt.hash(newPassword, 10);

        await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, reset.user_id]);
        await db.query('UPDATE password_resets SET is_used = 1 WHERE id = ?', [reset.id]);

        // Cerrar todas las sesiones activas por seguridad
        await db.query('UPDATE sessions SET is_active = 0 WHERE user_id = ?', [reset.user_id]);

        res.json({ message: 'Contraseña actualizada correctamente.' });

    } catch (error) {
        console.error('Error en resetPassword:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

exports.verifyMfa = async (req, res) => {
    try {
        const { userId, code } = req.body;

        const [codes] = await db.query(
            `SELECT * FROM mfa_codes 
             WHERE user_id = ? AND code = ? AND is_used = 0 AND expires_at > NOW()
             ORDER BY created_at DESC LIMIT 1`,
            [userId, code]
        );

        if (codes.length === 0) {
            return res.status(401).json({ error: 'Código inválido o expirado.' });
        }

        await db.query('UPDATE mfa_codes SET is_used = 1 WHERE id = ?', [codes[0].id]);

        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        const user = users[0];

        const token = jwt.sign(
            { id: user.id, role_id: user.role_id, username: user.username },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = crypto.randomBytes(64).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await db.query(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
            [user.id, refreshToken, expiresAt]
        );

        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'] || 'Desconocido';

        await db.query(
            'INSERT INTO sessions (user_id, session_token, ip_address, user_agent) VALUES (?, ?, ?, ?)',
            [user.id, token, ip, userAgent]
        );

        res.json({
            token,
            refreshToken,
            user: { id: user.id, username: user.username, role_id: user.role_id }
        });

    } catch (error) {
        console.error('Error en verifyMfa:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

exports.toggleMfa = async (req, res) => {
    try {
        const [users] = await db.query('SELECT mfa_enabled FROM users WHERE id = ?', [req.user.id]);
        const actual = users[0].mfa_enabled;
        const nuevo = actual ? 0 : 1;

        await db.query('UPDATE users SET mfa_enabled = ? WHERE id = ?', [nuevo, req.user.id]);

        res.json({
            message: `MFA ${nuevo ? 'activado' : 'desactivado'} correctamente`,
            mfa_enabled: !!nuevo
        });

    } catch (error) {
        console.error('Error en toggleMfa:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};