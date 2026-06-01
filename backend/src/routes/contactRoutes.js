import { Router } from 'express';
import { createContactMessage } from '../controllers/contactController.js';
import { validate } from '../middleware/validate.js';
import { contactMessageBodySchema } from '../validators/contactSchemas.js';

export const contactRouter = Router();

contactRouter.post('/', validate(contactMessageBodySchema, 'body'), createContactMessage);
