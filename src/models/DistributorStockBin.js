import mongoose from "mongoose";

const schema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  itemCode: { type: String, required: true, trim: true },
  warehouseCode: { type: String, required: true, trim: true },
  actualQty: { type: Number, default: 0 },
  reservedQty: { type: Number, default: 0 },
  projectedQty: { type: Number, default: 0 },
  availableQty: { type: Number, default: 0 },
  status: { type: String, enum: ["Healthy", "Watch", "Low"], default: "Low" },
  syncedAt: { type: Date, required: true },
}, { timestamps: true, collection: "distributor_stock_bins" });

schema.index({ companyId: 1, itemCode: 1, warehouseCode: 1 }, { unique: true });
schema.index({ companyId: 1, warehouseCode: 1, status: 1, itemCode: 1 });
export default mongoose.models.DistributorStockBin || mongoose.model("DistributorStockBin", schema);
