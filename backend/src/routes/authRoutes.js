import express from 'express';
import { register, login, logout, googleLogin, adminLogin } from '../controllers/authControllers.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/google', googleLogin);

// Admin-only login (email + password, role === 'admin' required)
router.post('/admin/login', adminLogin);

export default router;