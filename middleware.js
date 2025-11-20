import { NextResponse } from "next/server";

const allowedIPs = ["52.74.250.133"]; // IP yang boleh akses API

export function middleware(req) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.ip ||
    "0.0.0.0";

  if (!allowedIPs.includes(ip)) {
    return new NextResponse("Access Denied (API Protected)", { status: 403 });
  }

  return NextResponse.next();
}

// Middleware hanya berlaku untuk folder /api/*
export const config = {
  matcher: ["/api/:path*"],
};
