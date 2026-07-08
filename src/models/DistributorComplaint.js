import mongoose from "mongoose";
import { getNextDistributorDocumentNumber } from "@/lib/distributorDocuments";

const DistributorComplaintSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    distributorAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "DistributorAccount", required: true },
    distributorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "DistributorAppUser", required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
    complaintNumber: { type: String, required: true, unique: true },
    invoiceNumber: { type: String, trim: true, required: true },
    deliveryNoteNumber: { type: String, trim: true, default: "" },
    complaintType: { type: String, trim: true, required: true },
    remarks: { type: String, trim: true, default: "" },
    attachmentExpected: { type: Boolean, default: false },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    assignedTeam: { type: String, trim: true, default: "Claims" },
    status: { type: String, enum: ["Open", "Under Review", "Resolved"], default: "Open" },
    linkedCreditNoteNumber: { type: String, trim: true, default: "" },
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
  { timestamps: true, collection: "distributor_complaints" }
);

DistributorComplaintSchema.pre("validate", async function assignComplaintNumber(next) {
  if (this.complaintNumber) return next();
  try {
    this.complaintNumber = await getNextDistributorDocumentNumber({
      companyId: this.companyId,
      counterId: "distributorComplaint",
      prefix: "DCM",
    });
    next();
  } catch (error) {
    next(error);
  }
});

DistributorComplaintSchema.index({ companyId: 1, distributorAccountId: 1, createdAt: -1 });

export default mongoose.models.DistributorComplaint ||
  mongoose.model("DistributorComplaint", DistributorComplaintSchema);
