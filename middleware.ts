import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/admin/:path*"],
};

export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;

  // If credentials not set, allow through (dev mode). Use ADMIN_ACCESS_TOKEN on page as a secondary guard.
  if (!user || !pass) return NextResponse.next();

  const header = req.headers.get("authorization") || "";
  const [scheme, encoded] = header.split(" ");

  if (scheme !== "Basic" || !encoded) {
    return new Response("Auth required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
    });
  }

  try {
    const decoded = typeof atob === "function" ? atob(encoded) : Buffer.from(encoded, "base64").toString("utf8");
    const [u, p] = decoded.split(":");
    if (u === user && p === pass) {
      return NextResponse.next();
    }
  } catch {
    // fallthrough to 401
  }

  return new Response("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
  });
}

