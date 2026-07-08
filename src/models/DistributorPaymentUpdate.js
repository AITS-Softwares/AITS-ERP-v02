import mongoose from "mongoose";
import { getNextDistributorDocumentNumber } from "@/lib/distributorDocuments";

const DistributorPaymentUpdateSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    distributorAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "DistributorAccount", required: true },
    distributorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "DistributorAppUser", required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
    updateNumber: { type: String, required: true, unique: true },
    invoiceNumber: { type: String, trim: true, required: true },
    paymentMode: { type: String, trim: true, required: true },
    amount: { type: Number, required: true, min: 0 },
    reference: { type: String, trim: true, default: "" },
    notifyAccounts: { type: Boolean, default: true },
    status: { type: String, enum: ["Submitted", "Acknowledged"], default: "Submitted" },
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
  { timestamps: true, collection: "distributor_payment_updates" }
);

DistributorPaymentUpdateSchema.pre("validate", async function assignUpdateNumber(next) {
  if (this.updateNumber) return next();
  try {
    this.updateNumber = await getNextDistributorDocumentNumber({
      companyId: this.companyId,
      counterId: "distributorPaymentUpdate",
      prefix: "DPU",
    });
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.models.DistributorPaymentUpdate ||
  mongoose.model("DistributorPaymentUpdate", DistributorPaymentUpdateSchema);
