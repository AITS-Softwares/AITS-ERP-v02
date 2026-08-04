import mongoose from "mongoose";

const schema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  itemCode: { type: String, required: true, trim: true },
  itemName: { type: String, default: "", trim: true },
  itemGroup: { type: String, default: "", trim: true },
  isSalesItem: { type: Boolean, default: false, index: true },
  stockUom: { type: String, default: "", trim: true },
  imageUrl: { type: String, default: "" },
  availableQty: { type: Number, default: null },
  description: { type: String, default: "" },
  syncedAt: { type: Date, required: true },
}, { timestamps: true, collection: "distributor_catalog_items" });

schema.index({ companyId: 1, itemCode: 1 }, { unique: true });
schema.index({ companyId: 1, itemName: 1 });
schema.index({ companyId: 1, itemGroup: 1, itemName: 1 });

export default mongoose.models.DistributorCatalogItem || mongoose.model("DistributorCatalogItem", schema);
