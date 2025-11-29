// app/api/pesapal/ipn/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/actions/verifyPayment";

/**
 * IPN (Instant Payment Notification) endpoint
 * PesaPal calls this endpoint when a payment status changes
 * This provides server-to-server confirmation independent of the user's browser
 */
export async function POST(req: NextRequest) {
  try {
    const ipnData = await req.json();
    
    console.log("IPN received:", JSON.stringify(ipnData, null, 2));

    // Extract payment information from IPN
    const orderTrackingId = ipnData.OrderTrackingId;
    const orderMerchantReference = ipnData.OrderMerchantReference;
    const orderNotificationType = ipnData.OrderNotificationType;

    if (!orderTrackingId) {
      console.error("IPN missing OrderTrackingId");
      return NextResponse.json({ error: "Missing OrderTrackingId" }, { status: 400 });
    }

    // Only process completed/status-change notifications
    // Possible notification types: IPNCHANGE, COMPLETED, FAILED, etc.
    if (orderNotificationType === "IPNCHANGE") {
      console.log(`Processing IPN for order: ${orderTrackingId}`);
      
      // Verify and process the payment
      const result = await verifyPayment(orderTrackingId, orderMerchantReference);
      
      if (result.success) {
        console.log(`IPN processed successfully for order: ${orderTrackingId}`);
      } else {
        console.error(`IPN processing failed for order: ${orderTrackingId}`, result.message);
      }
    } else {
      console.log(`IPN received but not processing notification type: ${orderNotificationType}`);
    }

    // Always return 200 OK to PesaPal to acknowledge receipt
    return NextResponse.json({ 
      status: "OK",
      message: "IPN received and processed"
    });

  } catch (error) {
    console.error("IPN processing error:", error);
    
    // Still return 200 to acknowledge receipt, but log the error
    return NextResponse.json({ 
      status: "ERROR",
      message: error instanceof Error ? error.message : "IPN processing failed"
    });
  }
}

// Some payment gateways may also use GET for IPN verification
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderTrackingId = searchParams.get("OrderTrackingId");
  const orderMerchantReference = searchParams.get("OrderMerchantReference");

  if (!orderTrackingId) {
    return NextResponse.json({ error: "Missing OrderTrackingId" }, { status: 400 });
  }

  console.log("IPN GET request:", { orderTrackingId, orderMerchantReference });

  try {
    const result = await verifyPayment(orderTrackingId, orderMerchantReference || "");
    
    return NextResponse.json({
      status: result.success ? "OK" : "ERROR",
      message: result.success ? "Payment verified" : result.message
    });
  } catch (error) {
    console.error("IPN GET processing error:", error);
    return NextResponse.json({ 
      status: "ERROR",
      message: error instanceof Error ? error.message : "IPN processing failed"
    });
  }
}