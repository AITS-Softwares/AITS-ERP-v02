import CreditNote from "@/models/CreditMemo";
import DistributorComplaint from "@/models/DistributorComplaint";
import DistributorDispatchReview from "@/models/DistributorDispatchReview";
import DistributorMaterialRequest from "@/models/DistributorMaterialRequest";
import DistributorOffer from "@/models/DistributorOffer";
import DistributorPaymentUpdate from "@/models/DistributorPaymentUpdate";
import DistributorAppUser from "@/models/DistributorAppUser";
import DistributorWorkflowEvent from "@/models/DistributorWorkflowEvent";
import Item from "@/models/ItemModels";
import Payment from "@/models/Payment";
import SalesInvoice from "@/models/SalesInvoice";
import SalesOrder from "@/models/SalesOrder";
import Delivery from "@/models/deliveryModels";

function formatCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN");
}

function getAddressLabel(address, label) {
  const parts = [address?.address1, address?.address2, address?.city, address?.state, address?.pin].filter(Boolean);
  return {
    label,
    type: label === "Billing" ? "Billing" : "Shipping",
    address: parts.join(", "),
  };
}

function mapAttachments(items = []) {
  return (items || []).map((attachment, index) => ({
    id: `${attachment.fileUrl || attachment.fileName || "file"}-${index}`,
    fileName: attachment.fileName || "Attachment",
    fileUrl: attachment.fileUrl || "",
    fileType: attachment.fileType || "",
    uploadedAt: formatDate(attachment.uploadedAt),
  }));
}

