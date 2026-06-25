import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import DistributorAccount from "@/models/DistributorAccount";
import DistributorAppUser from "@/models/DistributorAppUser";
import { hashOtp, normalizeMobileNumber, signDistributorToken } from "@/lib/distributorAuth";

export async function POST(req) {
  try {
    const { mobileNumber, distributorCode, otp, trustedDevice } = await req.json();
    const normalizedMobile = normalizeMobileNumber(mobileNumber);
    const normalizedCode = (distributorCode || "").trim().toUpperCase();

    if (!normalizedMobile || !otp) {
      return NextResponse.json({ message: "Mobile number and OTP are required" }, { status: 400 });
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
    if (!user || !user.otpHash || !user.otpExpiresAt) {
      return NextResponse.json({ message: "OTP request not found" }, { status: 404 });
    }

    if (user.otpExpiresAt.getTime() < Date.now()) {
      return NextResponse.json({ message: "OTP expired" }, { status: 400 });
    }

    if (user.otpHash !== hashOtp(otp)) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    const resolvedAccount = account || (await DistributorAccount.findById(user.distributorAccountId));
    const token = signDistributorToken(user, resolvedAccount, Boolean(trustedDevice));

    user.otpHash = "";
    user.otpExpiresAt = null;
    user.lastLoginAt = new Date();
    await user.save();

    return NextResponse.json({
      success: true,
      token,
      message: "Distributor login verified successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        mobileNumber: user.mobileNumber,
        role: user.role,
        distributorAccountId: resolvedAccount?._id || null,
      },
    });
  } catch (error) {
    console.error("Distributor verify OTP error:", error);
    return NextResponse.json({ message: "Failed to verify OTP" }, { status: 500 });
  }
}
