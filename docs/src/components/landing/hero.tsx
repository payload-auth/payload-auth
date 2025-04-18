import Link from "next/link";
import { CornerRightUp } from "lucide-react";
import { Spotlight } from "@/components/landing/spotlight";
import { GradientBG } from "@/components/landing/gradient-bg";
import { CodePreview } from "@/components/landing/code-preview";
import { Icons } from "../ui/icons";
import { CopyButton } from "../ui/copy";
import { betterFetch } from "@better-fetch/fetch";

export default function Hero() {
  async function getLatestVersion() {
    try {
      const { data: releases } = await betterFetch<
        {
          tag_name: string;
          prerelease: boolean;
        }[]
      >("https://api.github.com/repos/payload-auth/payload-auth/releases");

      // Filter out prereleases and get the latest version
      const latestRelease = releases
        ?.filter((release) => !release.prerelease)
        .sort((a, b) => {
          // Sort in descending order (newest first)
          return b.tag_name.localeCompare(a.tag_name, undefined, {
            numeric: true,
          });
        })[0];

      return latestRelease?.tag_name || "v1.3"; // Fallback to v1.3 if no releases found
    } catch (error) {
      console.error("Failed to fetch latest version:", error);
      return "v1.3"; // Fallback version
    }
  }

  return (
    <section
      className="max-h-[40rem] relative w-full flex md:items-center md:justify-center dark:bg-black/[0.96] antialiased bg-grid-white/[0.02] overflow-hidden px-8 md:min-h-[40rem]
     md:pt-[calc(10rem+var(--fd-nav-height))] lg:pt-0
    "
    >
      <Spotlight />
      <div className="overflow-hidden bg-transparent md:px-10 dark:-mb-32 dark:mt-[-4.75rem] dark:pb-32 dark:pt-[4.75rem]">
        <div className="lg:max-w-8xl mx-auto grid max-w-full grid-cols-1 items-center gap-x-8 gap-y-16 px-4 py-2 lg:grid-cols-2 lg:px-8 lg:py-4 xl:gap-x-16 xl:px-12">
          <div className="relative z-10 md:text-center lg:text-left">
            <div className="relative">
              <div className="flex flex-col items-start gap-2">
                <div className="flex items-end gap-1 mt-2 ">
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="0.8em"
                      height="0.8em"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M13 4V2c4.66.5 8.33 4.19 8.85 8.85c.6 5.49-3.35 10.43-8.85 11.03v-2c3.64-.45 6.5-3.32 6.96-6.96A7.994 7.994 0 0 0 13 4m-7.33.2A9.8 9.8 0 0 1 11 2v2.06c-1.43.2-2.78.78-3.9 1.68zM2.05 11a9.8 9.8 0 0 1 2.21-5.33L5.69 7.1A8 8 0 0 0 4.05 11zm2.22 7.33A10.04 10.04 0 0 1 2.06 13h2c.18 1.42.75 2.77 1.63 3.9zm1.4 1.41l1.39-1.37h.04c1.13.88 2.48 1.45 3.9 1.63v2c-1.96-.21-3.82-1-5.33-2.26M12 17l1.56-3.42L17 12l-3.44-1.56L12 7l-1.57 3.44L7 12l3.43 1.58z"
                      ></path>
                    </svg>
                    <span className="text-xs text-opacity-75">
                      Own Your Auth
                    </span>
                  </div>
                  <Link href={"/changelogs"}>
                    <span className="bg-gradient-to-tr dark:from-stone-800/50 dark:to-black from-stone-200 to-white  px-2 rounded-none">
                      <span className="text-xs dark:text-zinc-200 tracking-tighter font-mono mb-0 underline underline-offset-4">
                        {getLatestVersion()} is out
                      </span>
                      <CornerRightUp className="inline ml-1 w-3 h-3" />
                    </span>
                  </Link>
                </div>
              </div>

              <p className="text-zinc-800 dark:text-zinc-300 mt-3 tracking-tight text-2xl md:text-3xl">
                The most powerful authentication plugin for Payload CMS.
              </p>
              <div className="relative mt-4 inline-flex w-auto max-w-md border border-white/10 rounded-lg overflow-hidden">
                <GradientBG className="flex items-center justify-between py-2 px-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href="https://www.npmjs.com/package/payload-auth"
                      target="_blank"
                      className="hover:opacity-80 transition-opacity flex-shrink-0"
                      aria-label="NPM Package"
                    >
                      <Icons.npm className="w-5 h-5" />
                    </Link>
                    <code className="font-mono text-sm dark:text-white text-black overflow-hidden text-ellipsis">
                      npm add{" "}
                      <span className="relative dark:text-fuchsia-100 text-fuchsia-950 overflow-hidden text-ellipsis">
                        payload-auth
                        <span className="absolute h-1.5 bg-gradient-to-tr from-white via-stone-200 to-stone-300 blur-2xl w-full top-0 left-1"></span>
                      </span>
                    </code>
                    <CopyButton
                      text="npm add @payload-auth/better-auth-plugin"
                      className="ml-1 flex-shrink-0"
                    />
                  </div>
                </GradientBG>
              </div>
              <div className="mt-8 flex w-fit flex-col gap-4 font-sans md:flex-row md:justify-center lg:justify-start items-center">
                <Link
                  href="/docs/introduction"
                  className="hover:shadow-sm dark:border-stone-100 dark:hover:shadow-sm border-2 border-black bg-white px-4 py-1.5 text-sm uppercase text-black shadow-[1px_1px_rgba(0,0,0),2px_2px_rgba(0,0,0),3px_3px_rgba(0,0,0),4px_4px_rgba(0,0,0),5px_5px_0px_0px_rgba(0,0,0)] transition duration-200 md:px-8 dark:shadow-[1px_1px_rgba(255,255,255),2px_2px_rgba(255,255,255),3px_3px_rgba(255,255,255),4px_4px_rgba(255,255,255),5px_5px_0px_0px_rgba(255,255,255)]"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>

          <div className="relative hidden md:block xl:pl-10">
            <CodePreview />
          </div>
        </div>
      </div>
    </section>
  );
}
