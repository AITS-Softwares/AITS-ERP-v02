import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import DistributorAppUser from "@/models/DistributorAppUser";
import { normalizeEmailAddress, normalizeMobileNumber } from "@/lib/distributorAuth";
import { getDistributorSession, unauthorizedDistributorResponse } from "@/lib/distributorSession";

function canManageAccess(session) {
  return session?.user?.role === "Owner";
}

export async function GET(req) {
  try {
    const session = await getDistributorSession(req);
    if (!session) return unauthorizedDistributorResponse();
    if (!canManageAccess(session)) return NextResponse.json({ success: false, message: "Only the distributor Owner can view team access" }, { status: 403 });

    await dbConnect();
    const users = await DistributorAppUser.find({ distributorAccountId: session.account._id }).select(
      "fullName mobileNumber emailAddress role loginEnabled financeAccess isActive lastLoginAt"
    );

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Distributor access GET error:", error);
    return NextResponse.json({ message: "Failed to fetch distributor users" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getDistributorSession(req);
    if (!session) return unauthorizedDistributorResponse();
    if (!canManageAccess(session)) return NextResponse.json({ success: false, message: "Only the distributor Owner can manage team access" }, { status: 403 });

    const {
      customerId,
      fullName,
      mobileNumber,
      emailAddress,
      role,
      loginEnabled,
      financeAccess,
    } = await req.json();

    if (!fullName || !mobileNumber) {
      return NextResponse.json({ message: "fullName and mobileNumber are required" }, { status: 400 });
    }

    await dbConnect();

    const normalizedMobile = normalizeMobileNumber(mobileNumber);
    const normalizedEmail = normalizeEmailAddress(emailAddress);
    const user = await DistributorAppUser.findOneAndUpdate(
      { distributorAccountId: session.account._id, mobileNumber: normalizedMobile },
      {
        companyId: session.companyId,
        distributorAccountId: session.account._id,
        customerId: customerId || null,
        fullName,
        mobileNumber: normalizedMobile,
        emailAddress: normalizedEmail,
        role: role || "Read only",
        loginEnabled: loginEnabled !== false,
        financeAccess: Boolean(financeAccess),
        isActive: true,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Distributor access POST error:", error);
    return NextResponse.json({ message: "Failed to save distributor user" }, { status: 500 });
  }
}
