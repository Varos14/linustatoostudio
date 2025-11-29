import { prisma } from "@/lib/prisma";
import Link from "next/link";
import RefundButton from "@/components/admin/RefundButton";

export const dynamic = "force-dynamic";

function formatCurrency(amount: number, currency: string) {
  const value = amount / 100;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

export default async function BookingDetailPage({ params, searchParams }: { params: { id: string }, searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const token = process.env.ADMIN_ACCESS_TOKEN || "";
  const paramsSearch = await searchParams;
  const provided = (paramsSearch["key"] || "") as string;

  if (token && provided !== token) {
    return (
      <div className="p-6 text-sm text-white/90">
        <h1 className="font-serif text-2xl mb-3">Forbidden</h1>
        <p>Add ?key=YOUR_TOKEN to the URL. Configure ADMIN_ACCESS_TOKEN in your env.</p>
      </div>
    );
  }

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { deposits: { orderBy: { createdAt: "desc" } } },
  });

  if (!booking) {
    return (
      <div className="p-6 text-white/90">
        <h1 className="font-serif text-2xl mb-3">Booking not found</h1>
        <Link className="underline" href={`/admin/bookings${token ? `?key=${token}` : ""}`}>Back to bookings</Link>
      </div>
    );
  }

  const uploads: string[] = Array.isArray(booking.uploads as unknown)
    ? ((booking.uploads as unknown[]) || []).map((u) => String(u))
    : [];
  const totalCents = booking.deposits.reduce((sum, d) => sum + (d.amount || 0), 0);
  const currency = booking.deposits[0]?.currency || "USD";

  return (
    <div className="p-6 text-white space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl">Booking detail</h1>
        <Link className="underline" href={`/admin/bookings${token ? `?key=${token}` : ""}`}>Back to list</Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="text-white/70 text-xs">Created</div>
          <div>{new Date(booking.createdAt).toLocaleString()}</div>
          <div className="text-white/70 text-xs mt-4">Booking ID</div>
          <div className="break-all text-xs">{booking.id}</div>
        </div>
        <div className="space-y-2">
          <div className="text-white/70 text-xs">Contact</div>
          <div>{booking.name}</div>
          <div className="text-white/80 text-sm">{booking.email}</div>
          {booking.phone && <div className="text-white/70 text-sm">{booking.phone}</div>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="text-white/70 text-xs">Placement</div>
          <div>{booking.placement}</div>
          <div className="text-white/70 text-xs mt-4">Size</div>
          <div>{booking.size}</div>
          {booking.style && (
            <>
              <div className="text-white/70 text-xs mt-4">Style</div>
              <div>{booking.style}</div>
            </>
          )}
          {booking.preferredDates && (
            <>
              <div className="text-white/70 text-xs mt-4">Preferred dates</div>
              <div>{booking.preferredDates}</div>
            </>
          )}
          {booking.budget && (
            <>
              <div className="text-white/70 text-xs mt-4">Budget</div>
              <div>{booking.budget}</div>
            </>
          )}
          {booking.references && (
            <>
              <div className="text-white/70 text-xs mt-4">References</div>
              <div className="break-all text-xs whitespace-pre-wrap">{booking.references}</div>
            </>
          )}
        </div>
        <div className="space-y-2">
          <div className="text-white/70 text-xs">Idea</div>
          <div className="whitespace-pre-wrap text-white/90">{booking.details}</div>
        </div>
      </div>

      {uploads.length > 0 && (
        <div>
          <div className="text-white/70 text-xs mb-2">Uploads</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {uploads.slice(0, 12).map((u, idx) => (
              <a key={idx} href={u} target="_blank" rel="noreferrer" className="block">
                <img src={u} alt={`upload-${idx}`} className="rounded border border-white/10 object-cover w-full h-32" />
              </a>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-serif text-xl">Deposits</h2>
          <div className="text-white/70 text-sm">Total: {formatCurrency(totalCents, currency)}</div>
        </div>
        {booking.deposits.length === 0 ? (
          <div className="text-white/70 text-sm">No deposits yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-white/70">
                <tr>
                  <th className="text-left p-2 border-b border-white/10">When</th>
                  <th className="text-left p-2 border-b border-white/10">Amount</th>
                  <th className="text-left p-2 border-b border-white/10">Currency</th>
                  <th className="text-left p-2 border-b border-white/10">Status</th>
                  <th className="text-left p-2 border-b border-white/10">Session</th>
                  <th className="text-left p-2 border-b border-white/10">Actions</th>
                </tr>
              </thead>
              <tbody>
                {booking.deposits.map((d) => (
                  <tr key={d.id} className="odd:bg-white/5">
                    <td className="p-2 align-top">{new Date(d.createdAt).toLocaleString()}</td>
                    <td className="p-2 align-top">{formatCurrency(d.amount, d.currency)}</td>
                    <td className="p-2 align-top">{d.currency}</td>
                    <td className="p-2 align-top">{d.paymentStatus}</td>
                    <td className="p-2 align-top"><code className="text-xs break-all">{d.sessionId}</code></td>
                    <td className="p-2 align-top">
                      {process.env.ALLOW_REFUNDS === "true" && (d.paymentStatus || "").toLowerCase() === "paid" ? (
                        <RefundButton depositId={d.id} />
                      ) : (
                        <span className="text-white/50 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

