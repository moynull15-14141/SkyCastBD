import { Router } from 'express';
import { createOrder } from '../controllers/storeController.js';
import { validate } from '../middleware/validate.js';
import { orderBodySchema } from '../validators/storeSchemas.js';

export const orderRouter = Router();

orderRouter.post('/', validate(orderBodySchema, 'body'), createOrder);
