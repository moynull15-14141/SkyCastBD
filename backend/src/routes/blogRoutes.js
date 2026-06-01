import { Router } from 'express';
import {
  createBlog,
  deleteBlog,
  getBlogBySlug,
  listBlogs,
  updateBlog
} from '../controllers/blogController.js';
import { optionalAdminAuth, requireAdminAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { blogBodySchema, blogQuerySchema, blogSlugParamSchema } from '../validators/blogSchemas.js';

export const blogRouter = Router();

blogRouter.get('/', optionalAdminAuth, validate(blogQuerySchema, 'query'), listBlogs);
blogRouter.get('/:slug', optionalAdminAuth, validate(blogSlugParamSchema, 'params'), getBlogBySlug);
blogRouter.post('/', requireAdminAuth, validate(blogBodySchema, 'body'), createBlog);
blogRouter.put('/:slug', requireAdminAuth, validate(blogSlugParamSchema, 'params'), validate(blogBodySchema, 'body'), updateBlog);
blogRouter.delete('/:slug', requireAdminAuth, validate(blogSlugParamSchema, 'params'), deleteBlog);
