import { getTokenFromHeader, verifyJWT } from "@/lib/auth";

function roleNames(user) {
  return [user?.role, ...(Array.isArray(user?.roles) ? user.roles : [])]
    .map((role) => String(role || "").trim().toLowerCase())
    .filter(Boolean);
}

function hasWarehouseModule(user) {
  return ["Warehouse", "warehouse", "WMS", "wms"].some((module) => {
    const data = user?.modules?.[module];
    return Boolean(data?.selected || data?.permissions?.view || data?.permissions?.create || data?.permissions?.edit);
  });
}

export function getWarehouseSession(req, { manage = false } = {}) {
  const token = getTokenFromHeader(req);
  if (!token) return null;

  const user = verifyJWT(token);
  if (!user?.companyId) return null;

  const roles = roleNames(user);
  const isOwner = user.type === "company";
  const isSystemManager = roles.includes("admin") || roles.includes("system manager");
  const canUseWarehouse = isOwner || isSystemManager || hasWarehouseModule(user);
  if (!canUseWarehouse) return null;

  if (!manage) return user;

  const canManageModule = ["Warehouse", "warehouse", "WMS", "wms"].some((module) => {
    const permissions = user?.modules?.[module]?.permissions || {};
    return Boolean(permissions.edit || permissions.create || permissions.approve);
  });
  return isOwner || isSystemManager || canManageModule ? user : null;
}
