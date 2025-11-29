"use client";

import Container from "@/components/Container";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { BOOKING } from "@/lib/config";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export default function BookingPage() {
  return (
    <div className="py-20 animate-fade-in">
      <Container>
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-4 animate-slide-up">Book Your Tattoo</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto animate-slide-up animation-delay-200">
            Send a consultation request—include your idea, placement, size, and any reference links or images.
            We&apos;ll reply by email with availability and pricing.
          </p>
        </div>
        <div className="animate-slide-up animation-delay-400">
          <BookingForm />
        </div>
      </Container>
    </div>
  );
}

async function uploadToCloudinary(files: File[]): Promise<string[]> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) return [];
  const uploads: string[] = [];
  for (const file of files) {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: data,
    });
    if (!res.ok) throw new Error("Upload failed");
    const json = await res.json();
    if (json.secure_url) uploads.push(String(json.secure_url));
  }
  return uploads;
}

function BookingForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const uploadsEnabled = useMemo(() => Boolean(CLOUD_NAME && UPLOAD_PRESET), []);
  const depositsEnabled = BOOKING.depositEnabled;
  const [emailForDeposit, setEmailForDeposit] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone?: string;
  }>({ name: "", email: "", phone: "" });

  type BookingFormPayload = {
    name: string;
    email: string;
    phone?: string;
    placement: string;
    size: string;
    style?: string;
    references?: string;
    preferredDates?: string;
    budget?: string;
    details: string;
    uploads?: string[];
  };

  function v(input: FormDataEntryValue | null): string | undefined {
    const s = input == null ? "" : String(input);
    return s.trim() ? s : undefined;
  }

  async function onSubmit(formData: FormData) {
    setStatus("submitting");
    setError(null);

    const payload: Partial<BookingFormPayload> = {
      name: v(formData.get("name")) || "",
      email: v(formData.get("email")) || "",
      phone: v(formData.get("phone")),
      placement: v(formData.get("placement")) || "",
      size: v(formData.get("size")) || "",
      style: v(formData.get("style")),
      references: v(formData.get("references")),
      preferredDates: v(formData.get("preferredDates")),
      budget: v(formData.get("budget")),
      details: v(formData.get("details")) || "",
    };

    // Store form data for deposit step
    setFormData({
      name: payload.name || "",
      email: payload.email || "",
      phone: payload.phone || "",
    });

    // Persist email for the deposit checkout step
    setEmailForDeposit(payload.email || null);

    try {
      // Upload images first (if enabled)
      const files = formData.getAll("images") as File[];
      const validFiles = files.filter((f) => f && typeof f === "object" && (f as File).size);
      if (uploadsEnabled && validFiles.length) {
        const urls = await uploadToCloudinary(validFiles as File[]);
        payload.uploads = urls;
      }

      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      if (data && data.bookingId) setBookingId(String(data.bookingId));
      setStatus("success");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await onSubmit(formData);
  }

  if (status === "success") {
    return (
      <div className="rounded-md border border-white/10 p-6 bg-white/5 text-white space-y-4">
        <div>Thanks! Your request was sent. We&apos;ll get back to you by email.</div>
        {depositsEnabled && (
          <DepositCTA 
            email={emailForDeposit ?? undefined} 
            amountCents={BOOKING.depositAmountCents} 
            currency={BOOKING.currency} 
            bookingId={bookingId ?? undefined}
            customerInfo={formData}
          />
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 max-w-2xl mx-auto" encType="multipart/form-data">
      <div className="grid gap-1">
        <label className="text-sm text-white/80" htmlFor="name">Name*</label>
        <input id="name" name="name" required className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 hover:bg-white/15" placeholder="Your full name" />
      </div>
      <div className="grid gap-1">
        <label className="text-sm text-white/80" htmlFor="email">Email*</label>
        <input id="email" name="email" type="email" required className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 hover:bg-white/15" placeholder="you@example.com" />
      </div>
      <div className="grid gap-1">
        <label className="text-sm text-white/80" htmlFor="phone">Phone</label>
        <input id="phone" name="phone" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 hover:bg-white/15" placeholder="Optional" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="grid gap-1">
          <label className="text-sm text-white/80" htmlFor="placement">Placement*</label>
          <input id="placement" name="placement" required className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 hover:bg-white/15" placeholder="e.g. forearm, shoulder" />
        </div>
        <div className="grid gap-1">
          <label className="text-sm text-white/80" htmlFor="size">Size (cm)*</label>
          <input id="size" name="size" required className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 hover:bg-white/15" placeholder="e.g. 10 x 6 cm" />
        </div>
      </div>
      <div className="grid gap-1">
        <label className="text-sm text-white/80" htmlFor="style">Style</label>
        <input id="style" name="style" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 hover:bg-white/15" placeholder="fine line, blackwork, script, etc." />
      </div>
      <div className="grid gap-1">
        <label className="text-sm text-white/80" htmlFor="references">Reference links</label>
        <input id="references" name="references" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 hover:bg-white/15" placeholder="Paste URLs to inspiration images" />
      </div>

      {uploadsEnabled && (
        <div className="grid gap-1">
          <label className="text-sm text-white/80" htmlFor="images">Upload reference images (max 3)</label>
          <input id="images" name="images" type="file" accept="image/*" multiple className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-gray-100 transition-all duration-300 hover:bg-white/15" />
          <p className="text-xs text-white/50">Images upload to Cloudinary using your unsigned preset.</p>
        </div>
      )}

      <div className="grid gap-1">
        <label className="text-sm text-white/80" htmlFor="preferredDates">Preferred date(s)</label>
        <input id="preferredDates" name="preferredDates" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 hover:bg-white/15" placeholder="e.g. weekends, next month" />
      </div>
      <div className="grid gap-1">
        <label className="text-sm text-white/80" htmlFor="budget">Budget</label>
        <input id="budget" name="budget" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 hover:bg-white/15" placeholder="Optional" />
      </div>
      <div className="grid gap-1">
        <label className="text-sm text-white/80" htmlFor="details">Your idea*</label>
        <textarea id="details" name="details" required rows={5} className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 hover:bg-white/15 resize-none" placeholder="Describe your concept, any text, elements, etc." />
      </div>

      {error && <div className="text-red-400 text-sm p-3 bg-red-400/10 rounded-lg border border-red-400/20">{error}</div>}

      <div className="text-center pt-4">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="group relative px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:transform-none"
        >
          {status === "submitting" ? "Sending..." : "Send request"}
          <span className="absolute inset-0 rounded-lg bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
        </button>
      </div>
    </form>
  );
}

function DepositCTA({ 
  email, 
  amountCents, 
  currency, 
  bookingId,
  customerInfo 
}: { 
  email?: string; 
  amountCents: number; 
  currency: string; 
  bookingId?: string;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
}) {
  const [go, setGo] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const label = useMemo(() => {
    const amount = (Number(amountCents) || 0) / 100;
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
    } catch {
      return `$${amount.toFixed(2)}`;
    }
  }, [amountCents, currency]);

  async function handleDeposit() {
    try {
      setGo(true);
      setErr(null);
      
      // Prepare customer data for PesaPal
      const [firstName, ...lastNameParts] = customerInfo.name.split(' ');
      const lastName = lastNameParts.join(' ') || 'Customer';
      
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amountCents, 
          currency, 
          email, 
          bookingId,
          // PesaPal requires additional customer information
          phoneNumber: customerInfo.phone,
          firstName: firstName,
          lastName: lastName
        }),
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || "Failed to create payment session");
      }
      
      if (!json.url) {
        throw new Error("No payment URL received");
      }
      
      // Redirect to PesaPal payment page
      window.location.href = json.url;
      
    } catch (error: any) {
      console.error("Deposit error:", error);
      setErr(error.message || "Could not start payment. Please try again.");
      setGo(false);
    }
  }

  return (
    <div className="border-t border-white/10 pt-4 mt-4">
      <div className="mb-3">
        <h3 className="font-medium text-white">Secure your booking</h3>
        <p className="text-white/70 text-sm mt-1">
          Pay a deposit to secure your preferred date. This amount will be applied to your final tattoo cost.
        </p>
      </div>
      <button 
        onClick={handleDeposit} 
        disabled={go}
        className="rounded-md bg-green-600 text-white px-4 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-60 transition-colors"
      >
        {go ? "Redirecting to PesaPal…" : `Pay ${label} deposit`}
      </button>
      {err && (
        <div className="text-red-400 text-sm mt-2 p-2 bg-red-400/10 rounded border border-red-400/20">
          {err}
        </div>
      )}
      <p className="text-white/50 text-xs mt-2">
        You'll be redirected to PesaPal for secure payment processing
      </p>
    </div>
  );
}