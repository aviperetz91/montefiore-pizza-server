import { Router } from 'express';
import { signup, login, logout, updatePassword } from '../../controllers/authController';
import { protect } from '../../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.patch('/update-password', protect, updatePassword);

export default router;
