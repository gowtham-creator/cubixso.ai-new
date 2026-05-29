import type { Metadata } from "next";
import { Contact } from "@/components/sections/Contact";

export const metadata: Metadata = {
  title: "Contact — Cubixso.ai",
  description:
    "Start the conversation. Honest scoping, real timelines, pricing on the call. Replies within 24 hours.",
};

export default function ContactPage() {
  return (
    <main className="pt-24">
      <Contact />
    </main>
  );
}
