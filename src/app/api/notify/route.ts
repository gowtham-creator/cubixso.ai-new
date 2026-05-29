// /api/notify — endpoint that the Contact form POSTs to.
// Currently a stub that logs the payload server-side. When you're ready,
// add RESEND_API_KEY in Vercel env vars and swap the body of `sendEmail`
// for a `resend.emails.send(...)` call.

import { NextResponse } from "next/server";

interface NotifyPayload {
  name?: string;
  email?: string;
  message?: string;
}

async function sendEmail(_payload: NotifyPayload) {
  // TODO: wire Resend
  //
  //   import { Resend } from "resend";
  //   const resend = new Resend(process.env.RESEND_API_KEY);
  //   await resend.emails.send({
  //     from: "Cubixso.ai <noreply@cubixso.ai>",
  //     to: ["contact@cubixso.com"],
  //     subject: `New enquiry from ${payload.name}`,
  //     text: `${payload.email}\n\n${payload.message}`,
  //   });
  //   await resend.contacts.create({ email: payload.email, audienceId: "..." });
  return { ok: true };
}

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as NotifyPayload;
    if (!payload.email) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }
    // Until Resend is wired this just logs to the server console — visible
    // in `vercel logs` for the project.
    console.log("[notify]", { ...payload, at: new Date().toISOString() });
    const result = await sendEmail(payload);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[notify] error", err);
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}
