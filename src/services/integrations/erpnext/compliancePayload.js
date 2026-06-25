import { getStateCodeFromGSTIN, getStateCodeFromName, getStateNameFromCode } from "@/utils/indiaStates";

function text(value) {
  return value == null ? "" : String(value).trim();
}

function numberValue(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toISODate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function normalizeAddress(address = {}) {
  return {
    address1: text(address.address1),
    address2: text(address.address2),
    city: text(address.city),
    state: text(address.state),
    pin: text(address.pin),
    country: text(address.country || "India"),
  };
}

function getCustomerAddress(invoice, customer, key) {
  const invoiceAddress = normalizeAddress(invoice?.[key]);
  if (invoiceAddress.address1 || invoiceAddress.city || invoiceAddress.state) {
    return invoiceAddress;
  }

  const listKey = key === "billingAddress" ? "billingAddresses" : "shippingAddresses";
  return normalizeAddress(customer?.[listKey]?.[0] || customer?.billingAddresses?.[0] || {});
}

function buildPartyAddress(address, fallbackName, stateCodeOverride) {
  const stateCode = stateCodeOverride || getStateCodeFromName(address.state);
  return {
    tradeName: text(fallbackName),
    legalName: text(fallbackName),
    address1: address.address1,
    address2: address.address2,
    location: address.city,
    pincode: address.pin,
    stateCode,
    state: address.state || getStateNameFromCode(stateCode),
    country: address.country || "India",
  };
}

function buildDispatchAddress(invoice, company, companyStateCode) {
  const dispatch = invoice?.compliance?.dispatchFrom || {};
  return {
    tradeName: text(dispatch.tradeName || company.tradeName || company.companyName),
    legalName: text(dispatch.legalName || company.legalName || company.companyName),
    address1: text(dispatch.address1 || company.address),
    address2: text(dispatch.address2),
    location: text(dispatch.location || company.state),
    pincode: text(dispatch.pincode || company.pinCode),
    stateCode: text(dispatch.stateCode || company.stateCode || companyStateCode),
  };
}

function buildShipToAddress(invoice, customer, shippingAddress, customerStateCode) {
  const shipTo = invoice?.compliance?.shipTo || {};
  return {
    tradeName: text(shipTo.tradeName || customer?.gstTradeName || customer?.customerName),
    legalName: text(shipTo.legalName || customer?.gstLegalName || customer?.customerName),
    address1: text(shipTo.address1 || shippingAddress.address1),
    address2: text(shipTo.address2 || shippingAddress.address2),
    location: text(shipTo.location || shippingAddress.city),
    pincode: text(shipTo.pincode || shippingAddress.pin),
    stateCode: text(shipTo.stateCode || customerStateCode || getStateCodeFromName(shippingAddress.state)),
  };
}

function buildItemPayload(item, itemDoc, index) {
  const taxableValue = numberValue(item.totalAmount);
  const gstAmount = numberValue(item.gstAmount || item.igstAmount || 0);
  return {
    slNo: index + 1,
    itemCode: text(item.itemCode || itemDoc?.itemCode),
    description: text(item.itemDescription || item.itemName || itemDoc?.itemName),
    hsnCode: text(itemDoc?.gstCode),
    quantity: numberValue(item.quantity),
    unit: text(itemDoc?.uom),
    rate: numberValue(item.unitPrice),
    discountAmount: numberValue(item.discount),
    assessableValue: taxableValue,
    gstRate: numberValue(item.gstRate),
    cgstAmount: numberValue(item.cgstAmount),
    sgstAmount: numberValue(item.sgstAmount),
    igstAmount: numberValue(item.igstAmount),
    totalItemValue: taxableValue + gstAmount,
  };
}

export function validateComplianceReadiness({ invoice, company, customer, items, docType }) {
  const missing = [];

  if (!company?.gstNumber) missing.push("Company GSTIN");
  if (!company?.address) missing.push("Company address");
  if (!customer?.gstNumber) missing.push("Customer GSTIN");
  if (!invoice?.invoiceNumber) missing.push("Invoice number");
  if (!invoice?.invoiceDate) missing.push("Invoice date");
  if (!Array.isArray(invoice?.items) || !invoice.items.length) missing.push("Invoice items");

  (invoice?.items || []).forEach((item, index) => {
    const itemDoc = items.get(String(item.item));
    if (!itemDoc?.gstCode) missing.push(`HSN/SAC for item row ${index + 1}`);
    if (!itemDoc?.uom) missing.push(`UOM for item row ${index + 1}`);
  });

  if (docType === "ewaybill") {
    if (!invoice?.compliance?.transportMode) missing.push("Transport mode");
    if (!invoice?.compliance?.transportDistanceKm) missing.push("Transport distance");
  }

  return missing;
}

export function buildCompliancePayload({ invoice, company, customer, items }) {
  const companyStateCode = text(company.stateCode || getStateCodeFromGSTIN(company.gstNumber));
  const customerStateCode = text(getStateCodeFromGSTIN(customer?.gstNumber));
  const billingAddress = getCustomerAddress(invoice, customer, "billingAddress");
  const shippingAddress = getCustomerAddress(invoice, customer, "shippingAddress");
  const placeOfSupply =
    text(invoice?.compliance?.placeOfSupply) ||
    customerStateCode ||
    getStateCodeFromName(shippingAddress.state || billingAddress.state);

  const itemPayload = (invoice.items || []).map((item, index) =>
    buildItemPayload(item, items.get(String(item.item)), index)
  );

  return {
    invoice: {
      id: String(invoice._id),
      invoiceNumber: text(invoice.invoiceNumber),
      refNumber: text(invoice.refNumber),
      invoiceDate: toISODate(invoice.invoiceDate),
      dueDate: toISODate(invoice.dueDate),
      documentDate: toISODate(invoice.documentDate || invoice.invoiceDate),
      totalBeforeDiscount: numberValue(invoice.totalBeforeDiscount),
      gstTotal: numberValue(invoice.gstTotal),
      freight: numberValue(invoice.freight),
      rounding: numberValue(invoice.rounding),
      grandTotal: numberValue(invoice.grandTotal),
      supplyType: text(invoice?.compliance?.supplyType || "B2B"),
      transactionType: text(invoice?.compliance?.transactionType || "Regular"),
      reverseCharge: Boolean(invoice?.compliance?.reverseCharge),
      placeOfSupply,
      exportType: text(invoice?.compliance?.exportType),
    },
    seller: {
      gstin: text(company.gstNumber),
      legalName: text(company.legalName || company.companyName),
      tradeName: text(company.tradeName || company.companyName),
      address1: text(company.address),
      address2: "",
      location: text(company.state || getStateNameFromCode(companyStateCode)),
      pincode: text(company.pinCode),
      stateCode: companyStateCode,
      phone: text(company.phone),
      email: text(company.email),
    },
    buyer: {
      gstin: text(customer?.gstNumber),
      legalName: text(customer?.gstLegalName || customer?.customerName),
      tradeName: text(customer?.gstTradeName || customer?.customerName),
      address1: billingAddress.address1,
      address2: billingAddress.address2,
      location: billingAddress.city,
      pincode: billingAddress.pin,
      stateCode: customerStateCode || getStateCodeFromName(billingAddress.state),
      phone: text(customer?.mobileNumber),
      email: text(customer?.emailId),
    },
    dispatch: buildDispatchAddress(invoice, company, companyStateCode),
    shipTo: buildShipToAddress(invoice, customer, shippingAddress, customerStateCode),
    transporter: {
      transporterName: text(invoice?.compliance?.transporterName),
      transporterId: text(invoice?.compliance?.transporterId),
      transportMode: text(invoice?.compliance?.transportMode),
      transportDistanceKm: numberValue(invoice?.compliance?.transportDistanceKm),
      vehicleNumber: text(invoice?.compliance?.vehicleNumber),
      vehicleType: text(invoice?.compliance?.vehicleType),
      transportDocumentNumber: text(invoice?.compliance?.transportDocumentNumber),
      transportDocumentDate: toISODate(invoice?.compliance?.transportDocumentDate),
    },
    items: itemPayload,
  };
}
