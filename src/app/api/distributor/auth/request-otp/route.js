import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import DistributorAccount from "@/models/DistributorAccount";
import DistributorAppUser from "@/models/DistributorAppUser";
import { generateOtp, hashOtp, normalizeMobileNumber } from "@/lib/distributorAuth";

export async function POST(req) {
  try {
    const { mobileNumber, distributorCode } = await req.json();
    const normalizedMobile = normalizeMobileNumber(mobileNumber);
    const normalizedCode = (distributorCode || "").trim().toUpperCase();

    if (!normalizedMobile) {
      return NextResponse.json({ message: "Mobile number is required" }, { status: 400 });
    }

    await dbConnect();

    let account = null;
    if (normalizedCode) {
      account = await DistributorAccount.findOne({
        distributorCode: normalizedCode,
        isActive: true,
      });
      if (!account) {
        return NextResponse.json({ message: "Distributor account not found" }, { status: 404 });
      }
    }

    const userQuery = {
      mobileNumber: normalizedMobile,
      isActive: true,
      loginEnabled: true,
    };
    if (account) {
      userQuery.distributorAccountId = account._id;
    }

    const user = await DistributorAppUser.findOne(userQuery).populate("distributorAccountId");
    if (!user) {
      return NextResponse.json({ message: "No active distributor app user found for this mobile number" }, { status: 404 });
    }

    const otp = generateOtp();
    user.otpHash = hashOtp(otp);
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    const response = {
      success: true,
      message: "OTP generated. SMS integration can be connected in the next step.",
    };

    if (process.env.NODE_ENV !== "production") {
      response.previewOtp = otp;
      response.message = `OTP generated for local testing: ${otp}`;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Distributor request OTP error:", error);
    return NextResponse.json({ message: "Failed to request OTP" }, { status: 500 });
  }
}
