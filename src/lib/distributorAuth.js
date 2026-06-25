import crypto from "crypto";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

export function normalizeMobileNumber(value = "") {
  return value.replace(/\D/g, "").slice(-10);
}

export function hashOtp(otp) {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
}

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function signDistributorToken(user, account, trustedDevice = false) {
  return jwt.sign(
    {
      id: user._id,
      distributorAccountId: account._id,
      companyId: user.companyId,
      mobileNumber: user.mobileNumber,
      role: user.role,
      type: "distributor",
      trustedDevice,
    },
    SECRET,
    { expiresIn: trustedDevice ? "7d" : "1d" }
  );
}
