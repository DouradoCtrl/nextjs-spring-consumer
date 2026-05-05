import { withAuth } from "next-auth/middleware";
import { NextRequest } from "next/server";

export const middleware = withAuth(
  function middleware(req: NextRequest) {
    return;
  },
  {
    pages: {
      signIn: "/",
    },
  },
);

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
