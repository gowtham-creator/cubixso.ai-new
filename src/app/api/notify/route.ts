// /api/notify — the Contact form POSTs { name, email, message } here.
// Sends the enquiry to the team inbox via Resend. Until RESEND_API_KEY is set
// in the environment it degrades gracefully: it logs the payload (visible in
// `vercel logs`) and still returns ok, so the form keeps working pre-launch.

import { NextResponse } from "next/server";
import { Resend } from "resend";

interface NotifyPayload {
  name?: string;
  email?: string;
  message?: string;
}

// Sender must be on a domain you've verified in Resend. Falls back to Resend's
// shared onboarding sender so it works before your domain is verified.
const FROM = process.env.CONTACT_FROM_EMAIL ?? "Cubixso.ai <onboarding@resend.dev>";
const TO = process.env.CONTACT_TO_EMAIL ?? "contact@cubixso.com";

export async function POST(req: Request) {
  try {
    const { name, email, message } = (await req.json()) as NotifyPayload;
    if (!email) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    const key = process.env.RESEND_API_KEY;
    if (!key) {
      console.log("[notify] (no RESEND_API_KEY — logged only)", {
        name,
        email,
        message,
        at: new Date().toISOString(),
      });
      return NextResponse.json({ ok: true, queued: false });
    }

    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from: FROM,
      to: [TO],
      replyTo: email,
      subject: `New enquiry${name ? ` from ${name}` : ""} — Cubixso.ai`,
      text: `Name: ${name ?? "—"}\nEmail: ${email}\n\n${message?.trim() || "(no message)"}`,
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
