export const runtime = "nodejs";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";
import DistributorAccount from "@/models/DistributorAccount";
import DistributorAppUser from "@/models/DistributorAppUser";

function normalizeEmail(value = "") {
  return String(value || "").trim().toLowerCase();
}

function unauthorized() {
  return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
}

async function getCompanyUser(req) {
  const token = getTokenFromHeader(req);
  if (!token) return null;
  const user = verifyJWT(token);
  if (!user?.companyId) return null;
  return user;
}

export async function GET(req) {
  try {
    const user = await getCompanyUser(req);
    if (!user) return unauthorized();

    await dbConnect();

    const [accounts, appUsers] = await Promise.all([
      DistributorAccount.find({ companyId: user.companyId, isActive: true }).select("displayName distributorCode").sort({ displayName: 1 }).lean(),
      DistributorAppUser.find({ companyId: user.companyId }).populate("distributorAccountId", "displayName distributorCode").sort({ createdAt: -1 }).lean(),
    ]);

    return NextResponse.json({
      success: true,
      distributorAccounts: accounts.map((account) => ({
        id: String(account._id),
        label: `${account.displayName || "Distributor"} (${account.distributorCode || ""})`.trim(),
      })),
      users: appUsers.map((appUser) => ({
        id: String(appUser._id),
        fullName: appUser.fullName,
        designation: appUser.designation || "",
        mobileNumber: appUser.mobileNumber,
        emailAddress: appUser.emailAddress || "",
        role: appUser.role,
        financeAccess: appUser.financeAccess === true,
        loginEnabled: appUser.loginEnabled !== false,
        isActive: appUser.isActive !== false,
        distributorAccountId: appUser.distributorAccountId?._id ? String(appUser.distributorAccountId._id) : "",
        distributorLabel: appUser.distributorAccountId
          ? `${appUser.distributorAccountId.displayName || ""} (${appUser.distributorAccountId.distributorCode || ""})`.trim()
          : "-",
      })),
    });
  } catch (error) {
    console.error("Admin distributor users GET error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch distributor users" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getCompanyUser(req);
    if (!user) return unauthorized();

    const body = await req.json().catch(() => ({}));
    const distributorAccountId = String(body.distributorAccountId || "").trim();
    const fullName = String(body.fullName || "").trim();
    const mobileNumber = String(body.mobileNumber || "").replace(/\D/g, "").slice(-10);
    const emailAddress = normalizeEmail(body.emailAddress);

    if (!distributorAccountId || !fullName || mobileNumber.length !== 10) {
      return NextResponse.json({ success: false, message: "Distributor, user name, and valid mobile number are required" }, { status: 400 });
    }

    if (emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
      return NextResponse.json({ success: false, message: "Valid email address is required" }, { status: 400 });
    }

    await dbConnect();

    const account = await DistributorAccount.findOne({ _id: distributorAccountId, companyId: user.companyId });
    if (!account) {
      return NextResponse.json({ success: false, message: "Distributor account not found" }, { status: 404 });
    }

    await DistributorAppUser.create({
      companyId: user.companyId,
      distributorAccountId,
      customerId: account.customerId || null,
      fullName,
      designation: String(body.designation || "").trim(),
      mobileNumber,
      emailAddress,
      role: String(body.role || "Read only").trim(),
      financeAccess: body.financeAccess === true,
      loginEnabled: body.loginEnabled !== false,
      isActive: body.isActive !== false,
    });

    return NextResponse.json({ success: true, message: "Distributor user created successfully" });
  } catch (error) {
    console.error("Admin distributor users POST error:", error);
    return NextResponse.json({ success: false, message: "Failed to create distributor user" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const user = await getCompanyUser(req);
    if (!user) return unauthorized();

    const body = await req.json().catch(() => ({}));
    const userId = String(body.userId || "").trim();
    if (!userId) {
      return NextResponse.json({ success: false, message: "User id is required" }, { status: 400 });
    }

    await dbConnect();

    const update = {
      role: String(body.role || "Read only").trim(),
      designation: String(body.designation || "").trim(),
      emailAddress: normalizeEmail(body.emailAddress),
      financeAccess: body.financeAccess === true,
      loginEnabled: body.loginEnabled !== false,
      isActive: body.isActive !== false,
    };

    if (update.emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(update.emailAddress)) {
      return NextResponse.json({ success: false, message: "Valid email address is required" }, { status: 400 });
    }

    const updatedUser = await DistributorAppUser.findOneAndUpdate(
      { _id: userId, companyId: user.companyId },
      { $set: update },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: "Distributor user not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Distributor user updated successfully" });
  } catch (error) {
    console.error("Admin distributor users PATCH error:", error);
    return NextResponse.json({ success: false, message: "Failed to update distributor user" }, { status: 500 });
  }
}
