import mongoose from "mongoose";
import { getNextDistributorDocumentNumber } from "@/lib/distributorDocuments";

const DistributorMaterialRequestSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    distributorAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "DistributorAccount", required: true },
    distributorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "DistributorAppUser", required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
    requestNumber: { type: String, required: true, unique: true },
    itemCode: { type: String, trim: true, required: true },
    itemName: { type: String, trim: true, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    scheduleDate: { type: Date, default: null },
    warehouseCode: { type: String, trim: true, default: "" },
    purpose: { type: String, trim: true, default: "" },
    remarks: { type: String, trim: true, default: "" },
    notifySales: { type: Boolean, default: true },
    status: { type: String, enum: ["Submitted", "In Review", "Approved", "Rejected"], default: "Submitted" },
    internalOwner: { type: String, trim: true, default: "" },
    adminNotes: { type: String, trim: true, default: "" },
    attachments: [
      {
        fileName: { type: String, trim: true, default: "" },
        fileUrl: { type: String, trim: true, default: "" },
        fileType: { type: String, trim: true, default: "" },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    erpSyncStatus: { type: String, enum: ["Pending", "Synced", "Failed", "Not Configured"], default: "Pending" },
    erpSyncReference: { type: String, trim: true, default: "" },
    erpSyncMessage: { type: String, trim: true, default: "" },
  },
  { timestamps: true, collection: "distributor_material_requests" }
);

DistributorMaterialRequestSchema.pre("validate", async function assignRequestNumber(next) {
  if (this.requestNumber) return next();
  try {
    this.requestNumber = await getNextDistributorDocumentNumber({
      companyId: this.companyId,
      counterId: "distributorMaterialRequest",
      prefix: "DMR",
    });
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.models.DistributorMaterialRequest ||
  mongoose.model("DistributorMaterialRequest", DistributorMaterialRequestSchema);
