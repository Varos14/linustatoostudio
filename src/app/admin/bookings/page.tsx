import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

function formatCurrency(amount: number, currency: string) {
  const value = amount / 100;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

export default async function BookingsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const token = process.env.ADMIN_ACCESS_TOKEN || "";
  const params = await searchParams;
  const provided = (params["key"] || "") as string;

  if (token && provided !== token) {
    return (
      <div className="p-6 text-sm text-white/90">
        <h1 className="font-serif text-2xl mb-3">Forbidden</h1>
        <p>Add ?key=YOUR_TOKEN to the URL. Configure ADMIN_ACCESS_TOKEN in your env.</p>
      </div>
    );
  }

  const q = (params["q"] || "") as string;

  const from = (params["from"] || "") as string;
  const to = (params["to"] || "") as string;

  const where: Prisma.BookingWhereInput = {};
  const fromDate = from ? new Date(from) : undefined;
  const toDate = to ? new Date(to) : undefined;
  if (fromDate || toDate) {
    const createdAtFilter: Prisma.DateTimeFilter = {};
    if (fromDate) createdAtFilter.gte = fromDate;
    if (toDate) createdAtFilter.lte = toDate;
    where.createdAt = createdAtFilter;
  }

  let list: Array<Prisma.BookingGetPayload<{ include: { deposits: true } }>> = [];

  if (q.trim()) {
    const needle = `%${q.toLowerCase()}%`;
    const idRows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM Booking
      WHERE (
        LOWER(name) LIKE ${needle}
        OR LOWER(email) LIKE ${needle}
        OR LOWER(placement) LIKE ${needle}
        OR LOWER(size) LIKE ${needle}
      )
      ${fromDate ? Prisma.sql`AND createdAt >= ${fromDate}` : Prisma.empty}
      ${toDate ? Prisma.sql`AND createdAt <= ${toDate}` : Prisma.empty}
      ORDER BY createdAt DESC
      LIMIT 200
    `;

    const ids = idRows.map((r) => r.id);
    list = await prisma.booking.findMany({
      where: { id: { in: ids }, ...(Object.keys(where).length ? where : {}) },
      include: { deposits: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  } else {
    list = await prisma.booking.findMany({
      where: Object.keys(where).length ? where : undefined,
      include: { deposits: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  return (
    <div className="p-6 text-white">
      <h1 className="font-serif text-2xl mb-4">Bookings</h1>
      {!token && (
        <div className="mb-4 text-yellow-300 text-sm">Warning: ADMIN_ACCESS_TOKEN not set. This page is not protected.</div>
      )}

      <form className="mb-4 flex flex-wrap gap-2 items-end" action="" method="GET">
        {token && <input type="hidden" name="key" defaultValue={token} />}
        <div className="flex flex-col">
          <label className="text-xs text-white/60" htmlFor="q">Search</label>
          <input
            id="q"
            name="q"
            defaultValue={(params["q"] as string) || ""}
            placeholder="Search name, email, placement, size"
            className="bg-transparent border border-white/20 rounded-md px-3 py-2 text-white placeholder:text-white/40 w-full max-w-md"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-white/60" htmlFor="from">From</label>
          <input id="from" name="from" type="date" defaultValue={(params["from"] as string) || ""} className="bg-transparent border border-white/20 rounded-md px-3 py-2 text-white w-40" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-white/60" htmlFor="to">To</label>
          <input id="to" name="to" type="date" defaultValue={(params["to"] as string) || ""} className="bg-transparent border border-white/20 rounded-md px-3 py-2 text-white w-40" />
        </div>
        <button className="rounded-md bg-white text-black px-4 py-2 text-sm hover:bg-white/90">Apply</button>
        <Link
          href={`/admin/bookings${token ? `?key=${token}` : ""}`}
          className="rounded-md border border-white/20 text-white px-3 py-2 text-sm hover:bg-white/10"
        >
          Reset
        </Link>
        <Link
          href={`/admin/bookings/export${token ? `?key=${token}` : ""}${(params["q"] as string) ? `&q=${encodeURIComponent(params["q"] as string)}` : ""}${(params["from"] as string) ? `&from=${params["from"]}` : ""}${(params["to"] as string) ? `&to=${params["to"]}` : ""}`}
          className="rounded-md border border-white/20 text-white px-3 py-2 text-sm hover:bg-white/10"
        >
          Export CSV
        </Link>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-white/70">
            <tr>
              <th className="text-left p-2 border-b border-white/10">When</th>
              <th className="text-left p-2 border-b border-white/10">Name</th>
              <th className="text-left p-2 border-b border-white/10">Contact</th>
              <th className="text-left p-2 border-b border-white/10">Placement · Size</th>
              <th className="text-left p-2 border-b border-white/10">Deposits</th>
              <th className="text-left p-2 border-b border-white/10">Idea</th>
              <th className="text-left p-2 border-b border-white/10">Refs/Uploads</th>
              <th className="text-left p-2 border-b border-white/10">ID</th>
            </tr>
          </thead>
          <tbody>
            {list.map((b) => {
              const totalCents = b.deposits.reduce((sum, d) => sum + (d.amount || 0), 0);
              const currency = b.deposits[0]?.currency || "USD";
              const paidCount = b.deposits.filter((d) => (d.paymentStatus || "").toLowerCase() === "paid").length;
              const statusBadge = paidCount > 0 ? (
                <span className="inline-block px-2 py-0.5 text-xs rounded bg-green-500/20 text-green-300">{paidCount} paid</span>
              ) : (
                <span className="inline-block px-2 py-0.5 text-xs rounded bg-white/10 text-white/70">none</span>
              );
              const uploadsJson = b.uploads as unknown;
              const uploadsCount = Array.isArray(uploadsJson) ? uploadsJson.length : 0;
              return (
                <tr key={b.id} className="odd:bg-white/5 align-top">
                  <td className="p-2">{new Date(b.createdAt).toLocaleString()}</td>
                  <td className="p-2">
                    <Link className="underline" href={`/admin/bookings/${b.id}${token ? `?key=${token}` : ""}`}>{b.name}</Link>
                  </td>
                  <td className="p-2">
                    <div>{b.email}</div>
                    {b.phone && <div className="text-white/70 text-xs">{b.phone}</div>}
                  </td>
                  <td className="p-2">
                    <div>{b.placement}</div>
                    <div className="text-white/70 text-xs">{b.size}</div>
                  </td>
                  <td className="p-2">
                    <div className="mb-1">{statusBadge}</div>
                    <div className="text-white/80">{b.deposits.length} deposit(s)</div>
                    <div className="text-white/70 text-xs">{formatCurrency(totalCents, currency)}</div>
                  </td>
                  <td className="p-2 max-w-[320px]">
                    <div className="line-clamp-3 whitespace-pre-wrap text-white/90">{b.details}</div>
                  </td>
                  <td className="p-2">
                    <div className="text-white/80">Refs: {b.references ? "yes" : "no"}</div>
                    <div className="text-white/80">Uploads: {uploadsCount}</div>
                  </td>
                  <td className="p-2">
                    <code className="text-xs">{b.id}</code>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

