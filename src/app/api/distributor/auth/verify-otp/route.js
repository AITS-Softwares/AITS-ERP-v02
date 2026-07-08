import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import DistributorAccount from "@/models/DistributorAccount";
import DistributorAppUser from "@/models/DistributorAppUser";
import { hashOtp, normalizeEmailAddress, normalizeMobileNumber, signDistributorToken } from "@/lib/distributorAuth";
import { resolveERPNextCustomerByLogin } from "@/services/integrations/erpnext/distributorIdentityService";

export async function POST(req) {
  try {
    const { mobileNumber, emailAddress, distributorCode, otp, trustedDevice, loginMethod } = await req.json();
    const resolvedMethod = String(loginMethod || (emailAddress ? "email" : "mobile")).trim().toLowerCase() === "email" ? "email" : "mobile";
    const normalizedMobile = normalizeMobileNumber(mobileNumber);
    const normalizedEmail = normalizeEmailAddress(emailAddress);
    const normalizedCode = (distributorCode || "").trim().toUpperCase();

    if (resolvedMethod === "mobile" && (!normalizedMobile || !otp)) {
      return NextResponse.json({ message: "Mobile number and OTP are required" }, { status: 400 });
    }

    if (resolvedMethod === "email" && (!normalizedEmail || !otp)) {
      return NextResponse.json({ message: "Email address and OTP are required" }, { status: 400 });
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

    let user = null;
    if (resolvedMethod === "mobile") {
      const userQuery = {
        mobileNumber: normalizedMobile,
        isActive: true,
        loginEnabled: true,
      };
      if (account) {
        userQuery.distributorAccountId = account._id;
      }
      user = await DistributorAppUser.findOne(userQuery).populate("distributorAccountId");

      if (!user && account) {
        const erpCustomer = await resolveERPNextCustomerByLogin({
          companyId: account.companyId,
          account,
          emailAddress: normalizedEmail,
          mobileNumber: normalizedMobile,
        });

        if (erpCustomer?.name) {
          user = await DistributorAppUser.findOne({
            distributorAccountId: account._id,
            isActive: true,
            loginEnabled: true,
          }).populate("distributorAccountId");
        }
      }
    } else {
      const userQuery = {
        emailAddress: normalizedEmail,
        isActive: true,
        loginEnabled: true,
      };
      if (account) {
        userQuery.distributorAccountId = account._id;
      }
      user = await DistributorAppUser.findOne(userQuery).populate("distributorAccountId");

      if (!user && account) {
        const erpCustomer = await resolveERPNextCustomerByLogin({
          companyId: account.companyId,
          account,
          emailAddress: normalizedEmail,
          mobileNumber: normalizedMobile,
        });

        if (erpCustomer?.name) {
          user = await DistributorAppUser.findOne({
            distributorAccountId: account._id,
            isActive: true,
            loginEnabled: true,
          }).populate("distributorAccountId");
        }
      }
    }

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
        emailAddress: user.emailAddress || "",
        role: user.role,
        distributorAccountId: resolvedAccount?._id || null,
      },
    });
  } catch (error) {
    console.error("Distributor verify OTP error:", error);
    return NextResponse.json({ message: "Failed to verify OTP" }, { status: 500 });
  }
}
