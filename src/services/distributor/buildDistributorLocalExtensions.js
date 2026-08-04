import Customer from "@/models/CustomerModel";
import DistributorComplaint from "@/models/DistributorComplaint";
import DistributorDispatchReview from "@/models/DistributorDispatchReview";
import DistributorMaterialRequest from "@/models/DistributorMaterialRequest";
import DistributorOffer from "@/models/DistributorOffer";
import DistributorPaymentUpdate from "@/models/DistributorPaymentUpdate";
import DistributorAppUser from "@/models/DistributorAppUser";
import DistributorWorkflowEvent from "@/models/DistributorWorkflowEvent";

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

export async function buildDistributorLocalExtensions({ companyId, account, user }) {
  const customerId = account.customerId || user.customerId || null;

  const [
    localCustomer,
    teamDocs,
    complaintDocs,
    offerDocs,
    materialRequestDocs,
    paymentUpdateDocs,
    dispatchReviewDocs,
    workflowEventDocs,
  ] = await Promise.all([
    customerId ? Customer.findById(customerId).lean() : null,
    DistributorAppUser.find({ distributorAccountId: account._id })
      .select("fullName mobileNumber role financeAccess loginEnabled isActive lastLoginAt")
      .lean(),
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
    DistributorWorkflowEvent.find({ companyId, distributorAccountId: account._id }).sort({ createdAt: -1 }).limit(120).lean(),
  ]);

  const workflowHistoryMap = buildWorkflowHistoryMap(workflowEventDocs);

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

  const teamMembers = teamDocs.map((member) => ({
    name: member.fullName,
    role: member.role,
    access: member.financeAccess ? "Commercial and finance access" : "Commercial access",
    lastActive: member.lastLoginAt ? formatDate(member.lastLoginAt) : "Not logged in",
  }));

  const billingAddress = localCustomer?.billingAddresses?.[0] ? [getAddressLabel(localCustomer.billingAddresses[0], "Billing")] : [];
  const shippingAddresses = (localCustomer?.shippingAddresses || []).map((address, index) =>
    getAddressLabel(address, index === 0 ? "Primary Shipping" : `Shipping ${index + 1}`)
  );

  return {
    workflowHistoryMap,
    profile: {
      name: account.displayName || "",
      code: account.distributorCode || "",
      city: localCustomer?.shippingAddresses?.[0]?.city || localCustomer?.billingAddresses?.[0]?.city || "",
      phone: user.mobileNumber || user.emailAddress || "",
      route: account.territory || "",
      userRole: user.role,
      creditLimit: "ERPNext live",
      availableCredit: "ERPNext live",
      preferredWarehouse: account.preferredWarehouse || "",
    },
    teamMembers,
    savedAddresses: [...billingAddress, ...shippingAddresses],
    notifications: [],
    offers,
    complaints,
    materialRequests,
    paymentUpdates,
    dispatchReviews,
  };
}
