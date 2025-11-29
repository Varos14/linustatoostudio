import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  // Basic Auth protection is enforced by middleware.ts for /admin/* routes
  if (process.env.ALLOW_REFUNDS !== "true") {
    return NextResponse.json({ ok: false, error: "Refunds disabled. Set ALLOW_REFUNDS=true in env." }, { status: 400 });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return NextResponse.json({ ok: false, error: "Missing STRIPE_SECRET_KEY" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const depositId = String(body.depositId || "").trim();
  const amountCents = body.amountCents != null ? Number(body.amountCents) : undefined;
  if (!depositId) return NextResponse.json({ ok: false, error: "Missing depositId" }, { status: 400 });

  const deposit = await prisma.deposit.findUnique({ where: { id: depositId } });
  if (!deposit) return NextResponse.json({ ok: false, error: "Deposit not found" }, { status: 404 });
  if (!deposit.paymentIntentId) return NextResponse.json({ ok: false, error: "No paymentIntentId for this deposit" }, { status: 400 });

  try {
    const stripe = new Stripe(secret);
    const refund = await stripe.refunds.create({
      payment_intent: deposit.paymentIntentId,
      amount: amountCents, // if undefined, full refund
    });

    // Mark deposit as refunded
    await prisma.deposit.update({ where: { id: deposit.id }, data: { paymentStatus: "refunded" } });

    return NextResponse.json({ ok: true, refundId: refund.id });
  } catch (e: unknown) {
    console.error("[admin refund]", e);
    return NextResponse.json({ ok: false, error: "Stripe refund failed" }, { status: 500 });
  }
}

