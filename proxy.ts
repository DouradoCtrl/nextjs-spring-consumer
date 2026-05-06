import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

export const proxy = withAuth(
  function proxy(req: NextRequest) {
    const token = req.nextauth.token;

    // Proteger rotas de administração
    if (req.nextUrl.pathname.startsWith("/users-management")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
  },
);

export const config = {
  matcher: [
    "/",
    "/(google-ads|users-management|google-analytics|meta-ads)/:path*",
    "/api/:path*",
  ],
};
