import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import DistributorAccount from "@/models/DistributorAccount";
import DistributorAppUser from "@/models/DistributorAppUser";
import { generateOtp, hashOtp, normalizeEmailAddress, normalizeMobileNumber } from "@/lib/distributorAuth";
import { sendDistributorOtp } from "@/lib/otpDelivery";
import { resolveERPNextCustomerByLogin } from "@/services/integrations/erpnext/distributorIdentityService";

export async function POST(req) {
  try {
    const { mobileNumber, emailAddress, distributorCode, loginMethod } = await req.json();
    const resolvedMethod = String(loginMethod || (emailAddress ? "email" : "mobile")).trim().toLowerCase() === "email" ? "email" : "mobile";
    const normalizedMobile = normalizeMobileNumber(mobileNumber);
    const normalizedEmail = normalizeEmailAddress(emailAddress);
    const normalizedCode = (distributorCode || "").trim().toUpperCase();

    if (resolvedMethod === "mobile" && !normalizedMobile) {
      return NextResponse.json({ message: "Mobile number is required" }, { status: 400 });
    }

    if (resolvedMethod === "email" && !normalizedEmail) {
      return NextResponse.json({ message: "Email address is required" }, { status: 400 });
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

    if (!user) {
      return NextResponse.json({ message: resolvedMethod === "email" ? "No active distributor app user found for this email address" : "No active distributor app user found for this mobile number" }, { status: 404 });
    }

    const otp = generateOtp();
    user.otpHash = hashOtp(otp);
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    const delivery = await sendDistributorOtp({
      companyId: user.companyId,
      method: resolvedMethod,
      mobileNumber: normalizedMobile,
      emailAddress: normalizedEmail || user.emailAddress || "",
      otp,
    });
    const response = {
      success: true,
      message: delivery.delivered
        ? `OTP sent successfully via ${delivery.channel}.`
        : "OTP generated for fallback preview mode.",
    };

    if (process.env.NODE_ENV !== "production" || !delivery.delivered) {
      response.previewOtp = otp;
      response.message = delivery.delivered
        ? `OTP sent successfully. Preview OTP available for local verification: ${otp}`
        : `OTP generated for local testing: ${otp}`;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Distributor request OTP error:", error);
    return NextResponse.json({ message: "Failed to request OTP" }, { status: 500 });
  }
}
