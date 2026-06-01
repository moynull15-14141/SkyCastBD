import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

const normalizeProductPayload = (body) => ({
  title: body.title,
  description: body.description,
  regularPrice: body.regularPrice,
  salePrice: body.salePrice || 0,
  imageUrl: body.imageUrl || '',
  stockStatus: body.stockStatus || 'In Stock'
});

const normalizeOrderPayload = async (body) => {
  const product = await Product.findById(body.selectedProduct.id);

  if (!product) {
    throw new HttpError('Selected product was not found.', 404);
  }

  if (product.stockStatus !== 'In Stock') {
    throw new HttpError('Selected product is currently out of stock.', 409);
  }

  return {
    customerName: body.customerName,
    phone: body.phone,
    shippingAddress: body.shippingAddress,
    selectedProduct: {
      id: product._id.toString(),
      title: product.title
    },
    paymentMethod: body.paymentMethod,
    transactionId: body.transactionId,
    orderStatus: 'Pending'
  };
};

export const listProducts = asyncHandler(async (req, res) => {
  const { limit } = req.query;
  const products = await Product.find({}).sort({ createdAt: -1 }).limit(limit);
  res.json({ data: products });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(normalizeProductPayload(req.body));
  res.status(201).json({ data: product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    normalizeProductPayload(req.body),
    { new: true, runValidators: true }
  );

  if (!product) {
    throw new HttpError('Product not found.', 404);
  }

  res.json({ data: product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    throw new HttpError('Product not found.', 404);
  }

  res.status(204).send();
});

export const createOrder = asyncHandler(async (req, res) => {
  console.log('📦 Order Request Body:', JSON.stringify(req.body, null, 2));
  console.log('📦 Selected Product:', req.body.selectedProduct);
  const order = await Order.create(await normalizeOrderPayload(req.body));
  res.status(201).json({ data: order });
});

export const listOrders = asyncHandler(async (req, res) => {
  const { status, limit } = req.query;
  const filter = {};

  if (status && status !== 'all') {
    filter.orderStatus = status;
  }

  const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
  res.json({ data: orders });
});
