// /api/subscribe — the newsletter form POSTs { email } here.
// Adds the address to a Resend Audience. Until RESEND_API_KEY +
// RESEND_AUDIENCE_ID are set it degrades gracefully (logs + returns ok), so the
// signup UI keeps working pre-launch. A re-subscribe of an existing contact is
// treated as success, not an error.

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { spamGuard, clientIp, EMAIL_RE } from "@/lib/antispam";

const silentOk = () => NextResponse.json({ ok: true, queued: false });

export async function POST(req: Request) {
  try {
    const { email, company, ts } = (await req.json()) as {
      email?: string;
      company?: string; // honeypot
      ts?: number;
    };

    const guard = spamGuard({ origin: req.headers.get("origin"), ip: clientIp(req), honeypot: company, ts });
    if (!guard.ok) {
      console.log(`[subscribe] dropped (spam:${guard.reason})`);
      return silentOk();
    }
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "valid email required" }, { status: 400 });
    }

    const key = process.env.RESEND_API_KEY;
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (!key || !audienceId) {
      console.log("[subscribe] (not configured — logged only)", {
        email,
        at: new Date().toISOString(),
      });
      return NextResponse.json({ ok: true, queued: false });
    }

    const resend = new Resend(key);
    const { error } = await resend.contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    });
    if (error && !/already exists/i.test(error.message ?? "")) {
      console.error("[subscribe] resend error", error);
      return NextResponse.json({ error: "subscribe failed" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[subscribe] error", err);
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}
