export const distributorUser = {
  name: "Shree Ganesh Distributors",
  code: "DIST-2048",
  city: "Pune",
  phone: "+91 98765 43210",
  route: "West Urban Belt",
  creditLimit: "Rs 12,00,000",
  availableCredit: "Rs 4,85,000",
  preferredWarehouse: "Pune Main Depot",
};

export const dashboardStats = [
  { label: "Open Orders", value: "12", change: "3 due today" },
  { label: "Outstanding", value: "Rs 7.15L", change: "2 invoices overdue" },
  { label: "Ready To Dispatch", value: "5", change: "1 high priority" },
  { label: "Active Offers", value: "8", change: "3 ending this week" },
];

export const categories = [
  "Beverages",
  "Snacks",
  "Personal Care",
  "Home Care",
  "Seasonal Packs",
];

export const products = [
  {
    id: "SKU-1001",
    name: "Premium Tea Pack 500g",
    category: "Beverages",
    price: "Rs 165",
    stock: "124 cases",
    moq: "20 cases",
    scheme: "Buy 10 get 1",
  },
  {
    id: "SKU-1002",
    name: "Salted Crunch Mix",
    category: "Snacks",
    price: "Rs 92",
    stock: "58 cases",
    moq: "12 cases",
    scheme: "2% line discount",
  },
  {
    id: "SKU-1003",
    name: "Herbal Soap Twin Pack",
    category: "Personal Care",
    price: "Rs 74",
    stock: "210 cases",
    moq: "30 cases",
    scheme: "Free display stand",
  },
  {
    id: "SKU-1004",
    name: "Floor Cleaner 1L",
    category: "Home Care",
    price: "Rs 138",
    stock: "36 cases",
    moq: "18 cases",
    scheme: "Flat 4% scheme",
  },
];

export const orders = [
  {
    id: "SO-24061",
    date: "24 Jun 2026",
    status: "Pending Approval",
    amount: "Rs 84,500",
    items: 18,
  },
  {
    id: "SO-24052",
    date: "22 Jun 2026",
    status: "Ready To Dispatch",
    amount: "Rs 1,12,300",
    items: 26,
  },
  {
    id: "SO-24031",
    date: "18 Jun 2026",
    status: "Delivered",
    amount: "Rs 68,900",
    items: 14,
  },
];

export const cartLines = [
  { name: "Premium Tea Pack 500g", qty: 24, rate: "Rs 165", total: "Rs 3,960" },
  { name: "Salted Crunch Mix", qty: 40, rate: "Rs 92", total: "Rs 3,680" },
  { name: "Floor Cleaner 1L", qty: 18, rate: "Rs 138", total: "Rs 2,484" },
];

export const stockItems = [
  {
    item: "Premium Tea Pack 500g",
    warehouse: "Pune Main Depot",
    available: "124 cases",
    reserved: "18 cases",
    status: "Healthy",
  },
  {
    item: "Salted Crunch Mix",
    warehouse: "Pune Main Depot",
    available: "58 cases",
    reserved: "12 cases",
    status: "Watch",
  },
  {
    item: "Floor Cleaner 1L",
    warehouse: "Nashik Transit Hub",
    available: "36 cases",
    reserved: "4 cases",
    status: "Low",
  },
];

export const financeSummary = [
  { label: "Total Outstanding", value: "Rs 7,15,400" },
  { label: "Not Yet Due", value: "Rs 4,20,300" },
  { label: "Overdue", value: "Rs 1,84,900" },
  { label: "Last Payment", value: "Rs 2,25,000" },
];

export const ledgerEntries = [
  { date: "23 Jun 2026", ref: "PAY-9031", type: "Payment", amount: "Rs 2,25,000", balance: "Rs 7,15,400" },
  { date: "20 Jun 2026", ref: "INV-8820", type: "Sales Invoice", amount: "Rs 1,12,300", balance: "Rs 9,40,400" },
  { date: "18 Jun 2026", ref: "CN-0712", type: "Credit Note", amount: "Rs 18,500", balance: "Rs 8,28,100" },
];

export const invoices = [
  { id: "INV-8820", date: "20 Jun 2026", amount: "Rs 1,12,300", due: "05 Jul 2026", status: "Open" },
  { id: "INV-8764", date: "14 Jun 2026", amount: "Rs 84,500", due: "29 Jun 2026", status: "Overdue" },
  { id: "INV-8622", date: "06 Jun 2026", amount: "Rs 68,900", due: "21 Jun 2026", status: "Part Paid" },
];

export const complaints = [
  { id: "CMP-102", invoice: "INV-8764", type: "Rate Issue", status: "Under Review", updated: "23 Jun 2026" },
  { id: "CMP-097", invoice: "INV-8622", type: "Short Quantity", status: "Resolved", updated: "19 Jun 2026" },
];

export const creditNotes = [
  { id: "CN-0712", against: "INV-8622", amount: "Rs 18,500", status: "Issued", date: "18 Jun 2026" },
  { id: "CN-0704", against: "INV-8541", amount: "Rs 9,800", status: "Adjusted", date: "09 Jun 2026" },
];

export const dispatches = [
  { id: "DN-4402", order: "SO-24052", vehicle: "MH12 AB 4477", eta: "25 Jun 2026, 4:30 PM", status: "In Transit" },
  { id: "DN-4381", order: "SO-24031", vehicle: "MH14 PQ 2031", eta: "Delivered", status: "Delivered" },
];

export const notifications = [
  { id: 1, title: "Order SO-24052 packed", body: "Dispatch scheduled from Pune Main Depot.", time: "2h ago", tone: "blue" },
  { id: 2, title: "Invoice INV-8764 is nearing due date", body: "Due in 5 days. Plan payment to avoid credit block.", time: "5h ago", tone: "amber" },
  { id: 3, title: "Monsoon promotion is live", body: "Extra slab discount on home care bundles.", time: "1d ago", tone: "green" },
];

export const offers = [
  { title: "Monsoon Retail Push", description: "4% scheme on home care bundles above Rs 75,000.", validity: "Valid till 30 Jun" },
  { title: "Snacks Counter Display", description: "Free display stand on 80 case mix order.", validity: "Valid till 05 Jul" },
  { title: "Fast Moving Tea Combo", description: "Buy 10 get 1 on premium tea packs.", validity: "Always on" },
];

export const quickActions = [
  { label: "Browse Products", href: "/distributor/products" },
  { label: "Create Order", href: "/distributor/orders/new" },
  { label: "Request Stock", href: "/distributor/stock/request" },
  { label: "Raise Complaint", href: "/distributor/complaints/new" },
];
