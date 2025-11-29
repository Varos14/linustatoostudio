import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";

function formatCurrency(amount: number | null | undefined, currency: string | null | undefined) {
  if (amount == null || !currency) return `${amount ?? "N/A"} ${currency ?? ""}`;
  const value = amount / 100;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: currency.toUpperCase() }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency.toUpperCase()}`;
  }
}

export async function POST(req: NextRequest) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 400 });
  }
  const stripe = new Stripe(stripeSecret);

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const resendApiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.BOOKINGS_TO_EMAIL || process.env.NEXT_PUBLIC_STUDIO_EMAIL || "studio@example.com";

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    if (!webhookSecret) {
      console.warn("[stripe webhook] STRIPE_WEBHOOK_SECRET not set; skipping signature verification (dev only). DO NOT use this in production.");
      event = JSON.parse(body);
    } else {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    }
  } catch (err) {
    console.error("[stripe webhook] Invalid signature", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = (session.customer_details?.email || session.customer_email || "") as string;
        const amountTotal = session.amount_total ?? null;
        const currency = session.currency ? session.currency.toUpperCase() : null;

        const summary = {
          type: event.type,
          id: event.id,
          email,
          amount: amountTotal,
          currency,
          created: event.created,
          mode: session.mode,
          payment_status: session.payment_status,
          metadata: session.metadata,
        };
        console.log("[stripe webhook] Deposit received:", summary);

        // Persist deposit (idempotent by sessionId)
        try {
          const piRaw = session.payment_intent;
          let paymentIntentId: string | null = null;
          if (typeof piRaw === "string") {
            paymentIntentId = piRaw;
          } else if (piRaw && typeof piRaw === "object" && "id" in piRaw) {
            paymentIntentId = (piRaw as Stripe.PaymentIntent).id;
          }

          await prisma.deposit.upsert({
            where: { sessionId: session.id },
            create: {
              sessionId: session.id,
              email: email || null,
              amount: amountTotal ?? 0,
              currency: (currency || "USD").toUpperCase(),
              paymentStatus: String(session.payment_status || "paid"),
              mode: session.mode || null,
              paymentIntentId: paymentIntentId || null,
              metadata: (session.metadata ?? undefined) as unknown as Prisma.InputJsonValue,
              bookingId:
                session.metadata && typeof (session.metadata as Record<string, string>).bookingId === "string"
                  ? String((session.metadata as Record<string, string>).bookingId)
                  : undefined,
            },
            update: {
              email: email || null,
              amount: amountTotal ?? 0,
              currency: (currency || "USD").toUpperCase(),
              paymentStatus: String(session.payment_status || "paid"),
              mode: session.mode || null,
              paymentIntentId: paymentIntentId || null,
              metadata: (session.metadata ?? undefined) as unknown as Prisma.InputJsonValue,
              bookingId:
                session.metadata && typeof (session.metadata as Record<string, string>).bookingId === "string"
                  ? String((session.metadata as Record<string, string>).bookingId)
                  : undefined,
            },
          });
        } catch (dbErr) {
          console.error("[stripe webhook] Failed to persist deposit", dbErr);
        }

        if (resendApiKey) {
          const resend = new Resend(resendApiKey);
          const formatted = formatCurrency(amountTotal, currency);

          try {
            // Notify studio
            await resend.emails.send({
              from: "Linus Tattoo Studio <bookings@resend.dev>",
              to: [toEmail],
              subject: `Deposit received: ${formatted}`,
              html: `
                <div style="font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial;line-height:1.6;color:#111">
                  <h2>Deposit received</h2>
                  <p><strong>Amount:</strong> ${formatted}</p>
                  <p><strong>Customer email:</strong> ${email || "N/A"}</p>
                  <p><strong>Session ID:</strong> ${session.id}</p>
                  <p><strong>Payment status:</strong> ${session.payment_status}</p>
                </div>
              `,
            });

            // Confirm to customer
            if (email) {
              await resend.emails.send({
                from: "Linus Tattoo Studio <bookings@resend.dev>",
                to: [email],
                subject: `We received your deposit (${formatted})`,
                html: `
                  <div style="font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial;line-height:1.6;color:#111">
                    <p>Thanks! We received your deposit of ${formatted}. We’ll follow up by email to confirm details.</p>
                  </div>
                `,
              });
            }
          } catch (mailErr) {
            console.error("[stripe webhook] Failed to send email via Resend", mailErr);
          }
        } else {
          console.log("[stripe webhook] RESEND_API_KEY not set — skipping email notifications.");
        }

        break;
      }
      default: {
        // No-op for other event types; Stripe expects 2xx to stop retries.
        break;
      }
    }
  } catch (handlerErr) {
    console.error("[stripe webhook] Handler error", handlerErr);
    // Return 200 so Stripe doesn't endlessly retry for non-fatal issues
    return NextResponse.json({ ok: false, handled: false });
  }

  return NextResponse.json({ ok: true });
}

