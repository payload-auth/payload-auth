import React from "react";
import { Glow } from "@/components/ui/glow";
import { StarField } from "@/components/ui/star-field";
import { MarkdownClient } from "./_comps/markdown.client";
import { IconLink } from "@/components/ui/icon-link";
import { Icons } from "@/components/ui/icons";

export default async function ChangelogsPage() {
  //   const { data: releases } = await betterFetch<
  //     {
  //       id: number;
  //       tag_name: string;
  //       name: string;
  //       body: string;
  //       html_url: string;
  //       prerelease: boolean;
  //       published_at: string;
  //     }[]
  //   >("https://api.github.com/repos/forrestdevs/payload-better-auth/releases");

  //   const messages = releases
  //     ?.filter((release) => !release.prerelease)
  //     .map((release) => ({
  //       tag: release.tag_name,
  //       title: release.name,
  //       content: getContent(release.body),
  //       date: new Date(release.published_at).toLocaleDateString("en-US", {
  //         year: "numeric",
  //         month: "short",
  //         day: "numeric",
  //       }),
  //       url: release.html_url,
  //     }));

  //   function getContent(content: string) {
  //     const lines = content.split("\n");
  //     const newContext = lines.map((line) => {
  //       if (line.startsWith("- ")) {
  //         const mainContent = line.split(";")[0];
  //         const context = line.split(";")[2];
  //         const mentions = context
  //           ?.split(" ")
  //           .filter((word) => word.startsWith("@"))
  //           .map((mention) => {
  //             const username = mention.replace("@", "");
  //             const avatarUrl = `https://github.com/${username}.png`;
  //             return `[![${mention}](${avatarUrl})](https://github.com/${username})`;
  //           });
  //         if (!mentions) {
  //           return line;
  //         }
  //         // Remove &nbsp
  //         return mainContent.replace(/&nbsp/g, "") + " – " + mentions.join(" ");
  //       }
  //       return line;
  //     });
  //     return newContext.join("\n");
  //   }

  return (
    <div className="grid md:grid-cols-2 items-start">
      <div className="bg-gradient-to-tr overflow-hidden px-12 py-24 md:py-0 -mt-[100px] md:h-dvh relative md:sticky top-0 from-transparent dark:via-stone-950/5 via-stone-100/30 to-stone-200/20 dark:to-transparent/10">
        <StarField className="top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2" />
        <Glow />

        <div className="flex flex-col md:justify-center max-w-xl mx-auto h-full">
          <h1 className="mt-14 font-sans font-semibold tracking-tighter text-5xl">
            All of the changes made will be{" "}
            <span className="">available here.</span>
          </h1>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            Payload Auth is comprehensive authentication library for Payload CMS
            that provides a wide range of features to make authentication easier
            and more secure.
          </p>
          <hr className="h-px bg-gray-300 mt-5" />
          <div className="mt-8 flex flex-wrap text-gray-600 dark:text-gray-300 gap-x-1 gap-y-3 sm:gap-x-2">
            <IconLink
              href="/docs/introduction"
              icon={Icons.book2}
              className="flex-none text-gray-600 dark:text-gray-300"
            >
              Documentation
            </IconLink>
            <IconLink
              href="https://github.com/forrestdevs/payload-better-auth"
              icon={Icons.github2}
              className="flex-none text-gray-600 dark:text-gray-300"
            >
              GitHub
            </IconLink>
          </div>
        </div>
      </div>
      <div className="px-4 relative md:px-8 pb-12 md:py-12">
        <div className="absolute top-0 left-0 mb-2 w-2 h-full -translate-x-full bg-gradient-to-b from-black/10 dark:from-white/20 from-50% to-50% to-transparent bg-[length:100%_5px] bg-repeat-y"></div>

        <div className="max-w-2xl relative">
          <MarkdownClient messages={[]} />
        </div>
      </div>
    </div>
  );
}
