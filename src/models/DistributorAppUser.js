import mongoose from "mongoose";

const DistributorAppUserSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    distributorAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "DistributorAccount", required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
    fullName: { type: String, trim: true, required: true },
    mobileNumber: { type: String, trim: true, required: true, match: /^[0-9]{10}$/ },
    role: {
      type: String,
      enum: ["Owner", "Sales operator", "Accounts viewer", "Read only"],
      default: "Read only",
    },
    isActive: { type: Boolean, default: true },
    loginEnabled: { type: Boolean, default: true },
    financeAccess: { type: Boolean, default: false },
    otpHash: { type: String, default: "" },
    otpExpiresAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true, collection: "distributor_app_users" }
);

DistributorAppUserSchema.index({ distributorAccountId: 1, mobileNumber: 1 }, { unique: true });

export default mongoose.models.DistributorAppUser ||
  mongoose.model("DistributorAppUser", DistributorAppUserSchema);
