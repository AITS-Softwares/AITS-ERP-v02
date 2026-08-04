import {
  FiBell,
  FiBox,
  FiClipboard,
  FiCreditCard,
  FiGrid,
  FiKey,
  FiPackage,
  FiTruck,
  FiUser,
} from "react-icons/fi";

export const distributorNavGroups = [
  { title: "Overview", items: [{ label: "Dashboard", href: "/distributor", icon: FiGrid }] },
  {
    title: "Commerce",
    items: [
      { label: "Products", href: "/distributor/products", icon: FiBox },
      { label: "Orders", href: "/distributor/orders", icon: FiPackage },
      { label: "Stock", href: "/distributor/stock", icon: FiClipboard },
      { label: "Finance & Invoices", href: "/distributor/finance", icon: FiCreditCard },
      { label: "Credit Notes", href: "/distributor/credit-notes", icon: FiCreditCard },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Dispatch & Complaints", href: "/distributor/dispatch", icon: FiTruck },
      { label: "Notifications", href: "/distributor/notifications", icon: FiBell },
      { label: "Access", href: "/distributor/access", icon: FiKey },
      { label: "Profile", href: "/distributor/profile", icon: FiUser },
    ],
  },
];

export const distributorMobileNav = [
  { label: "Home", href: "/distributor", icon: FiGrid },
  { label: "Products", href: "/distributor/products", icon: FiBox },
  { label: "Orders", href: "/distributor/orders", icon: FiPackage },
  { label: "Stock", href: "/distributor/stock", icon: FiClipboard },
  { label: "Finance", href: "/distributor/finance", icon: FiCreditCard },
  { label: "Profile", href: "/distributor/profile", icon: FiUser },
];

const distributorRouteLabels = {
  access: "Access",
  complaints: "Dispatch & Complaints",
  "credit-notes": "Credit notes",
  dispatch: "Dispatch & Complaints",
  finance: "Finance",
  invoices: "Finance & Invoices",
  notifications: "Notifications",
  orders: "Orders",
  products: "Products",
  profile: "Profile",
  stock: "Stock",
};

const distributorDetailTitles = {
  complaints: "Complaint details",
  dispatch: "Dispatch details",
  invoices: "Invoice details",
  orders: "Order details",
  products: "Product details",
};

const distributorActionTitles = {
  "complaints/new": "New complaint",
  "orders/new": "New order",
  "stock/request": "Stock request",
};

export const distributorNavItems = distributorNavGroups.flatMap((group) => group.items);

export function navIsActive(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getRouteLabel(pathname) {
  if (!pathname) return "Previous";

  const match = [...distributorNavItems]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => navIsActive(pathname, item.href));

  return match?.label || "Previous";
}

export function getParentDistributorPath(pathname) {
  if (!pathname || pathname === "/distributor") return "";
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 2) return "/distributor";
  return `/distributor/${segments[1]}`;
}

export function getDistributorHeaderMeta(pathname) {
  const fallback = {
    eyebrow: "Distributor App",
    title: "Distributor workspace",
    breadcrumbs: [{ label: "Dashboard", href: "/distributor" }],
  };

  if (!pathname?.startsWith("/distributor")) return fallback;
  if (pathname === "/distributor") return fallback;

  const segments = pathname.split("/").filter(Boolean);
  const section = segments[1];
  const baseHref = `/distributor/${section}`;
  const baseLabel = distributorRouteLabels[section] || "Distributor";
  const childPath = segments.slice(1).join("/");
  const actionTitle = distributorActionTitles[childPath];
  const isDetail = segments.length > 2 && !actionTitle;
  const title = actionTitle || (isDetail ? (distributorDetailTitles[section] || `${baseLabel} details`) : baseLabel);

  const breadcrumbs = [
    { label: "Dashboard", href: "/distributor" },
    { label: baseLabel, href: baseHref },
  ];

  if (title !== baseLabel) {
    breadcrumbs.push({ label: title, href: pathname });
  }

  return {
    eyebrow: "Distributor App",
    title,
    breadcrumbs,
  };
}
