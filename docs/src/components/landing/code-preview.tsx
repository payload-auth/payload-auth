"use client";

import { useTheme } from "next-themes";
import { Fragment, useEffect, useState } from "react";
import useMeasure from "react-use-measure";
import { Highlight, themes } from "prism-react-renderer";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useMotionValue,
} from "motion/react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { Icons } from "../ui/icons";
import Link from "next/link";

const tabs: { name: string; code: string }[] = [
  {
    name: "payload.config.ts",
    code: `export default buildConfig({
      plugins: [
        payloadBetterAuth({
          betterAuthOptions: {
            emailAndPassword: {
              enabled: true,
            },
            plugins: [
              admin(),
              twoFactor(),
            ],
          },
        })
      .....
      `,
  },
  {
    name: "get-payload.ts",
    code: `import config from "./payload.config";
import type { BAPlugins } from "./plugins";
import { getPayloadAuth } from 
"@payload-auth/better-auth-plugin";

export function getPayload() {
  return getPayloadAuth<BAPlugins>(config);
}
  `,
  },
  {
    name: "action.ts",
    code: `"use server";

import { getPayload } from "./get-payload";

export async function signIn() {
  const payload = getPayload();
  await payload.betterAuth.api.signInEmail({
    body: {
      email: "test@test.com",
      password: "password",
    },
  });
}
  `,
  },
];

export function CodePreview() {
  const [copyState, setCopyState] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>("payload.config.ts");

  const theme = useTheme();
  const x = useMotionValue(0);
  const [ref, { height }] = useMeasure();
  const code = tabs.find((tab) => tab.name === currentTab)?.code ?? "";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyState(true);
      setTimeout(() => {
        setCopyState(false);
      }, 2000);
    });
  };

  const [codeTheme, setCodeTheme] = useState(themes.oneDark);

  useEffect(() => {
    setCodeTheme(
      theme.resolvedTheme === "light" ? themes.oneLight : themes.oneDark
    );
  }, [theme.resolvedTheme]);

  return (
    <div className="relative">
      <div className="from-sky-300 via-sky-300/70 to-blue-300 absolute inset-0 rounded-none bg-gradient-to-tr opacity-5 blur-lg" />
      <div className="from-stone-300 via-stone-300/70 to-blue-300 absolute inset-0 rounded-none bg-gradient-to-tr opacity-5" />
      <AnimatePresence initial={false}>
        <MotionConfig transition={{ duration: 0.5, type: "spring", bounce: 0 }}>
          <motion.div
            animate={{ height: height > 0 ? height : undefined }}
            className="relative from-stone-100 to-stone-200 dark:to-black/90 dark:via-stone-950/10 dark:from-stone-950/90
           overflow-hidden rounded-sm bg-gradient-to-tr ring-1 ring-white/10 backdrop-blur-lg"
          >
            <div className="pl-4 pt-4 relative" ref={ref}>
              <Icons.trafficLights className="stroke-slate-500/30 h-2.5 w-auto" />

              <div className="mt-4 flex space-x-2 text-xs">
                {tabs.map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setCurrentTab(tab.name)}
                    className={clsx(
                      "relative isolate flex h-6 cursor-pointer items-center justify-center rounded-full px-2.5",
                      currentTab === tab.name
                        ? "text-stone-300"
                        : "text-slate-500"
                    )}
                  >
                    {tab.name}
                    {tab.name === currentTab && (
                      <motion.div
                        layoutId="tab-code-preview"
                        className="bg-stone-800 absolute inset-0 -z-10 rounded-full"
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-5 flex flex-col items-start px-1 text-sm">
                <div className="absolute top-2 right-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute w-5 border-none bg-transparent h-5 top-2 right-0"
                    onClick={() => copyToClipboard(code)}
                  >
                    {copyState ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    <span className="sr-only">Copy code</span>
                  </Button>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  key={currentTab}
                  className="relative flex items-start px-1 text-sm"
                >
                  <div
                    aria-hidden="true"
                    className="border-slate-300/5 text-slate-600 select-none border-r pr-4 font-mono"
                  >
                    {Array.from({
                      length: code.split("\n").length,
                    }).map((_, index) => (
                      <Fragment key={index}>
                        {(index + 1).toString().padStart(2, "0")}
                        <br />
                      </Fragment>
                    ))}
                  </div>
                  <Highlight
                    key={theme.resolvedTheme}
                    code={code}
                    language={"typescript"}
                    theme={{
                      ...codeTheme,
                      plain: {
                        backgroundColor: "transparent",
                      },
                    }}
                  >
                    {({
                      className,
                      style,
                      tokens,
                      getLineProps,
                      getTokenProps,
                    }) => (
                      <pre
                        className={clsx(className, "flex overflow-x-auto pb-6")}
                        style={style}
                      >
                        <code className="px-4">
                          {tokens.map((line, lineIndex) => (
                            <div key={lineIndex} {...getLineProps({ line })}>
                              {line.map((token, tokenIndex) => (
                                <span
                                  key={tokenIndex}
                                  {...getTokenProps({ token })}
                                />
                              ))}
                            </div>
                          ))}
                        </code>
                      </pre>
                    )}
                  </Highlight>
                </motion.div>
              </div>
              <div className="absolute bottom-10 lg:bottom-0 right-0">
                <Link
                  href="https://demo.payloadauth.com"
                  target="_blank"
                  className="shadow-md  border shadow-primary-foreground mb-4 ml-auto mr-4 mt-auto flex cursor-pointer items-center gap-2 px-3 py-1 transition-all ease-in-out hover:opacity-70"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M10 20H8V4h2v2h2v3h2v2h2v2h-2v2h-2v3h-2z"
                    ></path>
                  </svg>
                  <p className="text-sm">Demo</p>
                </Link>
              </div>
            </div>
          </motion.div>
        </MotionConfig>
      </AnimatePresence>
    </div>
  );
}
