// lib/actions/verifyPayment.ts
"use server";

import { pesapalService, PaymentStatus } from '@/lib/pesapal';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const studioEmail = process.env.NEXT_PUBLIC_STUDIO_EMAIL || "studio@example.com";

interface PaymentDetails {
  bookingId?: string;
  customerName?: string;
  customerEmail: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  paymentDate: string;
  status: string;
  orderTrackingId: string;
  merchantReference: string;
}

export async function verifyPayment(
  orderTrackingId: string,
  merchantReference: string
) {
  try {
    if (!orderTrackingId || !merchantReference) {
      throw new Error("Missing required payment verification data");
    }

    // 1. Get the authoritative transaction status from PesaPal
    const paymentStatus: PaymentStatus = await pesapalService.getTransactionStatus(orderTrackingId);

    // 2. Check if the payment was successful
    if (paymentStatus.payment_status_description !== 'Completed') {
      throw new Error(`Payment not completed. Status: ${paymentStatus.payment_status_description}`);
    }

    // 3. Find or create deposit record in database
    let deposit = await prisma.deposit.findFirst({
      where: {
        OR: [
          { sessionId: orderTrackingId },
          { paymentIntentId: merchantReference }
        ]
      },
      include: {
        booking: true
      }
    });

    // Extract booking ID from merchant reference if available
    // Format: order_timestamp_randomstring or could include booking ID
    const bookingId = deposit?.bookingId || null;

    // Get customer details from booking if available
    let customerName = "Customer";
    let customerEmail = paymentStatus.payment_account || "";
    let booking = null;

    if (bookingId) {
      booking = await prisma.booking.findUnique({
        where: { id: bookingId }
      });
      if (booking) {
        customerName = booking.name;
        customerEmail = booking.email;
      }
    }

    // 4. Update or create the deposit record
    if (deposit) {
      // Update existing deposit
      deposit = await prisma.deposit.update({
        where: { id: deposit.id },
        data: {
          paymentStatus: 'Completed',
          paymentIntentId: paymentStatus.confirmation_code,
          metadata: {
            orderTrackingId: orderTrackingId,
            merchantReference: merchantReference,
            paymentMethod: paymentStatus.payment_method,
            paymentAccount: paymentStatus.payment_account,
            completedAt: paymentStatus.created_date
          }
        }
      });
    } else {
      // Create new deposit record
      deposit = await prisma.deposit.create({
        data: {
          sessionId: orderTrackingId,
          email: customerEmail,
          amount: Math.round(paymentStatus.amount * 100), // Convert to cents
          currency: 'UGX',
          paymentStatus: 'Completed',
          mode: process.env.PESAPAL_ENVIRONMENT || 'sandbox',
          paymentIntentId: paymentStatus.confirmation_code,
          bookingId: bookingId,
          metadata: {
            orderTrackingId: orderTrackingId,
            merchantReference: merchantReference,
            paymentMethod: paymentStatus.payment_method,
            paymentAccount: paymentStatus.payment_account,
            completedAt: paymentStatus.created_date
          }
        }
      });
    }

    // 5. Prepare payment details
    const paymentDetails: PaymentDetails = {
      bookingId: bookingId || undefined,
      customerName: customerName,
      customerEmail: customerEmail,
      amount: paymentStatus.amount,
      paymentMethod: paymentStatus.payment_method,
      transactionId: paymentStatus.confirmation_code,
      paymentDate: paymentStatus.created_date,
      status: 'Completed',
      orderTrackingId: orderTrackingId,
      merchantReference: merchantReference
    };

    // 6. Send confirmation emails
    await sendConfirmationEmails(paymentDetails, booking);

    // 7. Return success with payment details
    return {
      success: true,
      paymentDetails
    };

  } catch (error) {
    console.error('Error verifying payment:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Payment verification failed'
    };
  }
}

async function sendConfirmationEmails(
  paymentDetails: PaymentDetails,
  booking: any
) {
  if (!resendApiKey) {
    console.log('[Payment confirmation email] No RESEND_API_KEY set; skipping emails');
    return;
  }

  const resend = new Resend(resendApiKey);

  // Send customer confirmation email
  try {
    const customerEmailHTML = generateCustomerConfirmationEmail(paymentDetails, booking);
    await resend.emails.send({
      from: "Linus Tattoo Studio <bookings@resend.dev>",
      to: [paymentDetails.customerEmail],
      subject: `Deposit Received - Booking Confirmed | Linus Tattoo Studio`,
      html: customerEmailHTML,
    });
    console.log('Customer confirmation email sent to:', paymentDetails.customerEmail);
  } catch (error) {
    console.error('Error sending customer confirmation email:', error);
  }

  // Send studio notification email
  try {
    const studioEmailHTML = generateStudioNotificationEmail(paymentDetails, booking);
    await resend.emails.send({
      from: "Linus Tattoo Studio <bookings@resend.dev>",
      to: [studioEmail],
      subject: `Deposit Received - ${paymentDetails.customerName}`,
      html: studioEmailHTML,
    });
    console.log('Studio notification email sent');
  } catch (error) {
    console.error('Error sending studio notification email:', error);
  }
}

