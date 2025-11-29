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

  const where: Prisma.BookingWhereInput = {};
  const fromDate = from ? new Date(from) : undefined;
  const toDate = to ? new Date(to) : undefined;
  if (fromDate || toDate) {
    const createdAtFilter: Prisma.DateTimeFilter = {};
    if (fromDate) createdAtFilter.gte = fromDate;
    if (toDate) createdAtFilter.lte = toDate;
    where.createdAt = createdAtFilter;
  }

  const limit = 2000;
  let ids: string[] = [];
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
      LIMIT ${limit}
    `;
    ids = idRows.map((r) => r.id);
  }

  const bookings = q.trim()
    ? await prisma.booking.findMany({
        where: { id: { in: ids }, ...(Object.keys(where).length ? where : {}) },
        include: { deposits: true },
        orderBy: { createdAt: "desc" },
        take: limit,
      })
    : await prisma.booking.findMany({
        where: Object.keys(where).length ? where : undefined,
        include: { deposits: true },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

  const filtered = bookings;

  const headers = [
    "id",
    "created_at",
    "name",
    "email",
    "phone",
    "placement",
    "size",
    "style",
    "preferred_dates",
    "budget",
    "references",
    "uploads_count",
    "deposit_count",
    "deposit_total_cents",
    "deposit_currency",
  ];

  const lines = [headers.join(",")];

  for (const b of filtered) {
    const uploads = Array.isArray(b.uploads as unknown)
      ? ((b.uploads as unknown[]) || []).map((u) => String(u))
      : [];
    const totalCents = b.deposits.reduce((sum, d) => sum + (d.amount || 0), 0);
    const currency = b.deposits[0]?.currency || "";

    const row = [
      b.id,
      new Date(b.createdAt).toISOString(),
      b.name,
      b.email,
      b.phone || "",
      b.placement,
      b.size,
      b.style || "",
      b.preferredDates || "",
      b.budget || "",
      (b.references || "").replaceAll(/\r?\n|\r|,/g, " "),
      String(uploads.length),
      String(b.deposits.length),
      String(totalCents),
      currency,
    ];
    lines.push(row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","));
  }

  const csv = lines.join("\n");
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=bookings.csv",
    },
  });
}

