export const runtime = "nodejs";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getDistributorAdminSession } from "@/lib/distributorAdminAuth";
import DistributorOtpSettings from "@/models/DistributorOtpSettings";
import ErpNextConnection from "@/models/ErpNextConnection";
import { getOtpDeliveryConfig } from "@/lib/otpDelivery";

function unauthorized() {
  return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
}

async function getCompanyUser(req) {
  return getDistributorAdminSession(req);
}

function clean(value = "") {
  return String(value || "").trim();
}

function mask(value = "") {
  if (!value) return "";
  if (value.length <= 6) return "••••••";
  return `${value.slice(0, 4)}••••${value.slice(-2)}`;
}

export async function GET(req) {
  try {
    const user = await getCompanyUser(req);
    if (!user) return unauthorized();

    await dbConnect();

    const [otpSettings, erpConnection, otpConfig] = await Promise.all([
      DistributorOtpSettings.findOne({ companyId: user.companyId }).lean(),
      ErpNextConnection.findOne({ companyId: user.companyId, isActive: true }).sort({ isDefault: -1, updatedAt: -1 }).lean(),
      getOtpDeliveryConfig(user.companyId),
    ]);

    return NextResponse.json({
      success: true,
      erpNext: {
        id: erpConnection?._id ? String(erpConnection._id) : "",
        label: erpConnection?.label || "Primary ERPNext",
        baseUrl: erpConnection?.baseUrl || "",
        apiKeyPreview: erpConnection?.apiKey ? mask(erpConnection.apiKey) : "",
        hasApiSecret: Boolean(erpConnection?.apiSecret),
        isDefault: erpConnection?.isDefault !== false,
        isActive: erpConnection?.isActive !== false,
        lastTestStatus: erpConnection?.lastTestStatus || "",
        lastTestMessage: erpConnection?.lastTestMessage || "",
      },
      otp: {
        brandName: otpSettings?.brandName || otpConfig.brandName || "ERPExpress Distributor App",
        email: {
          host: otpSettings?.email?.host || otpConfig.email.smtpHost || "smtp.gmail.com",
          port: otpSettings?.email?.port || otpConfig.email.port || 465,
          secure: otpSettings?.email?.secure ?? otpConfig.email.secure ?? true,
          user: otpSettings?.email?.user || "",
          from: otpSettings?.email?.from || "",
          hasPass: Boolean(otpSettings?.email?.pass || otpConfig.email.hasPass),
          ready: otpConfig.email.ready,
          missing: otpConfig.email.missing,
        },
        mobile: {
          provider: otpSettings?.mobile?.provider || otpConfig.mobile.provider || "twilio",
          channel: otpSettings?.mobile?.channel || otpConfig.mobile.channel || "sms",
          accountSid: otpSettings?.mobile?.accountSid || "",
          apiKeySid: otpSettings?.mobile?.apiKeySid || "",
          phoneNumber: otpSettings?.mobile?.phoneNumber || "",
          messagingServiceSid: otpSettings?.mobile?.messagingServiceSid || "",
          whatsappFrom: otpSettings?.mobile?.whatsappFrom || "",
          hasAuthToken: Boolean(otpSettings?.mobile?.authToken || otpConfig.mobile.hasAuthToken),
          hasApiKeySecret: Boolean(otpSettings?.mobile?.apiKeySecret || otpConfig.mobile.hasApiKeySecret),
          ready: otpConfig.mobile.ready,
          missing: otpConfig.mobile.missing,
        },
      },
    });
  } catch (error) {
    console.error("Distributor setup GET error:", error);
    return NextResponse.json({ success: false, message: "Failed to load distributor setup" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getCompanyUser(req);
    if (!user) return unauthorized();

    const body = await req.json().catch(() => ({}));
    await dbConnect();

    const section = clean(body.section).toLowerCase();
    if (section === "erpnext") {
      const id = clean(body.id);
      const label = clean(body.label) || "Primary ERPNext";
      const baseUrl = clean(body.baseUrl);
      const apiKey = clean(body.apiKey);
      const apiSecret = clean(body.apiSecret);
      const isDefault = body.isDefault !== false;
      const isActive = body.isActive !== false;

      if (!baseUrl) {
        return NextResponse.json({ success: false, message: "ERPNext base URL is required" }, { status: 400 });
      }

      let connection = id
        ? await ErpNextConnection.findOne({ _id: id, companyId: user.companyId })
        : await ErpNextConnection.findOne({ companyId: user.companyId, isActive: true }).sort({ isDefault: -1, updatedAt: -1 });

      if (!connection) {
        if (!apiKey || !apiSecret) {
          return NextResponse.json({ success: false, message: "API key and API secret are required" }, { status: 400 });
        }

        connection = new ErpNextConnection({
          companyId: user.companyId,
          label,
          baseUrl,
          apiKey,
          apiSecret,
          isDefault,
          isActive,
        });
      } else {
        connection.label = label;
        connection.baseUrl = baseUrl;
        connection.isDefault = isDefault;
        connection.isActive = isActive;
        if (apiKey) connection.apiKey = apiKey;
        if (apiSecret) connection.apiSecret = apiSecret;
      }

      if (connection.isDefault) {
        await ErpNextConnection.updateMany(
          { companyId: user.companyId, _id: { $ne: connection._id } },
          { $set: { isDefault: false } }
        );
      }

      await connection.save();

      return NextResponse.json({ success: true, message: "ERPNext connection saved" });
    }

    if (section === "otp") {
      const update = {
        brandName: clean(body.brandName) || "ERPExpress Distributor App",
        email: {
          host: clean(body.email?.host) || "smtp.gmail.com",
          port: Number(body.email?.port) || 465,
          secure: body.email?.secure !== false,
          user: clean(body.email?.user),
          from: clean(body.email?.from),
        },
        mobile: {
          provider: clean(body.mobile?.provider) || "twilio",
          channel: clean(body.mobile?.channel).toLowerCase() === "whatsapp" ? "whatsapp" : "sms",
          accountSid: clean(body.mobile?.accountSid),
          apiKeySid: clean(body.mobile?.apiKeySid),
          phoneNumber: clean(body.mobile?.phoneNumber),
          messagingServiceSid: clean(body.mobile?.messagingServiceSid),
          whatsappFrom: clean(body.mobile?.whatsappFrom),
        },
      };

      const pass = clean(body.email?.pass);
      const authToken = clean(body.mobile?.authToken);
      const apiKeySecret = clean(body.mobile?.apiKeySecret);

      const settings = await DistributorOtpSettings.findOne({ companyId: user.companyId });
      const nextDoc = settings || new DistributorOtpSettings({ companyId: user.companyId });

      nextDoc.brandName = update.brandName;
      nextDoc.email = {
        ...nextDoc.email?.toObject?.(),
        ...update.email,
        pass: pass || nextDoc.email?.pass || "",
      };
      nextDoc.mobile = {
        ...nextDoc.mobile?.toObject?.(),
        ...update.mobile,
        authToken: authToken || nextDoc.mobile?.authToken || "",
        apiKeySecret: apiKeySecret || nextDoc.mobile?.apiKeySecret || "",
      };

      await nextDoc.save();

      return NextResponse.json({ success: true, message: "OTP delivery settings saved" });
    }

    return NextResponse.json({ success: false, message: "Invalid setup section" }, { status: 400 });
  } catch (error) {
    console.error("Distributor setup POST error:", error);
    return NextResponse.json({ success: false, message: "Failed to save distributor setup" }, { status: 500 });
  }
}
