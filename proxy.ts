import { withAuth } from "next-auth/middleware";
import { NextRequest } from "next/server";

export const proxy = withAuth(
  function proxy(req: NextRequest) {
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
