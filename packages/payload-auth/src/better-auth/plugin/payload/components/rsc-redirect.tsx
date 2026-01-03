import { redirect } from "next/navigation";
import React from "react";

type RSCRedirectProps = {
  redirectTo: string;
  searchParams?: Record<string, string | string[]>;
};

function RSCRedirect({ redirectTo, searchParams }: RSCRedirectProps) {
  // Forward the redirect query param if present
  const redirectParam = searchParams?.redirect;
  if (redirectParam && typeof redirectParam === "string") {
    redirect(`${redirectTo}?redirect=${encodeURIComponent(redirectParam)}`);
  }
  redirect(redirectTo);
}

export default RSCRedirect;
