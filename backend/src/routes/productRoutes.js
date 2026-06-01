import { Router } from 'express';
import { listProducts } from '../controllers/storeController.js';
import { validate } from '../middleware/validate.js';
import { productQuerySchema } from '../validators/storeSchemas.js';

export const productRouter = Router();

productRouter.get('/', validate(productQuerySchema, 'query'), listProducts);
