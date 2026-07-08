import mongoose from "mongoose";

const DistributorOfferSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    distributorAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "DistributorAccount", default: null },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
    title: { type: String, trim: true, required: true },
    description: { type: String, trim: true, default: "" },
    schemeTag: { type: String, trim: true, default: "" },
    itemCode: { type: String, trim: true, default: "" },
    minQty: { type: Number, default: 0 },
    rateNote: { type: String, trim: true, default: "" },
    bannerUrl: { type: String, trim: true, default: "" },
    validityLabel: { type: String, trim: true, default: "" },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "distributor_offers" }
);

DistributorOfferSchema.index({ companyId: 1, isActive: 1, endDate: 1 });

export default mongoose.models.DistributorOffer ||
  mongoose.model("DistributorOffer", DistributorOfferSchema);
