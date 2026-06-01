import mongoose from 'mongoose';

const selectedProductSchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30
    },
    shippingAddress: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    selectedProduct: {
      type: selectedProductSchema,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['bKash', 'Nagad', 'DBBL'],
      required: true
    },
    transactionId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Completed'],
      default: 'Pending',
      index: true
    }
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'selectedProduct.id': 1 });

orderSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  }
});

export const Order = mongoose.model('Order', orderSchema);
