import Container from "@/components/Container";
import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="py-12">
      <Container>
        <h1 className="font-serif text-3xl text-white">Payment canceled</h1>
        <p className="text-white/80 mt-2 max-w-2xl">
          Your payment was canceled. You can try again or contact us if you need help.
        </p>
        <div className="mt-6">
          <Link href="/booking" className="rounded-md bg-white text-black px-4 py-2 text-sm hover:bg-white/90">Back to booking</Link>
        </div>
      </Container>
    </div>
  );
}

