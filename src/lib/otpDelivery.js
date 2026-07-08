import { sendMail } from "@/lib/mailer";
import dbConnect from "@/lib/db";
import DistributorOtpSettings from "@/models/DistributorOtpSettings";

function normalizeText(value) {
  return String(value || "").trim();
}

function getTwilioChannel(settings) {
  const channel = normalizeText(settings?.mobile?.channel || process.env.OTP_DELIVERY_CHANNEL || process.env.TWILIO_OTP_CHANNEL || "sms").toLowerCase();
  return channel === "whatsapp" ? "whatsapp" : "sms";
}

function getMobileOtpDeliveryConfig(settings = null) {
  const provider = normalizeText(settings?.mobile?.provider || process.env.OTP_DELIVERY_PROVIDER || "twilio").toLowerCase();
  const channel = getTwilioChannel(settings);
  const accountSid = normalizeText(settings?.mobile?.accountSid || process.env.TWILIO_ACCOUNT_SID);
  const authToken = normalizeText(settings?.mobile?.authToken || process.env.TWILIO_AUTH_TOKEN);
  const messagingServiceSid = normalizeText(settings?.mobile?.messagingServiceSid || process.env.TWILIO_MESSAGING_SERVICE_SID);
  const smsFrom = normalizeText(settings?.mobile?.phoneNumber || process.env.TWILIO_PHONE_NUMBER);
  const whatsappFrom = normalizeText(settings?.mobile?.whatsappFrom || process.env.TWILIO_WHATSAPP_FROM || smsFrom);

  const sender = messagingServiceSid
    ? messagingServiceSid
    : channel === "whatsapp"
      ? (whatsappFrom.startsWith("whatsapp:") ? whatsappFrom : `whatsapp:${whatsappFrom}`)
      : smsFrom;

  const missing = [];
  if (provider === "twilio") {
    if (!accountSid) missing.push("TWILIO_ACCOUNT_SID");
    if (!authToken) missing.push("TWILIO_AUTH_TOKEN");
    if (!sender) {
      missing.push(channel === "whatsapp" ? "TWILIO_WHATSAPP_FROM or TWILIO_PHONE_NUMBER" : "TWILIO_PHONE_NUMBER or TWILIO_MESSAGING_SERVICE_SID");
    }
  }

  return {
    provider,
    channel,
    accountSid,
    authToken,
    messagingServiceSid,
    sender,
    hasAuthToken: Boolean(authToken),
    hasApiKeySecret: Boolean(settings?.mobile?.apiKeySecret || process.env.TWILIO_API_KEY_SECRET),
    ready: provider === "twilio" ? missing.length === 0 : false,
    missing,
  };
}

function getEmailOtpDeliveryConfig(settings = null) {
  const smtpHost = normalizeText(settings?.email?.host || process.env.SMTP_HOST || "smtp.gmail.com");
  const smtpUser = normalizeText(settings?.email?.user || process.env.SMTP_USER);
  const smtpPass = normalizeText(settings?.email?.pass || process.env.SMTP_PASS);
  const from = normalizeText(settings?.email?.from || process.env.SMTP_FROM || smtpUser);
  const port = Number(settings?.email?.port || process.env.SMTP_PORT || (process.env.SMTP_SECURE === "false" ? 587 : 465));
  const secure = typeof settings?.email?.secure === "boolean"
    ? settings.email.secure
    : process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE === "true"
      : port === 465;
  const missing = [];

  if (!smtpHost) missing.push("SMTP_HOST");
  if (!smtpUser) missing.push("SMTP_USER");
  if (!smtpPass) missing.push("SMTP_PASS");
  if (!from) missing.push("SMTP_FROM or SMTP_USER");

  return {
    provider: "smtp",
    channel: "email",
    smtpHost,
    port,
    secure,
    smtpUser,
    from,
    hasPass: Boolean(smtpPass),
    ready: missing.length === 0,
    missing,
  };
}

async function resolveOtpSettings(companyId) {
  if (!companyId) return null;
  await dbConnect();
  return DistributorOtpSettings.findOne({ companyId }).lean();
}

