import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { Prisma } from "@prisma/client";

function formatCurrency(amount: number, currency: string) {
  const value = amount / 100;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

export default async function DepositsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
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

  const where: Prisma.DepositWhereInput = {};
  const fromDate = from ? new Date(from as string) : undefined;
  const toDate = to ? new Date(to as string) : undefined;
  if (fromDate || toDate) {
    const createdAtFilter: Prisma.DateTimeFilter = {};
    if (fromDate) createdAtFilter.gte = fromDate;
    if (toDate) createdAtFilter.lte = toDate;
    where.createdAt = createdAtFilter;
  }

  let list: Array<Prisma.DepositGetPayload<{ include: { booking: true } }>> = [];

  if (q.trim()) {
    const needle = `%${q.toLowerCase()}%`;
    const idRows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM Deposit
      WHERE (
        LOWER(email) LIKE ${needle}
        OR LOWER(sessionId) LIKE ${needle}
      )
      ${fromDate ? Prisma.sql`AND createdAt >= ${fromDate}` : Prisma.empty}
      ${toDate ? Prisma.sql`AND createdAt <= ${toDate}` : Prisma.empty}
      ORDER BY createdAt DESC
      LIMIT 400
    `;
    const ids = idRows.map((r) => r.id);
    list = await prisma.deposit.findMany({ include: { booking: true }, where: { id: { in: ids }, ...(Object.keys(where).length ? where : {}) }, orderBy: { createdAt: "desc" }, take: 400 });
  } else {
    list = await prisma.deposit.findMany({ include: { booking: true }, where: Object.keys(where).length ? where : undefined, orderBy: { createdAt: "desc" }, take: 200 });
  }

  return (
    <div className="p-6 text-white">
      <h1 className="font-serif text-2xl mb-4">Deposits</h1>
      {!token && (
        <div className="mb-4 text-yellow-300 text-sm">Warning: ADMIN_ACCESS_TOKEN not set. This page is not protected.</div>
      )}
      <form className="mb-4 flex flex-wrap gap-2 items-end" action="" method="GET">
        {token && <input type="hidden" name="key" defaultValue={token} />}
        <div className="flex flex-col">
          <label className="text-xs text-white/60" htmlFor="q">Search</label>
          <input id="q" name="q" defaultValue={q} placeholder="Email or session ID" className="bg-transparent border border-white/20 rounded-md px-3 py-2 text-white placeholder:text-white/40 w-64" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-white/60" htmlFor="from">From</label>
          <input id="from" name="from" type="date" defaultValue={from} className="bg-transparent border border-white/20 rounded-md px-3 py-2 text-white w-40" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-white/60" htmlFor="to">To</label>
          <input id="to" name="to" type="date" defaultValue={to} className="bg-transparent border border-white/20 rounded-md px-3 py-2 text-white w-40" />
        </div>
        <button className="rounded-md bg-white text-black px-4 py-2 text-sm hover:bg-white/90">Apply</button>
        <Link href={`/admin/deposits${token ? `?key=${token}` : ""}`} className="rounded-md border border-white/20 text-white px-3 py-2 text-sm hover:bg-white/10">Reset</Link>
        <Link href={`/admin/deposits/export${token ? `?key=${token}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}${from ? `&from=${from}` : ""}${to ? `&to=${to}` : ""}`} className="rounded-md border border-white/20 text-white px-3 py-2 text-sm hover:bg-white/10">Export CSV</Link>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-white/70">
            <tr>
              <th className="text-left p-2 border-b border-white/10">When</th>
              <th className="text-left p-2 border-b border-white/10">Email</th>
              <th className="text-left p-2 border-b border-white/10">Amount</th>
              <th className="text-left p-2 border-b border-white/10">Currency</th>
              <th className="text-left p-2 border-b border-white/10">Status</th>
              <th className="text-left p-2 border-b border-white/10">Booking</th>
              <th className="text-left p-2 border-b border-white/10">Session</th>
            </tr>
          </thead>
          <tbody>
            {list.map((d) => (
              <tr key={d.id} className="odd:bg-white/5">
                <td className="p-2 align-top">{new Date(d.createdAt).toLocaleString()}</td>
                <td className="p-2 align-top">{d.email || "—"}</td>
                <td className="p-2 align-top">{formatCurrency(d.amount, d.currency)}</td>
                <td className="p-2 align-top">{d.currency}</td>
                <td className="p-2 align-top">{d.paymentStatus}</td>
                <td className="p-2 align-top">
                  {d.booking ? (
                    <div>
                      <div className="font-medium">{d.booking.name}</div>
                      <div className="text-white/70 text-xs">{d.booking.placement} · {d.booking.size}</div>
                    </div>
                  ) : (
                    <span className="text-white/60">—</span>
                  )}
                </td>
                <td className="p-2 align-top"><code className="text-xs">{d.sessionId}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

