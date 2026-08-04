import mongoose from "mongoose";

const schema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  cacheKey: { type: String, required: true },
  preview: { type: mongoose.Schema.Types.Mixed, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, { timestamps: true, collection: "distributor_pricing_preview" });

schema.index({ companyId: 1, cacheKey: 1 }, { unique: true });

export default mongoose.models.DistributorPricingPreview || mongoose.model("DistributorPricingPreview", schema);
