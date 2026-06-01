import { Router } from 'express';
import { listContactMessages } from '../controllers/contactController.js';
import {
  createProduct,
  deleteProduct,
  listOrders,
  updateProduct
} from '../controllers/storeController.js';
import { requireAdminAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  orderQuerySchema,
  productBodySchema,
  productParamSchema
} from '../validators/storeSchemas.js';

export const adminRouter = Router();

adminRouter.get('/messages', requireAdminAuth, listContactMessages);
adminRouter.post('/products', requireAdminAuth, validate(productBodySchema, 'body'), createProduct);
adminRouter.put('/products/:id', requireAdminAuth, validate(productParamSchema, 'params'), validate(productBodySchema, 'body'), updateProduct);
adminRouter.delete('/products/:id', requireAdminAuth, validate(productParamSchema, 'params'), deleteProduct);
adminRouter.get('/orders', requireAdminAuth, validate(orderQuerySchema, 'query'), listOrders);
