import mongoose from "mongoose";

const schema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, index: true },
  lastSyncedAt: { type: Date, default: null },
  recordCount: { type: Number, default: 0 },
  status: { type: String, enum: ["ready", "syncing", "failed"], default: "ready" },
  lastError: { type: String, default: "" },
}, { timestamps: true, collection: "distributor_stock_state" });
export default mongoose.models.DistributorStockState || mongoose.model("DistributorStockState", schema);
