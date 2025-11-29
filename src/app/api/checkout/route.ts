// app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { pesapalService } from '@/lib/pesapal';
import { prisma } from '@/lib/prisma';

function getBaseUrl(req: NextRequest) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json().catch(() => ({}));
    const { 
      amountCents, 
      currency = process.env.NEXT_PUBLIC_CURRENCY || "USD",
      email, 
      bookingId, 
      phoneNumber, 
      firstName, 
      lastName 
    } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const amount = Number(amountCents || process.env.NEXT_PUBLIC_DEPOSIT_AMOUNT_CENTS || 1000);
    
    if (amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    const baseUrl = getBaseUrl(req);

    // Create merchant reference with booking ID if available
    const merchantReference = bookingId 
      ? `booking_${bookingId}_${Date.now()}`
      : `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Build payment request
    const paymentRequest = {
      id: merchantReference,
      currency: String(currency).toUpperCase(),
      amount: amount / 100, // Convert cents to base currency
      description: bookingId 
        ? `Tattoo booking deposit - Booking #${bookingId}`
        : "Tattoo booking deposit",
      callback_url: `${baseUrl}/api/pesapal/callback`,
      billing_address: {
        email_address: email,
        phone_number: phoneNumber || "",
        country_code: "UG",
        first_name: firstName || "Customer",
        last_name: lastName || "User",
      }
    };

    console.log("Submitting payment request:", JSON.stringify(paymentRequest, null, 2));

    // Submit order to PesaPal using the centralized service
    const orderResponse = await pesapalService.submitOrderRequest(paymentRequest as any);

    console.log("PesaPal response:", orderResponse);

    // Create a pending deposit record in database
    try {
      await prisma.deposit.create({
        data: {
          sessionId: orderResponse.order_tracking_id,
          email: email,
          amount: amount,
          currency: currency,
          paymentStatus: 'Pending',
          mode: process.env.PESAPAL_ENVIRONMENT || 'sandbox',
          paymentIntentId: merchantReference,
          bookingId: bookingId || null,
          metadata: {
            orderTrackingId: orderResponse.order_tracking_id,
            merchantReference: orderResponse.merchant_reference,
            createdAt: new Date().toISOString()
          }
        }
      });
      console.log("Deposit record created for:", orderResponse.order_tracking_id);
    } catch (dbError) {
      console.error("Failed to create deposit record:", dbError);
      // Don't fail the checkout if database write fails
      // The callback/IPN will create/update it later
    }

    // Return the redirect URL for the payment page
    return NextResponse.json({ 
      url: orderResponse.redirect_url,
      order_tracking_id: orderResponse.order_tracking_id,
      merchant_reference: orderResponse.merchant_reference
    });

  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payment initiation failed" },
      { status: 500 }
    );
  }
}