import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const canonicalHost = "aluminioyvidrioinstala.mx";

function bareHost(host: string) {
  return host.split(":")[0]?.toLowerCase().replace(/^www\./, "") ?? "";
}

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const hostname = bareHost(host);

  if (hostname !== "aluminioyvidrioinstala.mx" && hostname !== "aluminioyvidrioinstala.com") {
    return NextResponse.next();
  }

  if (host.toLowerCase().startsWith("www.") || hostname === "aluminioyvidrioinstala.com") {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = canonicalHost;
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|img/|.*\\..*).*)"],
};