function buildWorkflowHistoryMap(events = []) {
  return events.reduce((acc, event) => {
    const key = `${event.workflowType}:${event.workflowNumber}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push({
      id: String(event._id),
      title: event.title || "Update",
      description: event.description || "",
      actorType: event.actorType || "system",
      actorLabel: event.actorLabel || "System",
      time: formatDate(event.createdAt),
      sortTime: new Date(event.createdAt || Date.now()).getTime(),
    });
    return acc;
  }, {});
}

export async function buildDistributorAppData({ companyId, account, customer, user }) {
  const preferredWarehouse = account.preferredWarehouse || "";
  const customerCode = customer?.customerCode || "";
  const customerId = customer?._id || null;

  const orderQuery = {
    companyId,
    ...(customerId || customerCode
      ? {
          $or: [
            ...(customerId ? [{ customer: customerId }] : []),
            ...(customerCode ? [{ customerCode }] : []),
          ],
        }
      : {}),
  };

  const invoiceQuery = {
    companyId,
    ...(customerId || customerCode
      ? {
          $or: [
            ...(customerId ? [{ customer: customerId }] : []),
            ...(customerCode ? [{ customerCode }] : []),
          ],
        }
      : {}),
  };

  const deliveryQuery = {
    companyId,
    ...(customerId || customerCode
      ? {
          $or: [
            ...(customerId ? [{ customer: customerId }] : []),
            ...(customerCode ? [{ customerCode }] : []),
          ],
        }
      : {}),
  };

  const creditNoteQuery = {
    companyId,
    ...(customerId || customerCode
      ? {
          $or: [
            ...(customerId ? [{ customer: customerId }] : []),
            ...(customerCode ? [{ customerCode }] : []),
          ],
        }
      : {}),
  };

  const paymentQuery = {
    companyId,
    partyType: "Customer",
    ...(customerId ? { partyId: customerId } : customer?.customerName ? { partyName: customer.customerName } : {}),
  };

  const [
    itemDocs,
    orderDocs,
    invoiceDocs,
    deliveryDocs,
    creditNoteDocs,
    paymentDocs,
    teamDocs,
    complaintDocs,
    offerDocs,
    materialRequestDocs,
    paymentUpdateDocs,
    dispatchReviewDocs,
    workflowEventDocs,
  ] = await Promise.all([
    Item.find({ companyId, active: true }).sort({ itemName: 1 }).limit(60).lean(),
    SalesOrder.find(orderQuery).sort({ postingDate: -1, createdAt: -1 }).limit(20).lean(),
    SalesInvoice.find(invoiceQuery).sort({ postingDate: -1, createdAt: -1 }).limit(20).lean(),
    Delivery.find(deliveryQuery).sort({ deliveryDate: -1, createdAt: -1 }).limit(20).populate("salesOrderId", "documentNumberOrder").lean(),
    CreditNote.find(creditNoteQuery).sort({ postingDate: -1, createdAt: -1 }).limit(20).lean(),
    Payment.find(paymentQuery).sort({ paymentDate: -1, createdAt: -1 }).limit(20).lean(),
    DistributorAppUser.find({ distributorAccountId: account._id }).select("fullName mobileNumber role financeAccess loginEnabled isActive lastLoginAt").lean(),
    DistributorComplaint.find({ companyId, distributorAccountId: account._id }).sort({ updatedAt: -1 }).limit(20).lean(),
    DistributorOffer.find({
      companyId,
      isActive: true,
      $or: [
        { distributorAccountId: account._id },
        ...(customerId ? [{ customerId }] : []),
        { distributorAccountId: null, customerId: null },
      ],
    }).sort({ createdAt: -1 }).limit(12).lean(),
    DistributorMaterialRequest.find({ companyId, distributorAccountId: account._id }).sort({ createdAt: -1 }).limit(10).lean(),
    DistributorPaymentUpdate.find({ companyId, distributorAccountId: account._id }).sort({ createdAt: -1 }).limit(10).lean(),
    DistributorDispatchReview.find({ companyId, distributorAccountId: account._id }).sort({ createdAt: -1 }).limit(10).lean(),
    DistributorWorkflowEvent.find({
      companyId,
      distributorAccountId: account._id,
    }).sort({ createdAt: -1 }).limit(120).lean(),
  ]);

  const workflowHistoryMap = buildWorkflowHistoryMap(workflowEventDocs);

  const categories = [...new Set(itemDocs.map((item) => item.category).filter(Boolean))];

  const products = itemDocs.map((item) => ({
    id: item.itemCode,
    itemCode: item.itemCode,
    itemName: item.itemName,
    itemGroup: item.category,
    stockUom: item.uom || "Nos",
    standardRate: formatCurrency(item.unitPrice),
    gstRate: item.gstRate || 0,
    reorderLevel: item.reorderLevel || 0,
    projectedQty: item.quantity ?? 0,
    stock: `${item.quantity ?? 0} qty`,
    description: item.description || "",
    scheme: "",
    highlights: [],
  }));

  const stockItems = itemDocs.slice(0, 30).map((item) => {
    const actualQty = item.quantity ?? 0;
    const reorderLevel = item.reorderLevel ?? 0;
    return {
      itemCode: item.itemCode,
      item: item.itemName,
      warehouseCode: preferredWarehouse || "Default",
      actualQty,
      reservedQty: 0,
      projectedQty: actualQty,
      status: actualQty <= reorderLevel ? "Watch" : "Healthy",
    };
  });

  const orders = orderDocs.map((order) => ({
    id: order.documentNumberOrder,
    documentNumberOrder: order.documentNumberOrder,
    customerName: order.customerName,
    postingDate: formatDate(order.postingDate || order.orderDate),
    expectedDeliveryDate: formatDate(order.expectedDeliveryDate),
    deliveryDate: formatDate(order.expectedDeliveryDate),
    status: order.status || "Open",
    grandTotal: formatCurrency(order.grandTotal),
    amount: formatCurrency(order.grandTotal),
    shipTo: order.shippingAddress?.address1 || order.shippingAddress?.city || "",
    remarks: order.remarks || "",
    items: (order.items || []).map((line) => ({
      itemCode: line.itemCode,
      itemName: line.itemName,
      quantity: line.quantity,
      unitPrice: formatCurrency(line.unitPrice),
      totalAmount: formatCurrency(line.totalAmount),
    })),
    history: (workflowHistoryMap[`salesOrder:${order.documentNumberOrder}`] || [])
      .sort((a, b) => b.sortTime - a.sortTime)
      .map(({ sortTime, ...entry }) => entry),
  }));

  const invoices = invoiceDocs.map((invoice) => ({
    id: invoice.invoiceNumber,
    invoiceNumber: invoice.invoiceNumber,
    postingDate: formatDate(invoice.postingDate || invoice.invoiceDate),
    dueDate: formatDate(invoice.dueDate),
    paymentStatus: invoice.paymentStatus || invoice.status || "Pending",
    status: invoice.paymentStatus || invoice.status || "Pending",
    grandTotal: formatCurrency(invoice.grandTotal),
    amount: formatCurrency(invoice.grandTotal),
    remainingAmount: formatCurrency(invoice.remainingAmount || invoice.openBalance),
    balance: formatCurrency(invoice.remainingAmount || invoice.openBalance),
    salesOrder: invoice.refNumber || "",
    orderId: invoice.refNumber || "",
    openBalanceRaw: Number(invoice.remainingAmount || invoice.openBalance || 0),
    remarks: invoice.remarks || "",
    attachments: mapAttachments(invoice.attachments),
  }));

  const dispatches = deliveryDocs.map((delivery) => ({
    id: delivery.documentNumberDelivery,
    documentNumberDelivery: delivery.documentNumberDelivery,
    salesOrder: delivery.salesOrderId?.documentNumberOrder || delivery.refNumber || "",
    order: delivery.salesOrderId?.documentNumberOrder || delivery.refNumber || "",
    deliveryDate: formatDate(delivery.deliveryDate || delivery.expectedDeliveryDate),
    eta: formatDate(delivery.deliveryDate || delivery.expectedDeliveryDate),
    vehicleNumber: "",
    vehicle: "",
    driver: "",
    contact: delivery.contactPerson || customer?.contactPersonName || customer?.mobileNumber || "",
    status: delivery.status || "Pending",
  }));

  const creditNotes = creditNoteDocs.map((note) => ({
    id: note.documentNumberCreditNote,
    documentNumberCreditNote: note.documentNumberCreditNote,
    against: note.refNumber || "-",
    postingDate: formatDate(note.postingDate || note.memoDate),
    amount: formatCurrency(note.grandTotal),
    status: note.status || "Issued",
  }));

  const complaints = complaintDocs.map((complaint) => ({
    id: complaint.complaintNumber,
    complaintNumber: complaint.complaintNumber,
    invoice: complaint.invoiceNumber,
    deliveryNote: complaint.deliveryNoteNumber || "-",
    type: complaint.complaintType,
    status: complaint.status,
    priority: complaint.priority,
    owner: complaint.assignedTeam,
    updated: formatDate(complaint.updatedAt),
    erpSyncStatus: complaint.erpSyncStatus || "Pending",
    erpSyncReference: complaint.erpSyncReference || "",
    erpSyncMessage: complaint.erpSyncMessage || "",
    linkedCreditNoteNumber: complaint.linkedCreditNoteNumber || "",
    adminNotes: complaint.adminNotes || "",
    attachments: mapAttachments(complaint.attachments),
    history: (workflowHistoryMap[`complaint:${complaint.complaintNumber}`] || [])
      .sort((a, b) => b.sortTime - a.sortTime)
      .map(({ sortTime, ...entry }) => entry),
  }));

  const materialRequests = materialRequestDocs.map((request) => ({
    id: request.requestNumber,
    requestNumber: request.requestNumber,
    itemCode: request.itemCode,
    itemName: request.itemName || "",
    quantity: request.quantity,
    scheduleDate: formatDate(request.scheduleDate),
    warehouseCode: request.warehouseCode || "",
    purpose: request.purpose || "",
    status: request.status,
    erpSyncStatus: request.erpSyncStatus || "Pending",
    erpSyncReference: request.erpSyncReference || "",
    attachments: mapAttachments(request.attachments),
    history: (workflowHistoryMap[`materialRequest:${request.requestNumber}`] || [])
      .sort((a, b) => b.sortTime - a.sortTime)
      .map(({ sortTime, ...entry }) => entry),
  }));

  const paymentUpdates = paymentUpdateDocs.map((update) => ({
    id: update.updateNumber,
    updateNumber: update.updateNumber,
    invoiceNumber: update.invoiceNumber,
    paymentMode: update.paymentMode,
    amount: formatCurrency(update.amount),
    reference: update.reference || "",
    status: update.status,
    erpSyncStatus: update.erpSyncStatus || "Pending",
    erpSyncReference: update.erpSyncReference || "",
    attachments: mapAttachments(update.attachments),
    history: (workflowHistoryMap[`paymentUpdate:${update.updateNumber}`] || [])
      .sort((a, b) => b.sortTime - a.sortTime)
      .map(({ sortTime, ...entry }) => entry),
  }));

  const dispatchReviews = dispatchReviewDocs.map((review) => ({
    id: review.reviewNumber,
    reviewNumber: review.reviewNumber,
    deliveryNoteNumber: review.deliveryNoteNumber,
    salesOrderNumber: review.salesOrderNumber || "",
    salesInvoiceNumber: review.salesInvoiceNumber || "",
    reviewStatus: review.reviewStatus,
    issueType: review.issueType || "",
    status: review.status,
    remarks: review.remarks || "",
    erpSyncStatus: review.erpSyncStatus || "Pending",
    erpSyncReference: review.erpSyncReference || "",
    attachments: mapAttachments(review.attachments),
    history: (workflowHistoryMap[`dispatchReview:${review.reviewNumber}`] || [])
      .sort((a, b) => b.sortTime - a.sortTime)
      .map(({ sortTime, ...entry }) => entry),
  }));

  const offers = offerDocs.map((offer) => ({
    title: offer.title,
    description: offer.description,
    schemeTag: offer.schemeTag || "",
    itemCode: offer.itemCode || "",
    minQty: offer.minQty || 0,
    rateNote: offer.rateNote || "",
    bannerUrl: offer.bannerUrl || "",
    validity: offer.validityLabel || (offer.endDate ? `Valid till ${formatDate(offer.endDate)}` : "Active"),
  }));

  const totalOutstanding = invoiceDocs.reduce((sum, invoice) => sum + Number(invoice.remainingAmount || invoice.openBalance || 0), 0);
  const overdueInvoices = invoiceDocs.filter((invoice) => {
    const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null;
    return dueDate && dueDate.getTime() < Date.now() && Number(invoice.remainingAmount || invoice.openBalance || 0) > 0;
  });
  const overdueOutstanding = overdueInvoices.reduce((sum, invoice) => sum + Number(invoice.remainingAmount || invoice.openBalance || 0), 0);
  const receiptDocs = paymentDocs.filter((payment) => payment.type === "Receipt" && payment.status !== "Cancelled");
  const totalReceipts = receiptDocs.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const totalCreditNotes = creditNoteDocs.reduce((sum, note) => sum + Number(note.grandTotal || 0), 0);

  const financeSummary = [
    { label: "Outstanding", value: formatCurrency(totalOutstanding), change: `${invoiceDocs.length} Sales Invoices` },
    { label: "Overdue", value: formatCurrency(overdueOutstanding), change: `${overdueInvoices.length} overdue invoices` },
    { label: "Receipts", value: formatCurrency(totalReceipts), change: `${receiptDocs.length} receipt entries` },
    { label: "Credit Notes", value: formatCurrency(totalCreditNotes), change: `${creditNoteDocs.length} issued notes` },
  ];

  const ledgerRows = [
    ...invoiceDocs.map((invoice) => ({
      date: new Date(invoice.postingDate || invoice.invoiceDate || invoice.createdAt || Date.now()),
      ref: invoice.invoiceNumber,
      type: "Sales Invoice",
      amount: Number(invoice.grandTotal || 0),
      delta: Number(invoice.grandTotal || 0),
    })),
    ...creditNoteDocs.map((note) => ({
      date: new Date(note.postingDate || note.memoDate || note.createdAt || Date.now()),
      ref: note.documentNumberCreditNote,
      type: "Credit Note",
      amount: Number(note.grandTotal || 0),
      delta: -Number(note.grandTotal || 0),
    })),
    ...receiptDocs.map((payment) => ({
      date: new Date(payment.paymentDate || payment.createdAt || Date.now()),
      ref: payment.paymentNumber,
      type: "Payment",
      amount: Number(payment.amount || 0),
      delta: -Number(payment.amount || 0),
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  let runningBalance = 0;
  const ledgerEntries = ledgerRows.map((entry) => {
    runningBalance += entry.delta;
    return {
      date: formatDate(entry.date),
      ref: entry.ref,
      type: entry.type,
      amount: formatCurrency(entry.amount),
      balance: formatCurrency(runningBalance),
      sortDate: entry.date.getTime(),
    };
  }).sort((a, b) => b.sortDate - a.sortDate).map(({ sortDate, ...entry }) => entry);

  const profile = {
    name: account.displayName || customer?.customerName || "",
    code: account.distributorCode || customer?.customerCode || "",
    city: customer?.shippingAddresses?.[0]?.city || customer?.billingAddresses?.[0]?.city || "",
    phone: user.mobileNumber || customer?.mobileNumber || "",
    route: account.territory || "",
    userRole: user.role,
    creditLimit: customer?.creditLimit ? formatCurrency(customer.creditLimit) : "Pending configuration",
    availableCredit: totalOutstanding ? formatCurrency(Math.max(0, Number(customer?.creditLimit || 0) - totalOutstanding)) : "Pending configuration",
    preferredWarehouse,
  };

  const billingAddress = customer?.billingAddresses?.[0] ? [getAddressLabel(customer.billingAddresses[0], "Billing")] : [];
  const shippingAddresses = (customer?.shippingAddresses || []).map((address, index) => getAddressLabel(address, index === 0 ? "Primary Shipping" : `Shipping ${index + 1}`));

  const teamMembers = teamDocs.map((member) => ({
    name: member.fullName,
    role: member.role,
    access: member.financeAccess ? "Commercial and finance access" : "Commercial access",
    lastActive: member.lastLoginAt ? formatDate(member.lastLoginAt) : "Not logged in",
  }));

  const notifications = [
    ...overdueInvoices.slice(0, 3).map((invoice) => ({
      id: `invoice-${invoice.invoiceNumber}`,
      title: `Overdue invoice ${invoice.invoiceNumber}`,
      body: `Outstanding amount ${formatCurrency(invoice.remainingAmount || invoice.openBalance)} requires follow-up.`,
      tone: "amber",
      time: formatDate(invoice.dueDate),
      sortTime: new Date(invoice.dueDate || invoice.updatedAt || invoice.createdAt || Date.now()).getTime(),
    })),
    ...complaintDocs.slice(0, 3).map((complaint) => ({
      id: `complaint-${complaint.complaintNumber}`,
      title: `Complaint ${complaint.complaintNumber}`,
      body: `${complaint.complaintType} linked to invoice ${complaint.invoiceNumber} is ${complaint.status.toLowerCase()}.`,
      tone: complaint.status === "Resolved" ? "green" : "blue",
      time: formatDate(complaint.updatedAt),
      sortTime: new Date(complaint.updatedAt || complaint.createdAt || Date.now()).getTime(),
    })),
    ...materialRequestDocs.slice(0, 2).map((request) => ({
      id: `request-${request.requestNumber}`,
      title: `Material Request ${request.requestNumber}`,
      body: `${request.itemCode} requested for ${request.quantity} qty and is currently ${request.status.toLowerCase()}.`,
      tone: "blue",
      time: formatDate(request.createdAt),
      sortTime: new Date(request.createdAt || Date.now()).getTime(),
    })),
    ...dispatchReviewDocs.filter((review) => review.reviewStatus === "Issue").slice(0, 2).map((review) => ({
      id: `dispatch-${review.reviewNumber}`,
      title: `Dispatch issue on ${review.deliveryNoteNumber}`,
      body: `${review.issueType || "Issue"} reported for Delivery Note ${review.deliveryNoteNumber}.`,
      tone: "amber",
      time: formatDate(review.createdAt),
      sortTime: new Date(review.createdAt || Date.now()).getTime(),
    })),
    ...paymentUpdateDocs.slice(0, 2).map((update) => ({
      id: `payment-${update.updateNumber}`,
      title: `Payment update ${update.updateNumber}`,
      body: `${update.invoiceNumber} updated via ${update.paymentMode}.`,
      tone: "green",
      time: formatDate(update.createdAt),
      sortTime: new Date(update.createdAt || Date.now()).getTime(),
    })),
    ...[...complaintDocs, ...materialRequestDocs, ...paymentUpdateDocs, ...dispatchReviewDocs]
      .filter((entry) => entry.erpSyncStatus === "Failed")
      .slice(0, 3)
      .map((entry) => ({
        id: `sync-${entry._id}`,
        title: "ERPNext sync pending attention",
        body: entry.erpSyncMessage || "Distributor submission saved locally but ERPNext sync failed.",
        tone: "amber",
        time: formatDate(entry.updatedAt || entry.createdAt),
        sortTime: new Date(entry.updatedAt || entry.createdAt || Date.now()).getTime(),
      })),
  ].sort((a, b) => b.sortTime - a.sortTime).map(({ sortTime, ...entry }) => entry);

  return {
    profile,
    categories,
    products,
    stockItems,
    orders,
    invoices,
    dispatches,
    creditNotes,
    financeSummary,
    ledgerEntries,
    dashboardStats: [
      { label: "Open Sales Orders", value: String(orderDocs.length), change: `${dispatches.length} dispatch records` },
      { label: "Outstanding", value: formatCurrency(totalOutstanding), change: `${invoiceDocs.length} invoice records` },
      { label: "Items", value: String(itemDocs.length), change: `${categories.length} item groups` },
      { label: "Credit Notes", value: String(creditNoteDocs.length), change: formatCurrency(totalCreditNotes) },
    ],
    notifications,
    offers,
    complaints,
    materialRequests,
    paymentUpdates,
    dispatchReviews,
    teamMembers,
    savedAddresses: [...billingAddress, ...shippingAddresses],
    source: {
      mode: "local",
      label: "Internal records",
    },
  };
}
