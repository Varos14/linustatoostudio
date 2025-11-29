import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const token = process.env.ADMIN_ACCESS_TOKEN || "";
  const { searchParams } = new URL(req.url);
  const provided = searchParams.get("key") || "";
  const q = searchParams.get("q") || "";
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (token && provided !== token) {
    return new Response("Forbidden", { status: 403 });
  }

  const where: Prisma.DepositWhereInput = {};
  const fromDate = from ? new Date(from) : undefined;
  const toDate = to ? new Date(to) : undefined;
  if (fromDate || toDate) {
    const createdAtFilter: Prisma.DateTimeFilter = {};
    if (fromDate) createdAtFilter.gte = fromDate;
    if (toDate) createdAtFilter.lte = toDate;
    where.createdAt = createdAtFilter;
  }

  const limit = 4000;
  let ids: string[] = [];
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
      LIMIT ${limit}
    `;
    ids = idRows.map((r) => r.id);
  }

  const deposits = q.trim()
    ? await prisma.deposit.findMany({
        where: { id: { in: ids }, ...(Object.keys(where).length ? where : {}) },
        orderBy: { createdAt: "desc" },
        take: limit,
      })
    : await prisma.deposit.findMany({
        where: Object.keys(where).length ? where : undefined,
        orderBy: { createdAt: "desc" },
        take: limit,
      });

  const filtered = deposits;

  const headers = [
    "id",
    "created_at",
    "email",
    "amount_cents",
    "currency",
    "payment_status",
    "session_id",
    "payment_intent_id",
    "booking_id",
  ];

  const lines = [headers.join(",")];

  for (const d of filtered) {
    const row = [
      d.id,
      new Date(d.createdAt).toISOString(),
      d.email || "",
      String(d.amount),
      d.currency,
      d.paymentStatus,
      d.sessionId,
      d.paymentIntentId || "",
      d.bookingId || "",
    ];
    lines.push(row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","));
  }

  const csv = lines.join("\n");
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=deposits.csv",
    },
  });
}

