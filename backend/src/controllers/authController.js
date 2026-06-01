import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Admin } from '../models/Admin.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

const createToken = (admin) =>
  jwt.sign(
    {
      sub: admin._id.toString(),
      username: admin.username,
      role: 'admin'
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

export const ensureDefaultAdmin = async () => {
  if (!env.adminUsername || !env.adminPassword) {
    return;
  }

  const existingAdmin = await Admin.findOne({ username: env.adminUsername });
  if (existingAdmin) {
    return;
  }

  await Admin.create({
    username: env.adminUsername,
    password: env.adminPassword
  });

  console.log(`Default admin account created for ${env.adminUsername}.`);
};

export const loginAdmin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username: username.toLowerCase() }).select('+password');

  if (!admin) {
    throw new HttpError('Invalid admin credentials.', 401);
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    throw new HttpError('Invalid admin credentials.', 401);
  }

  res.json({
    data: {
      token: createToken(admin),
      admin: {
        id: admin._id.toString(),
        username: admin.username
      }
    }
  });
});
