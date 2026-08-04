import { getTokenFromHeader, verifyJWT } from "@/lib/auth";

function hasAdminRole(roles = []) {
  return Array.isArray(roles) && roles.some((role) => String(role).trim().toLowerCase() === "admin");
}

/**
 * Distributor administration is intentionally separate from distributor OTP
 * users. A company owner, or a company user explicitly assigned Admin, may
 * manage connections, mappings, and distributor access.
 */
export function getDistributorAdminSession(req) {
  const token = getTokenFromHeader(req);
  if (!token) return null;

  const user = verifyJWT(token);
  if (!user?.companyId) return null;

  const isCompanyOwner = user.type === "company";
  const isAssignedAdmin = user.type === "user" && hasAdminRole(user.roles);
  if (!isCompanyOwner && !isAssignedAdmin) return null;

  return user;
}

