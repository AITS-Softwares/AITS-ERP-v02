import mongoose from "mongoose";

function normalizeBaseUrl(value) {
  return String(value || "")
    .trim()
    .replace(/\/app\/home\/?$/i, "")
    .replace(/\/+$/, "");
}

const ErpNextConnectionSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    label: { type: String, trim: true, required: true },
    baseUrl: { type: String, trim: true, required: true },
    apiKey: { type: String, trim: true, required: true },
    apiSecret: { type: String, trim: true, required: true },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastTestedAt: { type: Date, default: null },
    lastTestStatus: { type: String, enum: ["success", "failure", ""], default: "" },
    lastTestMessage: { type: String, trim: true, default: "" },
  },
  { timestamps: true, collection: "erpnext_connections" }
);

ErpNextConnectionSchema.pre("validate", function normalizeConnectionUrl(next) {
  this.baseUrl = normalizeBaseUrl(this.baseUrl);
  next();
});

ErpNextConnectionSchema.index({ companyId: 1, label: 1 }, { unique: true });

export { normalizeBaseUrl };

export default mongoose.models.ErpNextConnection ||
  mongoose.model("ErpNextConnection", ErpNextConnectionSchema);
