import { Blog } from '../models/Blog.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

const createSlug = (title) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);

const normalizeBlogPayload = (body) => ({
  title: body.title,
  slug: body.slug || createSlug(body.title),
  content: body.content,
  featuredImage: body.featuredImage || '',
  status: body.status || 'draft',
  date: body.date || new Date(),
  seo: {
    metaTitle: body.seo?.metaTitle || body.title,
    metaDescription: body.seo?.metaDescription || body.content.replace(/<[^>]*>/g, '').slice(0, 160),
    keywords: body.seo?.keywords || ''
  }
});

const ensureUniqueSlugError = (error) => {
  if (error?.code === 11000 && error?.keyPattern?.slug) {
    throw new HttpError('A blog post with this slug already exists.', 409);
  }

  throw error;
};

export const listBlogs = asyncHandler(async (req, res) => {
  const { status, includeDrafts, limit } = req.query;
  const isAdmin = Boolean(req.admin);
  const filter = {};

  if (status && status !== 'all') {
    filter.status = status;
  } else if (!isAdmin || includeDrafts !== 'true') {
    filter.status = 'published';
  }

  const blogs = await Blog.find(filter).sort({ date: -1, createdAt: -1 }).limit(limit).lean();
  res.json({ data: blogs });
});

export const getBlogBySlug = asyncHandler(async (req, res) => {
  const filter = { slug: req.params.slug };

  if (!req.admin) {
    filter.status = 'published';
  }

  const blog = await Blog.findOne(filter).lean();
  if (!blog) {
    throw new HttpError('Blog post not found.', 404);
  }

  res.json({ data: blog });
});

export const createBlog = asyncHandler(async (req, res) => {
  try {
    const blog = await Blog.create(normalizeBlogPayload(req.body));
    res.status(201).json({ data: blog });
  } catch (error) {
    ensureUniqueSlugError(error);
  }
});

export const updateBlog = asyncHandler(async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug },
      normalizeBlogPayload(req.body),
      { new: true, runValidators: true }
    );

    if (!blog) {
      throw new HttpError('Blog post not found.', 404);
    }

    res.json({ data: blog });
  } catch (error) {
    ensureUniqueSlugError(error);
  }
});

export const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findOneAndDelete({ slug: req.params.slug });

  if (!blog) {
    throw new HttpError('Blog post not found.', 404);
  }

  res.status(204).send();
});
