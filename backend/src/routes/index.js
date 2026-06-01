import { Router } from 'express';
import { adminRouter } from './adminRoutes.js';
import { authRouter } from './authRoutes.js';
import { blogRouter } from './blogRoutes.js';
import { contactRouter } from './contactRoutes.js';
import { healthRouter } from './healthRoutes.js';
import { orderRouter } from './orderRoutes.js';
import { productRouter } from './productRoutes.js';
import { weatherRouter } from './weatherRoutes.js';

export const router = Router();

router.use('/admin', adminRouter);
router.use('/auth', authRouter);
router.use('/blogs', blogRouter);
router.use('/contact', contactRouter);
router.use('/health', healthRouter);
router.use('/orders', orderRouter);
router.use('/products', productRouter);
router.use('/weather', weatherRouter);
