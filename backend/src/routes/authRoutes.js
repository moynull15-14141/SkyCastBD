import { Router } from 'express';
import { loginAdmin } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { loginSchema } from '../validators/authSchemas.js';

export const authRouter = Router();

authRouter.post('/login', validate(loginSchema, 'body'), loginAdmin);
