export const distributorUser = {
  name: "",
  code: "",
  city: "",
  phone: "",
  route: "",
  userRole: "",
  creditLimit: "",
  availableCredit: "",
  preferredWarehouse: "",
};

export const dashboardStats = [];
export const categories = [];
export const products = [];
export const orders = [];
export const cartLines = [];
export const stockItems = [];
export const financeSummary = [];
export const ledgerEntries = [];
export const invoices = [];
export const complaints = [];
export const creditNotes = [];
export const dispatches = [];
export const notifications = [];
export const offers = [];
export const teamMembers = [];
export const savedAddresses = [];

export const accessRoles = [
  { role: "Owner", scope: "Full distributor access", modules: "Orders, stock, finance, complaints, team" },
  { role: "Sales operator", scope: "Commercial workflow", modules: "Products, orders, stock request, dispatch view" },
  { role: "Accounts viewer", scope: "Finance workflow", modules: "Invoices, ledger, payments, credit notes" },
  { role: "Read only", scope: "View only", modules: "Dashboard, products, notifications" },
];

export const otpPolicies = [
  { title: "Primary login ID", detail: "Mobile number linked to distributor contact" },
  { title: "ERPNext mapping", detail: "Recommended mapping is ERPNext Customer with Contact mobile" },
  { title: "Fallback identity", detail: "Distributor code for branch or operator selection" },
  { title: "Session rule", detail: "OTP on login, with trusted-device rule later" },
];

export const supportChannels = [
  { title: "Distributor support desk", detail: "", note: "Ordering and stock help" },
  { title: "Accounts follow-up", detail: "", note: "Invoices, ledgers, payment follow-up" },
  { title: "Claims and complaints", detail: "", note: "Short quantity and rate issues" },
];

export const quickActions = [
  { label: "Browse Products", href: "/distributor/products" },
  { label: "Create Order", href: "/distributor/orders/new" },
  { label: "Request Stock", href: "/distributor/stock/request" },
  { label: "Raise Complaint", href: "/distributor/complaints/new" },
];

export const complaintTypeOptions = [
  { value: "Rate Issue", label: "Rate Issue" },
  { value: "Short Quantity", label: "Short Quantity" },
  { value: "Misbilling", label: "Misbilling" },
  { value: "Others", label: "Others" },
];

export const dispatchIssueOptions = [
  { value: "misbill", label: "Misbill" },
  { value: "rate-issue", label: "Rate issue" },
  { value: "qty-issue", label: "Qty issue" },
  { value: "others", label: "Others" },
];

export const requestTypeOptions = [
  { value: "urgent-replenishment", label: "Urgent replenishment" },
  { value: "promo-demand", label: "Promotion demand" },
  { value: "seasonal-build", label: "Seasonal build-up" },
];

export const paymentModeOptions = [
  { value: "credit", label: "Credit against approved limit" },
  { value: "bank", label: "Bank transfer / NEFT" },
  { value: "upi", label: "UPI collection" },
];

export const financePaymentModeOptions = [
  { value: "bank", label: "Bank transfer / NEFT" },
  { value: "upi", label: "UPI" },
  { value: "cheque", label: "Cheque" },
];

export function getProductById(id) {
  return products.find((item) => item.id === id);
}

export function getOrderById(id) {
  return orders.find((item) => item.id === id);
}

export function getInvoiceById(id) {
  return invoices.find((item) => item.id === id);
}

export function getComplaintById(id) {
  return complaints.find((item) => item.id === id);
}

export function getDispatchById(id) {
  return dispatches.find((item) => item.id === id);
}
