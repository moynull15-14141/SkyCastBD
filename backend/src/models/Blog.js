import mongoose from 'mongoose';

const seoSchema = new mongoose.Schema(
  {
    metaTitle: {
      type: String,
      trim: true,
      maxlength: 70,
      default: ''
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: 170,
      default: ''
    },
    keywords: {
      type: String,
      trim: true,
      maxlength: 255,
      default: ''
    }
  },
  { _id: false }
);

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      index: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    featuredImage: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
    },
    seo: {
      type: seoSchema,
      default: () => ({})
    }
  },
  { timestamps: true }
);

blogSchema.index({ status: 1, date: -1 });

blogSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  }
});

export const Blog = mongoose.model('Blog', blogSchema);
