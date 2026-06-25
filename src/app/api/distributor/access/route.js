import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import DistributorAppUser from "@/models/DistributorAppUser";
import { normalizeMobileNumber } from "@/lib/distributorAuth";

export async function GET(req) {
  try {
    const distributorAccountId = req.nextUrl.searchParams.get("distributorAccountId");
    if (!distributorAccountId) {
      return NextResponse.json({ success: true, users: [] });
    }

    await dbConnect();
    const users = await DistributorAppUser.find({ distributorAccountId }).select(
      "fullName mobileNumber role loginEnabled financeAccess isActive lastLoginAt"
    );

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Distributor access GET error:", error);
    return NextResponse.json({ message: "Failed to fetch distributor users" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const {
      companyId,
      distributorAccountId,
      customerId,
      fullName,
      mobileNumber,
      role,
      loginEnabled,
      financeAccess,
    } = await req.json();

    if (!companyId || !distributorAccountId || !fullName || !mobileNumber) {
      return NextResponse.json({ message: "companyId, distributorAccountId, fullName, and mobileNumber are required" }, { status: 400 });
    }

    await dbConnect();

    const normalizedMobile = normalizeMobileNumber(mobileNumber);
    const user = await DistributorAppUser.findOneAndUpdate(
      { distributorAccountId, mobileNumber: normalizedMobile },
      {
        companyId,
        distributorAccountId,
        customerId: customerId || null,
        fullName,
        mobileNumber: normalizedMobile,
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