export async function getOtpDeliveryConfig(companyId) {
  const settings = await resolveOtpSettings(companyId);
  const mobile = getMobileOtpDeliveryConfig(settings);
  const email = getEmailOtpDeliveryConfig(settings);

  return {
    brandName: normalizeText(settings?.brandName || process.env.OTP_BRAND_NAME || "ERPExpress Distributor App"),
    mobile,
    email,
    provider: mobile.provider,
    channel: mobile.channel,
    ready: mobile.ready || email.ready,
    missing: [...mobile.missing, ...email.missing],
  };
}

function buildOtpMessage(otp, brand) {
  return `${brand} OTP: ${otp}. Valid for 5 minutes.`;
}

function buildOtpEmailHtml(otp, brand) {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;">
      <h2 style="margin-bottom:12px;">${brand}</h2>
      <p>Your login OTP is:</p>
      <div style="display:inline-block;padding:12px 18px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;font-size:24px;font-weight:700;letter-spacing:4px;color:#105B92;">
        ${otp}
      </div>
      <p style="margin-top:16px;">This OTP is valid for 5 minutes.</p>
      <p style="font-size:12px;color:#6b7280;">If you did not request this OTP, you can ignore this email.</p>
    </div>
  `;
}

async function sendViaTwilio(config, mobileNumber, message) {
  const to = config.channel === "whatsapp" ? `whatsapp:+91${mobileNumber}` : `+91${mobileNumber}`;
  const body = new URLSearchParams();
  body.set("To", to);
  body.set("Body", message);

  if (config.messagingServiceSid) {
    body.set("MessagingServiceSid", config.messagingServiceSid);
  } else {
    body.set("From", config.sender);
  }

  const auth = Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64");
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.message || "Twilio OTP delivery failed");
  }

  return {
    provider: "twilio",
    channel: config.channel,
    sid: payload.sid || "",
    status: payload.status || "queued",
  };
}

async function sendViaEmail(emailAddress, otp, settings) {
  const brand = normalizeText(settings?.brandName || process.env.OTP_BRAND_NAME || "ERPExpress Distributor App");
  await sendMail({
    to: emailAddress,
    subject: `${brand} OTP`,
    html: buildOtpEmailHtml(otp, brand),
    from: settings?.email?.from || process.env.SMTP_FROM || settings?.email?.user || process.env.SMTP_USER,
    smtpConfig: {
      host: settings?.email?.host,
      port: settings?.email?.port,
      secure: settings?.email?.secure,
      user: settings?.email?.user,
      pass: settings?.email?.pass,
    },
  });

  return {
    provider: "smtp",
    channel: "email",
    status: "sent",
  };
}

export async function sendDistributorOtp({ companyId, method, mobileNumber = "", emailAddress = "", otp }) {
  const targetMethod = normalizeText(method).toLowerCase() === "email" ? "email" : "mobile";
  const settings = await resolveOtpSettings(companyId);

  if (targetMethod === "email") {
    const emailConfig = getEmailOtpDeliveryConfig(settings);
    if (!emailConfig.ready) {
      return {
        delivered: false,
        mode: "preview",
        reason: emailConfig.missing.join(", ") || "Email OTP provider is not configured",
        channel: "email",
      };
    }

    const result = await sendViaEmail(emailAddress, otp, settings);
    return {
      delivered: true,
      mode: "live",
      provider: result.provider,
      channel: result.channel,
      status: result.status,
    };
  }

  const mobileConfig = getMobileOtpDeliveryConfig(settings);
  if (!mobileConfig.ready) {
    return {
      delivered: false,
      mode: "preview",
      reason: mobileConfig.missing.join(", ") || "Mobile OTP provider is not configured",
      channel: mobileConfig.channel,
    };
  }

  const brand = normalizeText(settings?.brandName || process.env.OTP_BRAND_NAME || "ERPExpress Distributor App");
  const result = await sendViaTwilio(mobileConfig, mobileNumber, buildOtpMessage(otp, brand));
  return {
    delivered: true,
    mode: "live",
    provider: result.provider,
    channel: result.channel,
    sid: result.sid,
    status: result.status,
  };
}
