import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Admin } from '../models/Admin.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

const getBearerToken = (req) => {
  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
};

const verifyAdminToken = async (token) => {
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const admin = await Admin.findById(payload.sub).select('_id username');

    if (!admin) {
      throw new HttpError('Admin account no longer exists.', 401);
    }

    return admin;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError('Invalid or expired admin token.', 401);
  }
};

export const requireAdminAuth = asyncHandler(async (req, _res, next) => {
  const token = getBearerToken(req);

  if (!token) {
    throw new HttpError('Admin authentication token is required.', 401);
  }

  req.admin = await verifyAdminToken(token);
  next();
});

export const optionalAdminAuth = asyncHandler(async (req, _res, next) => {
  const token = getBearerToken(req);

  if (!token) {
    return next();
  }

  try {
    req.admin = await verifyAdminToken(token);
  } catch {
    req.admin = null;
  }

  return next();
});
