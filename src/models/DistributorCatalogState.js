import mongoose from "mongoose";

const schema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, index: true },
  lastSyncedAt: { type: Date, default: null },
  itemCount: { type: Number, default: 0 },
  schemaVersion: { type: Number, default: 1 },
  status: { type: String, enum: ["ready", "syncing", "failed"], default: "ready" },
  lastError: { type: String, default: "" },
}, { timestamps: true, collection: "distributor_catalog_state" });

export default mongoose.models.DistributorCatalogState || mongoose.model("DistributorCatalogState", schema);
