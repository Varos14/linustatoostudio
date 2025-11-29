// app/api/pesapal/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/actions/verifyPayment";

function getBaseUrl(req: NextRequest): string {
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderTrackingId = searchParams.get("OrderTrackingId");
  const orderMerchantReference = searchParams.get("OrderMerchantReference");
  
  const baseUrl = getBaseUrl(req);

  // Validate required parameters
  if (!orderTrackingId || !orderMerchantReference) {
    console.error("Missing payment callback parameters");
    return NextResponse.redirect(`${baseUrl}/checkout/cancel?error=missing_params`);
  }

  try {
    // Verify the payment with PesaPal and update database
    const result = await verifyPayment(orderTrackingId, orderMerchantReference);

    if (!result.success) {
      console.error("Payment verification failed:", result.message);
      return NextResponse.redirect(
        `${baseUrl}/checkout/cancel?error=${encodeURIComponent(result.message || 'verification_failed')}`
      );
    }

    // Redirect to success page with payment details
    return NextResponse.redirect(
      `${baseUrl}/checkout/success?order=${orderTrackingId}&ref=${orderMerchantReference}`
    );
    
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.redirect(
      `${baseUrl}/checkout/cancel?error=processing_failed`
    );
  }
}