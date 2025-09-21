import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Custom middleware logic here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

// Protect these routes
export const config = {
  matcher: [
    // "/dashboard/:path*", // Temporarily disabled for testing
    // "/api/prospects/:path*", // Temporarily disabled for testing
    "/api/campaigns/:path*",
    "/api/calls/:path*",
  ],
};