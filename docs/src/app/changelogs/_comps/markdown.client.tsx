import Markdown from "react-markdown";
import defaultMdxComponents from "fumadocs-ui/mdx";
import rehypeHighlight from "rehype-highlight";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function MarkdownClient({ messages }: { messages: any }) {
  return (
    <Markdown
      rehypePlugins={[[rehypeHighlight]]}
      components={{
        pre: (props) => (
          <defaultMdxComponents.pre
            {...props}
            className={cn(props.className, " ml-10 my-2")}
          />
        ),
        h2: (props) => (
          <h2
            id={props.children?.toString().split("date=")[0].trim()} // Extract ID dynamically
            className="text-2xl relative mb-6 font-bold flex-col flex justify-center tracking-tighter before:content-[''] before:block before:h-[65px] before:-mt-[10px]"
            {...props}
          >
            <div className="sticky top-0 left-[-9.9rem] hidden md:block">
              <time className="flex gap-2 items-center text-gray-500 dark:text-white/80 text-sm md:absolute md:left-[-9.8rem] font-normal tracking-normal">
                {props.children?.toString().includes("date=") &&
                  props.children?.toString().split("date=")[1]}

                <div className="w-4 h-[1px] dark:bg-white/60 bg-black" />
              </time>
            </div>
            <Link
              href={
                props.children
                  ?.toString()
                  .split("date=")[0]
                  .trim()
                  .endsWith(".00")
                  ? `/changelogs/${props.children
                      ?.toString()
                      .split("date=")[0]
                      .trim()}`
                  : `#${props.children?.toString().split("date=")[0].trim()}`
              }
            >
              {props.children?.toString().split("date=")[0].trim()}
            </Link>
            <p className="text-xs font-normal opacity-60 hidden">
              {props.children?.toString().includes("date=") &&
                props.children?.toString().split("date=")[1]}
            </p>
          </h2>
        ),
        h3: (props) => (
          <h3 className="text-xl tracking-tighter py-1" {...props}>
            {props.children?.toString()?.trim()}
            <hr className="h-[1px] my-1 mb-2 bg-input" />
          </h3>
        ),
        p: (props) => <p className="my-0 ml-10 text-sm" {...props} />,
        ul: (props) => (
          <ul
            className="list-disc ml-10 text-[0.855rem] text-gray-600 dark:text-gray-300"
            {...props}
          />
        ),
        li: (props) => <li className="my-1" {...props} />,
        a: ({ className, ...props }: any) => (
          <Link
            target="_blank"
            className={cn("font-medium underline", className)}
            {...props}
          />
        ),
        strong: (props) => <strong className="font-semibold" {...props} />,
        img: (props) => (
          <img
            className="rounded-full w-6 h-6 border opacity-70 inline-block"
            style={{ maxWidth: "100%" }}
            {...props}
          />
        ),
      }}
    >
      {messages
        ?.map((message: any) => {
          return `
## ${message.title} date=${message.date}

${message.content}
                            `;
        })
        .join("\n")}
    </Markdown>
  );
}
