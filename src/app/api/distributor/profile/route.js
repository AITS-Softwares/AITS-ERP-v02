import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";
import DistributorAccount from "@/models/DistributorAccount";
import DistributorAppUser from "@/models/DistributorAppUser";

export async function GET(req) {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return NextResponse.json({ success: true, profile: null });
    }

    const payload = verifyJWT(token);
    if (!payload || payload.type !== "distributor") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const [user, account] = await Promise.all([
      DistributorAppUser.findById(payload.id),
      DistributorAccount.findById(payload.distributorAccountId),
    ]);

    if (!user || !account) {
      return NextResponse.json({ success: true, profile: null });
    }

    return NextResponse.json({
      success: true,
      profile: {
        name: account.displayName,
        code: account.distributorCode,
        route: account.territory || "",
        preferredWarehouse: account.preferredWarehouse || "",
        phone: user.mobileNumber,
        userRole: user.role,
      },
    });
  } catch (error) {
    console.error("Distributor profile error:", error);
    return NextResponse.json({ message: "Failed to fetch profile" }, { status: 500 });
  }
}
