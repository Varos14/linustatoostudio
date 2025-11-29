"use server";

import { pesapalService, PaymentRequest } from '@/lib/pesapal';
import { StudentTokenData } from '@/lib/jwt';

interface InitiatePaymentRequest {
  studentData: StudentTokenData;
  studentToken: string; // The raw JWT string
  paymentMethod: string; // Note: Pesapal v3 doesn't use this field directly in the initial request.
  amount: number;
}

export async function initiatePayment({ studentData, studentToken, amount }: InitiatePaymentRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_BASE_URL is not configured in environment variables.");
    }
    
    // The merchant reference is your unique identifier for this transaction.
    // It's crucial for reconciling payments later.
    const merchantReference = `NPS-${studentData.studentId}-${Date.now()}`;
    
    const email = studentData.parentEmail || studentData.studentEmail;
    if (!email || !studentData.parentPhone) {
      throw new Error('Parent email and phone number are required for payment.');
    }

    // Prepare the payment request payload according to Pesapal's V3 API specs.
    const paymentRequest: PaymentRequest = {
      id: merchantReference,
      currency: 'UGX',
      amount: amount,
      description: `Admission fee for ${studentData.firstName} ${studentData.lastName} (${studentData.classApplying})`,
      callback_url: `${baseUrl}/payment/callback?token=${studentToken}`,
      billing_address: {
        email_address: email,
        phone_number: studentData.parentPhone,
        country_code: 'UG',
        first_name: studentData.firstName,
        last_name: studentData.lastName,
      },
    };

    console.log('Submitting payment request to Pesapal Service:', JSON.stringify(paymentRequest, null, 2));

    // The updated service now handles getting the token and IPN ID automatically.
    const paymentResponse = await pesapalService.submitOrderRequest(paymentRequest);
    
    console.log("Received response from Pesapal Service:", paymentResponse);

    return {
      success: true,
      redirectUrl: paymentResponse.redirect_url,
      orderTrackingId: paymentResponse.order_tracking_id,
      merchantReference: paymentResponse.merchant_reference
    };
  } catch (error) {
    console.error('Payment initiation error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred during payment processing.'
    };
  }
}