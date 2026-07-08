import mongoose from "mongoose";

const DistributorOtpSettingsSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, unique: true },
    brandName: { type: String, trim: true, default: "ERPExpress Distributor App" },
    email: {
      host: { type: String, trim: true, default: "smtp.gmail.com" },
      port: { type: Number, default: 465 },
      secure: { type: Boolean, default: true },
      user: { type: String, trim: true, default: "" },
      pass: { type: String, trim: true, default: "" },
      from: { type: String, trim: true, default: "" },
    },
    mobile: {
      provider: { type: String, trim: true, default: "twilio" },
      channel: { type: String, trim: true, default: "sms" },
      accountSid: { type: String, trim: true, default: "" },
      authToken: { type: String, trim: true, default: "" },
      apiKeySid: { type: String, trim: true, default: "" },
      apiKeySecret: { type: String, trim: true, default: "" },
      phoneNumber: { type: String, trim: true, default: "" },
      messagingServiceSid: { type: String, trim: true, default: "" },
      whatsappFrom: { type: String, trim: true, default: "" },
    },
  },
  { timestamps: true, collection: "distributor_otp_settings" }
);

export default mongoose.models.DistributorOtpSettings ||
  mongoose.model("DistributorOtpSettings", DistributorOtpSettingsSchema);
