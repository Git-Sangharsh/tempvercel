import { NextResponse } from "next/server";

export async function middleware(request) {
  const {
    nextUrl: { search },
  } = request;

  const urlSearchParams = new URLSearchParams(search);
  const params = Object.fromEntries(urlSearchParams.entries());

  let myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${request.cookies.get("uat")?.value}`);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
  };

  let settingData;
  try {
    const response = await fetch(`${process.env.API_PROD_URL}/settings`, requestOptions);
    if (response.ok) {
      settingData = await response.json();
    } else {
      throw new Error(`Settings fetch failed with status ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.next();
  }

  const protectedRoutes = [
    "/account/dashboard",
    "/account/notification",
    "/account/wallet",
    "/account/bank-details",
    "/account/point",
    "/account/refund",
    "/account/order",
    "/account/addresses",
    "/wishlist",
    "/compare",
  ];

  const path = request.nextUrl.pathname;

  // Apply CORS Headers
  const response = NextResponse.next();
  const allowedOrigin = ["*", "https://tempvercel-delta.vercel.app/*"];

  response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Maintenance Mode
  if (request.cookies.has("maintenance") && path !== "/maintenance") {
    if (settingData?.values?.maintenance?.maintenance_mode) {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    } else {
      response.cookies.delete("maintenance");
      return response;
    }
  }

  if (!request.cookies.has("maintenance") && path === "/maintenance") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Protected Routes
  if (protectedRoutes.includes(path) && !request.cookies.has("uat")) {
    response.cookies.set("showAuthToast", "true", { httpOnly: false });
    return NextResponse.redirect(new URL(request.cookies.get("currentPath")?.value || "/", request.url));
  }

  // Checkout Guest Access
  if (path === "/checkout" && !request.cookies.has("uat")) {
    if (settingData?.values?.activation?.guest_checkout) {
      if (request.cookies.get("cartData") === "digital") {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
    } else {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // Auth Redirection
  if (path === "/auth/login" && request.cookies.has("uat")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (path === "/auth/otp-verification" && !request.cookies.has("ue")) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (path === "/auth/update-password" && (!request.cookies.has("uo") || !request.cookies.has("ue"))) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Skip middleware for already redirected requests
  if (request.headers.get("x-redirected")) {
    return NextResponse.next();
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
