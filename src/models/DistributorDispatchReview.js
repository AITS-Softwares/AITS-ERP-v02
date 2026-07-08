import mongoose from "mongoose";
import { getNextDistributorDocumentNumber } from "@/lib/distributorDocuments";

const DistributorDispatchReviewSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    distributorAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "DistributorAccount", required: true },
    distributorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "DistributorAppUser", required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
    reviewNumber: { type: String, required: true, unique: true },
    deliveryNoteNumber: { type: String, trim: true, required: true },
    salesOrderNumber: { type: String, trim: true, default: "" },
    salesInvoiceNumber: { type: String, trim: true, default: "" },
    reviewStatus: { type: String, enum: ["All Ok", "Issue"], required: true },
    issueType: { type: String, trim: true, default: "" },
    remarks: { type: String, trim: true, default: "" },
    notifyClaims: { type: Boolean, default: true },
    status: { type: String, enum: ["Submitted", "Reviewed"], default: "Submitted" },
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
  { timestamps: true, collection: "distributor_dispatch_reviews" }
);

DistributorDispatchReviewSchema.pre("validate", async function assignReviewNumber(next) {
  if (this.reviewNumber) return next();
  try {
    this.reviewNumber = await getNextDistributorDocumentNumber({
      companyId: this.companyId,
      counterId: "distributorDispatchReview",
      prefix: "DDR",
    });
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.models.DistributorDispatchReview ||
  mongoose.model("DistributorDispatchReview", DistributorDispatchReviewSchema);
