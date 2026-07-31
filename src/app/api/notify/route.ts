// /api/notify — the Contact form POSTs { name, email, message } here.
// Sends the enquiry to the team inbox via Resend. Until RESEND_API_KEY is set
// in the environment it degrades gracefully: it logs the payload (visible in
// `vercel logs`) and still returns ok, so the form keeps working pre-launch.

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { spamGuard, clientIp, EMAIL_RE, sanitize, linkCount } from "@/lib/antispam";

interface NotifyPayload {
  name?: string;
  email?: string;
  message?: string;
  company?: string; // honeypot — must stay empty
  ts?: number; // client render time (ms)
}

// Sender must be on a domain you've verified in Resend. Falls back to Resend's
// shared onboarding sender so it works before your domain is verified.
const FROM = process.env.CONTACT_FROM_EMAIL ?? "Cubixso.ai <onboarding@resend.dev>";
const TO = process.env.CONTACT_TO_EMAIL ?? "contact@cubixso.com";

// Silent success — return ok WITHOUT sending, so a bot gets no signal to adapt
// and no error ever surfaces. Every spam drop uses this.
const silentOk = () => NextResponse.json({ ok: true, queued: false });

export async function POST(req: Request) {
  try {
    const { name, email, message, company, ts } = (await req.json()) as NotifyPayload;

    const guard = spamGuard({ origin: req.headers.get("origin"), ip: clientIp(req), honeypot: company, ts });
    if (!guard.ok) {
      console.log(`[notify] dropped (spam:${guard.reason})`);
      return silentOk();
    }

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "valid email required" }, { status: 400 });
    }

    const safeName = sanitize(name ?? "", 120);
    const safeMessage = (message ?? "").slice(0, 4000);
    // obvious link-spam: no URLs belong in a name; a flood belongs in no enquiry
    if (linkCount(safeName) >= 1 || linkCount(safeMessage) >= 6) {
      console.log("[notify] dropped (spam:links)");
      return silentOk();
    }

    const key = process.env.RESEND_API_KEY;
    if (!key) {
      console.log("[notify] (no RESEND_API_KEY — logged only)", {
        name: safeName,
        email,
        at: new Date().toISOString(),
      });
      return silentOk();
    }

    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from: FROM,
      to: [TO],
      replyTo: email,
      subject: `New enquiry${safeName ? ` from ${safeName}` : ""} — Cubixso.ai`,
      text: `Name: ${safeName || "—"}\nEmail: ${email}\n\n${safeMessage.trim() || "(no message)"}`,
    });
    if (error) {
      console.error("[notify] resend error", error);
      return NextResponse.json({ error: "send failed" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[notify] error", err);
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}
