import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";
import DistributorAccount from "@/models/DistributorAccount";
import DistributorAppUser from "@/models/DistributorAppUser";
import { resolveERPNextDistributorContext } from "@/services/integrations/erpnext/distributorIdentityService";

export function unauthorizedDistributorResponse() {
  return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
}

export async function getDistributorSession(req) {
  const token = getTokenFromHeader(req);
  if (!token) return null;

  const payload = verifyJWT(token);
  if (!payload || payload.type !== "distributor") return null;

  await dbConnect();

  const [user, account] = await Promise.all([
    DistributorAppUser.findById(payload.id).lean(),
    DistributorAccount.findById(payload.distributorAccountId).lean(),
  ]);

  if (!user || !account || !account.isActive || !user.isActive || !user.loginEnabled) {
    return null;
  }

  const erpContext = await resolveERPNextDistributorContext({
    companyId: payload.companyId,
    account,
    user,
  }).catch(() => null);

  return {
    payload,
    user,
    account,
    erpCustomer: erpContext?.customer || null,
    companyId: payload.companyId,
  };
}
