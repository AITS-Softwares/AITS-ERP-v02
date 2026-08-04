import mongoose from "mongoose";

const mappingSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, index: true },
  mappings: {
    type: Map,
    of: new mongoose.Schema({
      doctype: { type: String, required: true },
      fieldname: { type: String, required: true },
      label: { type: String, default: "" },
    }, { _id: false }),
    default: {},
  },
}, { timestamps: true });

export default mongoose.models.DistributorErpFieldMapping || mongoose.model("DistributorErpFieldMapping", mappingSchema);
