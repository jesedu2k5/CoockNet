const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/refresh', authController.refreshToken);
router.post('/logout', verifyToken, authController.logout);
router.get('/sessions', verifyToken, authController.getSessions);
router.delete('/sessions/:id', verifyToken, authController.closeSession);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-mfa', authController.verifyMfa);
router.post('/toggle-mfa', verifyToken, authController.toggleMfa);

module.exports = router;