function generateCustomerConfirmationEmail(
  paymentDetails: PaymentDetails,
  booking: any
): string {
  const formattedAmount = new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX'
  }).format(paymentDetails.amount);

  const formattedDate = new Date(paymentDetails.paymentDate).toLocaleDateString('en-UG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Deposit Received - Linus Tattoo Studio</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #111; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; max-width: 600px; margin: 0 auto; }
        .section { margin-bottom: 25px; }
        .section h3 { color: #111; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .field { margin-bottom: 8px; }
        .field strong { color: #374151; }
        .highlight-box { background-color: #f0fdf4; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; }
        .footer { background-color: #f9fafb; padding: 15px; text-align: center; margin-top: 30px; border-radius: 8px; }
        .receipt-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>✅ Deposit Received!</h2>
        <p style="font-size: 15px; margin-top: 8px;">Linus Tattoo Studio</p>
      </div>
      
      <div class="content">
        <div class="highlight-box">
          <h2>Thank you, ${paymentDetails.customerName}!</h2>
          <p>Your deposit payment has been successfully processed. Your booking is now confirmed!</p>
        </div>
        
        <div class="receipt-box">
          <h3>Payment Receipt</h3>
          <div class="field"><strong>Customer Name:</strong> ${paymentDetails.customerName}</div>
          ${paymentDetails.bookingId ? `<div class="field"><strong>Booking ID:</strong> ${paymentDetails.bookingId}</div>` : ''}
          <div class="field"><strong>Amount Paid:</strong> ${formattedAmount}</div>
          <div class="field"><strong>Payment Method:</strong> ${paymentDetails.paymentMethod}</div>
          <div class="field"><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</div>
          <div class="field"><strong>Payment Date:</strong> ${formattedDate}</div>
          <div class="field"><strong>Status:</strong> ${paymentDetails.status}</div>
        </div>
        
        ${booking ? `
        <div class="section">
          <h3>Booking Details</h3>
          <div class="field"><strong>Placement:</strong> ${booking.placement}</div>
          <div class="field"><strong>Size:</strong> ${booking.size}</div>
          ${booking.style ? `<div class="field"><strong>Style:</strong> ${booking.style}</div>` : ''}
          ${booking.preferredDates ? `<div class="field"><strong>Preferred Dates:</strong> ${booking.preferredDates}</div>` : ''}
        </div>
        ` : ''}
        
        <div class="section">
          <h3>What's Next?</h3>
          <ul>
            <li>Keep this email as your payment receipt</li>
            <li>We'll contact you within 24-48 hours to confirm your appointment</li>
            <li>Your deposit will be applied to the final cost of your tattoo</li>
            <li>If you have any questions, reply to this email</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing Linus Tattoo Studio!</p>
          <p><strong>We look forward to creating your tattoo</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateStudioNotificationEmail(
  paymentDetails: PaymentDetails,
  booking: any
): string {
  const formattedAmount = new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX'
  }).format(paymentDetails.amount);

  const formattedDate = new Date(paymentDetails.paymentDate).toLocaleDateString('en-UG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Deposit Received - ${paymentDetails.customerName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; max-width: 600px; margin: 0 auto; }
        .section { margin-bottom: 25px; }
        .section h3 { color: #059669; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .field { margin-bottom: 8px; }
        .field strong { color: #374151; }
        .highlight-box { background-color: #ecfdf5; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>💰 Deposit Received</h1>
        <p>Linus Tattoo Studio - Admin Notification</p>
      </div>
      
      <div class="content">
        <div class="highlight-box">
          <h2>New Deposit Payment</h2>
          <p>A customer has successfully completed their deposit payment.</p>
        </div>
        
        <div class="section">
          <h3>Payment Details</h3>
          <div class="field"><strong>Customer Name:</strong> ${paymentDetails.customerName}</div>
          <div class="field"><strong>Customer Email:</strong> ${paymentDetails.customerEmail}</div>
          ${paymentDetails.bookingId ? `<div class="field"><strong>Booking ID:</strong> ${paymentDetails.bookingId}</div>` : ''}
          <div class="field"><strong>Amount Paid:</strong> ${formattedAmount}</div>
          <div class="field"><strong>Payment Method:</strong> ${paymentDetails.paymentMethod}</div>
          <div class="field"><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</div>
          <div class="field"><strong>Payment Date:</strong> ${formattedDate}</div>
        </div>
        
        ${booking ? `
        <div class="section">
          <h3>Booking Information</h3>
          <div class="field"><strong>Placement:</strong> ${booking.placement}</div>
          <div class="field"><strong>Size:</strong> ${booking.size}</div>
          ${booking.style ? `<div class="field"><strong>Style:</strong> ${booking.style}</div>` : ''}
          ${booking.preferredDates ? `<div class="field"><strong>Preferred Dates:</strong> ${booking.preferredDates}</div>` : ''}
          ${booking.budget ? `<div class="field"><strong>Budget:</strong> ${booking.budget}</div>` : ''}
          ${booking.phone ? `<div class="field"><strong>Phone:</strong> ${booking.phone}</div>` : ''}
          <div class="field"><strong>Details:</strong></div>
          <p style="margin-left: 20px; white-space: pre-wrap;">${booking.details}</p>
          ${booking.references ? `<div class="field"><strong>References:</strong> ${booking.references}</div>` : ''}
        </div>
        ` : ''}
        
        <div class="section">
          <h3>Next Steps</h3>
          <ul>
            <li>Contact customer to confirm appointment details</li>
            <li>Update booking calendar</li>
            <li>Prepare design concepts if needed</li>
            <li>Send appointment confirmation with studio address and instructions</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `;
}