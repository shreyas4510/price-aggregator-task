import mongoose from "mongoose";

const priceSchema = new mongoose.Schema(
  {
    pair: { type: String, index: true },
    averagePrice: Number,
    exchanges: [
      {
        name: String,
        price: Number
      }
    ],
    timestamp: { type: Date, index: true }
  },
  { versionKey: false }
);

priceSchema.index({ pair: 1, timestamp: -1 });

export default mongoose.model("Price", priceSchema);
