import mongoose from "mongoose";

const integrationLogSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "CompanyUser" },
  integration: { type: String, required: true, index: true },
  action: { type: String, required: true },
  reference: { type: String, trim: true },
  status: { type: String, enum: ["success", "failure"], required: true },
  durationMs: { type: Number },
  errorCode: { type: String },
  message: { type: String },
}, { timestamps: true });

const IntegrationLog = mongoose.models.IntegrationLog || mongoose.model("IntegrationLog", integrationLogSchema);
export default IntegrationLog;

