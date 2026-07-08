export const runtime = "nodejs";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getDistributorSession, unauthorizedDistributorResponse } from "@/lib/distributorSession";
import { createDistributorWorkflowEvent } from "@/lib/distributorWorkflowTracking";
import DistributorComplaint from "@/models/DistributorComplaint";
import DistributorDispatchReview from "@/models/DistributorDispatchReview";
import DistributorMaterialRequest from "@/models/DistributorMaterialRequest";
import DistributorPaymentUpdate from "@/models/DistributorPaymentUpdate";

const workflowConfig = {
  complaint: {
    model: DistributorComplaint,
    numberField: "complaintNumber",
    label: "Complaint",
  },
  materialRequest: {
    model: DistributorMaterialRequest,
    numberField: "requestNumber",
    label: "Material Request",
  },
  paymentUpdate: {
    model: DistributorPaymentUpdate,
    numberField: "updateNumber",
    label: "Payment update",
  },
  dispatchReview: {
    model: DistributorDispatchReview,
    numberField: "reviewNumber",
    label: "Dispatch review",
  },
};

const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
const maxSize = 5 * 1024 * 1024;

function cleanText(value) {
  return String(value || "").trim();
}

export async function POST(req) {
  try {
    const session = await getDistributorSession(req);
    if (!session) return unauthorizedDistributorResponse();

    const formData = await req.formData();
    const type = cleanText(formData.get("type"));
    const number = cleanText(formData.get("number"));
    const file = formData.get("file");
    const config = workflowConfig[type];

    if (!config || !number) {
      return NextResponse.json({ success: false, message: "Valid workflow type and document number are required" }, { status: 400 });
    }

    if (!file || typeof file === "string") {
      return NextResponse.json({ success: false, message: "No file was provided" }, { status: 400 });
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, message: "Only JPG, PNG, and PDF files are allowed" }, { status: 422 });
    }

    if (file.size > maxSize) {
      return NextResponse.json({ success: false, message: "File must be under 5 MB" }, { status: 422 });
    }

    const record = await config.model.findOne({
      companyId: session.companyId,
      distributorAccountId: session.account._id,
      [config.numberField]: number,
    });

    if (!record) {
      return NextResponse.json({ success: false, message: `${config.label} not found` }, { status: 404 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extension = path.extname(file.name || "").toLowerCase() || (file.type === "application/pdf" ? ".pdf" : ".png");
    const safeName = `${Date.now()}${extension}`;
    const relativeDir = path.join("uploads", "distributor", type, number);
    const absoluteDir = path.join(process.cwd(), "public", relativeDir);
    const absolutePath = path.join(absoluteDir, safeName);
    const fileUrl = `/${relativeDir.replace(/\\/g, "/")}/${safeName}`;

    await mkdir(absoluteDir, { recursive: true });
    await writeFile(absolutePath, buffer);

    const attachment = {
      fileName: file.name || safeName,
      fileUrl,
      fileType: file.type || "",
      uploadedAt: new Date(),
    };

    record.attachments = [...(record.attachments || []), attachment];
    await record.save();

    await createDistributorWorkflowEvent({
      companyId: session.companyId,
      distributorAccountId: session.account._id,
      distributorUserId: session.user._id,
      workflowType: type,
      workflowNumber: number,
      actorType: "distributor",
      actorLabel: session.user.fullName || session.user.mobileNumber || "Distributor user",
      title: "Attachment uploaded",
      description: `${attachment.fileName} attached to ${config.label.toLowerCase()} ${number}.`,
    });

    return NextResponse.json({
      success: true,
      message: "Attachment uploaded successfully",
      attachment: {
        fileName: attachment.fileName,
        fileUrl: attachment.fileUrl,
        fileType: attachment.fileType,
      },
    });
  } catch (error) {
    console.error("Distributor workflow attachment upload error:", error);
    return NextResponse.json({ success: false, message: "Failed to upload attachment" }, { status: 500 });
  }
}
