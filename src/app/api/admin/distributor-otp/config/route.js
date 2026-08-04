export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getDistributorAdminSession } from "@/lib/distributorAdminAuth";
import { getOtpDeliveryConfig } from "@/lib/otpDelivery";

function unauthorized() {
  return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
}

export async function GET(req) {
  const user = getDistributorAdminSession(req);
  if (!user) return unauthorized();

  const config = await getOtpDeliveryConfig(user.companyId);

  return NextResponse.json({
    success: true,
    config: {
      ready: config.ready,
      channels: {
        email: {
          provider: config.email.provider,
          channel: config.email.channel,
          ready: config.email.ready,
          senderConfigured: Boolean(config.email.from),
          missing: config.email.missing,
        },
        mobile: {
          provider: config.mobile.provider,
          channel: config.mobile.channel,
          ready: config.mobile.ready,
          senderConfigured: Boolean(config.mobile.sender),
          messagingServiceConfigured: Boolean(config.mobile.messagingServiceSid),
          missing: config.mobile.missing,
        },
      },
    },
  });
}
