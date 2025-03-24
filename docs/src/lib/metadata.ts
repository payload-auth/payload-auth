import type { Metadata } from "next/types";

export function createMetadata(override: Metadata): Metadata {
  return {
    ...override,
    openGraph: {
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      url: "https://payloadauth.xyz",
      images: "https://payloadauth.xyz/og.png",
      siteName: "Payload Auth",
      ...override.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      creator: "@forrestdevs",
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      images: "https://payloadauth.xyz/og.png",
      ...override.twitter,
    },
  };
}

export const baseUrl =
  process.env.NODE_ENV === "development"
    ? new URL("http://localhost:3000")
    : new URL(`https://${process.env.NEXT_PUBLIC_BASE_URL}`);
