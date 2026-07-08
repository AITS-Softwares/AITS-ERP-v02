import DistributorSyncLog from "@/models/DistributorSyncLog";
import DistributorWorkflowEvent from "@/models/DistributorWorkflowEvent";

function cleanText(value) {
  return String(value || "").trim();
}

export async function createDistributorWorkflowEvent({
  companyId,
  distributorAccountId = null,
  distributorUserId = null,
  workflowType,
  workflowNumber,
  actorType = "system",
  actorLabel = "",
  title,
  description = "",
  meta = {},
}) {
  if (!companyId || !cleanText(workflowType) || !cleanText(workflowNumber) || !cleanText(title)) {
    return null;
  }

  return DistributorWorkflowEvent.create({
    companyId,
    distributorAccountId,
    distributorUserId,
    workflowType: cleanText(workflowType),
    workflowNumber: cleanText(workflowNumber),
    actorType,
    actorLabel: cleanText(actorLabel),
    title: cleanText(title),
    description: cleanText(description),
    meta,
  });
}

export async function createDistributorSyncLog({
  companyId,
  distributorAccountId = null,
  distributorUserId = null,
  workflowType = "",
  workflowNumber = "",
  provider = "ERPNext",
  action = "",
  status = "Pending",
  reference = "",
  message = "",
  meta = {},
}) {
  if (!companyId) return null;

  return DistributorSyncLog.create({
    companyId,
    distributorAccountId,
    distributorUserId,
    workflowType: cleanText(workflowType),
    workflowNumber: cleanText(workflowNumber),
    provider: cleanText(provider) || "ERPNext",
    action: cleanText(action),
    status: cleanText(status) || "Pending",
    reference: cleanText(reference),
    message: cleanText(message),
    meta,
  });
}
