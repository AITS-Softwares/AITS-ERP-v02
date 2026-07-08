import mongoose from "mongoose";

const DistributorSyncLogSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    distributorAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "DistributorAccount", default: null },
    distributorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "DistributorAppUser", default: null },
    workflowType: { type: String, trim: true, default: "" },
    workflowNumber: { type: String, trim: true, default: "" },
    provider: { type: String, trim: true, default: "ERPNext" },
    action: { type: String, trim: true, default: "" },
    status: { type: String, trim: true, enum: ["Pending", "Synced", "Failed", "Not Configured"], default: "Pending" },
    reference: { type: String, trim: true, default: "" },
    message: { type: String, trim: true, default: "" },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, collection: "distributor_sync_logs" }
);

DistributorSyncLogSchema.index({ companyId: 1, createdAt: -1 });
DistributorSyncLogSchema.index({ companyId: 1, workflowType: 1, workflowNumber: 1, createdAt: -1 });

export default mongoose.models.DistributorSyncLog ||
  mongoose.model("DistributorSyncLog", DistributorSyncLogSchema);
