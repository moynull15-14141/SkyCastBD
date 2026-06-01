import mongoose from 'mongoose';

const searchLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['city_search', 'weather_current'],
      required: true,
      index: true
    },
    query: {
      type: String,
      required: true,
      trim: true
    },
    locationName: {
      type: String,
      trim: true
    },
    resultCount: {
      type: Number,
      default: 0
    },
    ip: String,
    userAgent: String
  },
  { timestamps: true }
);

searchLogSchema.index({ createdAt: -1 });

export const SearchLog = mongoose.model('SearchLog', searchLogSchema);
