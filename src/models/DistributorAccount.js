import mongoose from "mongoose";

const DistributorAccountSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
    distributorCode: { type: String, trim: true, uppercase: true, required: true },
    displayName: { type: String, trim: true, required: true },
    territory: { type: String, trim: true, default: "" },
    preferredWarehouse: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "distributor_accounts" }
);

DistributorAccountSchema.index({ companyId: 1, distributorCode: 1 }, { unique: true });

export default mongoose.models.DistributorAccount ||
  mongoose.model("DistributorAccount", DistributorAccountSchema);
