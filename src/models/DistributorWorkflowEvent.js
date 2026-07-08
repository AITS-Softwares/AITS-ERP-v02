import mongoose from "mongoose";

const DistributorWorkflowEventSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    distributorAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "DistributorAccount", default: null },
    distributorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "DistributorAppUser", default: null },
    workflowType: { type: String, trim: true, required: true },
    workflowNumber: { type: String, trim: true, required: true },
    actorType: { type: String, trim: true, enum: ["distributor", "admin", "system"], default: "system" },
    actorLabel: { type: String, trim: true, default: "" },
    title: { type: String, trim: true, required: true },
    description: { type: String, trim: true, default: "" },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, collection: "distributor_workflow_events" }
);

DistributorWorkflowEventSchema.index({ companyId: 1, workflowType: 1, workflowNumber: 1, createdAt: -1 });

export default mongoose.models.DistributorWorkflowEvent ||
  mongoose.model("DistributorWorkflowEvent", DistributorWorkflowEventSchema);
