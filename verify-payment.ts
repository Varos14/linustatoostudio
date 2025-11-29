"use server";

import { pesapalService, PaymentStatus } from '@/lib/pesapal';
import { sendEmail } from '@/lib/email';
import { verifyStudentToken, StudentTokenData } from '@/lib/jwt';

/**
 * This action verifies a payment in a STATELESS manner.
 * It is triggered when the user returns to the `/payment/callback` URL.
 * It uses a JWT passed in the URL to get student context, as there is no database lookup.
 */
export async function verifyPayment(
    orderTrackingId: string, 
    merchantReference: string | null,
    studentToken: string | null // 💡 ADDED: The token from the URL search params
) {
  try {
    if (!orderTrackingId || !merchantReference || !studentToken) {
        throw new Error("Missing required payment verification data.");
    }

    // 1. Get the authoritative transaction status from Pesapal.
    const paymentStatus = await pesapalService.getTransactionStatus(orderTrackingId);
    
    // 2. Check if the payment was successful.
    if (paymentStatus.payment_status_description !== 'Completed') {
      // This will show an error on the callback page if payment failed or is pending.
      throw new Error(`Payment not completed. Status: ${paymentStatus.payment_status_description}`);
    }

    // 3. Verify the JWT to securely get the student's details.
    // This is the crucial step that replaces the database lookup.
    const studentData = await verifyStudentToken(studentToken);
    if (!studentData) {
        throw new Error("Invalid or expired student token. Cannot verify payment details.");
    }

    // 4. Prepare the payment details using REAL data from the token.
    const paymentDetails = {
      studentName: `${studentData.firstName} ${studentData.lastName}`,
      studentId: studentData.studentId,
      classApplying: studentData.classApplying,
      studentType: studentData.studentType,
      amount: paymentStatus.amount,
      paymentMethod: paymentStatus.payment_method,
      transactionId: paymentStatus.confirmation_code,
      paymentDate: paymentStatus.created_date,
      status: 'Completed'
    };

    // 5. Send the confirmation emails.
    // In a stateless model, this callback is the primary trigger for sending emails.
    await sendConfirmationEmails(paymentDetails, studentData.parentEmail, paymentStatus.payment_account, studentData.studentEmail);

    // 6. Return the details to the frontend to display the success page.
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

/**
 * A centralized function to handle sending all confirmation emails.
 */
/* async function sendConfirmationEmails(paymentDetails: any, parentEmail: string, paymentAccountEmail?: string, studentEmail?: string) {
  const successEmailHTML = generatePaymentSuccessEmailHTML(paymentDetails);
  
  // Determine the best email to send the receipt to.
  const recipientEmail = parentEmail || studentEmail;

  if (recipientEmail) {
    try {
      await sendEmail({
        to: recipientEmail,
        subject: `Payment Successful - ${paymentDetails.studentName} | Namungoona Parents' SS`,
        html: successEmailHTML,
      });
    } catch (error) {
      console.error('Error sending payment success email:', error);
      // Don't block the user flow if this fails.
    }
  }

  // Send the admin notification regardless.
  const adminNotificationHTML = generateAdminPaymentNotificationHTML(paymentDetails);
  try {
    await sendEmail({
      to: process.env.SCHOOL_EMAIL!,
      subject: `Payment Received - ${paymentDetails.studentName} | Admission Fee`,
      html: adminNotificationHTML,
    });
  } catch (error) {
    console.error('Error sending admin payment notification:', error);
  }
} */

  async function sendConfirmationEmails(paymentDetails: any, parentEmail: string, paymentAccountEmail?: string, studentEmail?: string) {
    const successEmailHTML = generatePaymentSuccessEmailHTML(paymentDetails);
    
    // Create a list of unique recipients.
    const recipients = new Set<string>();
    if (parentEmail) {
      recipients.add(parentEmail);
    }
    if (studentEmail) {
      recipients.add(studentEmail);
    }
    
    const recipientList = Array.from(recipients);
  
    // Send the confirmation email if there are any recipients.
    if (recipientList.length > 0) {
      try {
        await sendEmail({
          to: recipientList, // Send to both parent and student
          subject: `Payment Successful - ${paymentDetails.studentName} | Namungoona Parents' SS`,
          html: successEmailHTML,
        });
      } catch (error) {
        console.error('Error sending payment success email:', error);
        // Don't block the user flow if this fails.
      }
    }
  
    // Send the admin notification regardless.
    const adminNotificationHTML = generateAdminPaymentNotificationHTML(paymentDetails);
    try {
      await sendEmail({
        to: process.env.SCHOOL_EMAIL!,
        subject: `Payment Received - ${paymentDetails.studentName} | Admission Fee`,
        html: adminNotificationHTML,
      });
    } catch (error) {
      console.error('Error sending admin payment notification:', error);
    }
  }

function generatePaymentSuccessEmailHTML(paymentDetails: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Successful - ${paymentDetails.studentName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .section { margin-bottom: 25px; }
        .section h3 { color: #059669; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .field { margin-bottom: 8px; }
        .field strong { color: #374151; }
        .highlight-box { background-color: #ecfdf5; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; }
        .footer { background-color: #f9fafb; padding: 15px; text-align: center; margin-top: 30px; border-radius: 8px; }
        .receipt-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>🎉 Payment Successful!</h2>
        <p style="font-size: 15px; margin-top: 8px;">Namungoona Parents' Secondary School</p>
        <p style="font-size: 12px; margin-top: 8px;">Through God We Can</p>
      </div>
      
      <div class="content">
        <div class="highlight-box">
          <h2>Welcome to Namungoona Parents' Secondary School!</h2>
          <p>Your admission fee payment has been successfully processed. <strong>${paymentDetails.studentName}'s</strong> place in <strong>${paymentDetails.classApplying}</strong> is now secured!</p>
        </div>
        
        <div class="receipt-box">
          <h3>Payment Receipt</h3>
          <div class="field"><strong>Student Name:</strong> ${paymentDetails.studentName}</div>
          <div class="field"><strong>Application ID:</strong> ${paymentDetails.studentId}</div>
          <div class="field"><strong>Amount Paid:</strong> UGX ${paymentDetails.amount.toLocaleString()}</div>
          <div class="field"><strong>Payment Method:</strong> ${paymentDetails.paymentMethod}</div>
          <div class="field"><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</div>
          <div class="field"><strong>Payment Date:</strong> ${new Date(paymentDetails.paymentDate).toLocaleDateString('en-UG')}</div>
          <div class="field"><strong>Status:</strong> ${paymentDetails.status}</div>
        </div>
        
        <div class="section">
          <h3>What's Next?</h3>
          <ul>
            <li>Keep this email as your payment receipt</li>
            <li>School orientation details will be sent to you soon</li>
            <li>Contact the school for any additional requirements</li>
            <li>Prepare for an exciting academic journey!</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing Namungoona Parents' Secondary School!</p>
          <p><strong>"Through God We Can"</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateAdminPaymentNotificationHTML(paymentDetails: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Received - ${paymentDetails.studentName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .section { margin-bottom: 25px; }
        .section h3 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .field { margin-bottom: 8px; }
        .field strong { color: #374151; }
        .highlight-box { background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>💰 Payment Received</h1>
        <p>Namungoona Parents' Secondary School - Admin Notification</p>
      </div>
      
      <div class="content">
        <div class="highlight-box">
          <h2>New Payment Received</h2>
          <p>A student has successfully completed their admission fee payment.</p>
        </div>
        
        <div class="section">
          <h3>Payment Details</h3>
          <div class="field"><strong>Student Name:</strong> ${paymentDetails.studentName}</div>
          <div class="field"><strong>Application ID:</strong> ${paymentDetails.studentId}</div>
          <div class="field"><strong>Class:</strong> ${paymentDetails.classApplying}</div>
          <div class="field"><strong>Student Type:</strong> ${paymentDetails.studentType}</div>
          <div class="field"><strong>Amount Paid:</strong> UGX ${paymentDetails.amount.toLocaleString()}</div>
          <div class="field"><strong>Payment Method:</strong> ${paymentDetails.paymentMethod}</div>
          <div class="field"><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</div>
          <div class="field"><strong>Payment Date:</strong> ${new Date(paymentDetails.paymentDate).toLocaleDateString('en-UG')}</div>
        </div>
        
        <div class="section">
          <h3>Next Steps</h3>
          <ul>
            <li>Update student records with payment confirmation</li>
            <li>Send welcome package and orientation details</li>
            <li>Add student to class roster</li>
            <li>Prepare any additional documentation needed</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `;
}