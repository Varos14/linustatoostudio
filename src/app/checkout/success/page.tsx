// app/checkout/success/page.tsx
"use client";

import Container from "@/components/Container";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { pesapalService } from "@/lib/pesapal";

interface PaymentDetails {
  amount: number;
  paymentMethod: string;
  transactionId: string;
  paymentDate: string;
  status: string;
  customerName?: string;
  customerEmail?: string;
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderTrackingId = searchParams.get("order");
  const merchantReference = searchParams.get("ref");
  
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyPayment() {
      if (!orderTrackingId) {
        setError("Missing payment information");
        setLoading(false);
        return;
      }

      try {
        // Fetch payment status from PesaPal
        const status = await pesapalService.getTransactionStatus(orderTrackingId);
        
        if (status.payment_status_description === 'Completed') {
          setPaymentDetails({
            amount: status.amount,
            paymentMethod: status.payment_method,
            transactionId: status.confirmation_code,
            paymentDate: status.created_date,
            status: status.payment_status_description,
            customerEmail: status.payment_account
          });
        } else {
          setError(`Payment status: ${status.payment_status_description}`);
        }
      } catch (err) {
        console.error("Error verifying payment:", err);
        setError("Failed to verify payment status");
      } finally {
        setLoading(false);
      }
    }

    verifyPayment();
  }, [orderTrackingId]);

  if (loading) {
    return (
      <div className="py-12">
        <Container>
          <div className="text-white">
            <h1 className="font-serif text-3xl">Verifying payment...</h1>
            <p className="text-white/80 mt-2">Please wait while we confirm your deposit.</p>
          </div>
        </Container>
      </div>
    );
  }

  if (error || !paymentDetails) {
    return (
      <div className="py-12">
        <Container>
          <div className="text-white">
            <h1 className="font-serif text-3xl">Payment verification issue</h1>
            <p className="text-white/80 mt-2">{error || "Unable to verify payment"}</p>
            <p className="text-white/60 mt-4 text-sm">
              If you completed the payment, don&apos;t worry! We&apos;ll receive the notification and contact you shortly.
            </p>
          </div>
        </Container>
      </div>
    );
  }

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

  return (
    <div className="py-12">
      <Container>
        <div className="max-w-2xl">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 text-green-400 mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-serif text-3xl text-white">Deposit received</h1>
            <p className="text-white/80 mt-2">
              Thank you! Your deposit was received successfully. We&apos;ll confirm your appointment details by email.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 p-6 bg-white/5 space-y-4">
            <h2 className="text-xl font-medium text-white mb-4">Payment Receipt</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-white/60">Amount Paid</span>
                <span className="text-white font-medium">{formattedAmount}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-white/60">Payment Method</span>
                <span className="text-white">{paymentDetails.paymentMethod}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-white/60">Transaction ID</span>
                <span className="text-white font-mono text-sm">{paymentDetails.transactionId}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-white/60">Date</span>
                <span className="text-white">{formattedDate}</span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-white/60">Status</span>
                <span className="text-green-400 font-medium">{paymentDetails.status}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-lg border border-white/10 p-6 bg-white/5">
            <h3 className="text-lg font-medium text-white mb-3">What's next?</h3>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>A confirmation email has been sent to {paymentDetails.customerEmail}</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>We&apos;ll contact you within 24-48 hours to confirm your appointment</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Your deposit will be applied to the final cost of your tattoo</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Keep this page or the email as your receipt</span>
              </li>
            </ul>
          </div>

          <div className="mt-6">
            <a 
              href="/" 
              className="inline-block rounded-md bg-white text-black px-4 py-2 text-sm hover:bg-white/90 transition-colors"
            >
              Back to home
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
}