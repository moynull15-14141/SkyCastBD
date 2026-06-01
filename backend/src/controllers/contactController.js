import { ContactMessage } from '../models/ContactMessage.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createContactMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.create({
    name: req.body.name,
    email: req.body.email,
    message: req.body.message
  });

  res.status(201).json({ data: message });
});

export const listContactMessages = asyncHandler(async (_req, res) => {
  const messages = await ContactMessage.find({}).sort({ createdAt: -1 }).limit(200).lean();
  res.json({ data: messages });
});
