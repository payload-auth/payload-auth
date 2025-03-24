import { source } from "@/lib/source";
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import defaultMdxComponents, { createRelativeLink } from "fumadocs-ui/mdx";
import { Card, Cards } from "fumadocs-ui/components/card";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { File, Folder, Files } from "fumadocs-ui/components/files";
import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ForkButton } from "@/components/mdx/fork-button";
import { GenerateSecret } from "@/components/mdx/generate-secret";
import { Endpoint } from "@/components/mdx/endpoint";
import { DividerText } from "@/components/mdx/divider-text";
import { AnimatePresence } from "@/components/mdx/animate-presence";
import { getPageLinks } from "@/lib/get-page-links";
import { docLinks } from "@/config";
import Features from "@/components/landing/features";
import DatabaseTable from "@/components/mdx/database-table";

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const { nextPage, prevPage } = getPageLinks(page.url, docLinks);

  const MDXContent = page.data.body;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      editOnGithub={{
        owner: "forrestdevs",
        repo: "payload-better-auth",
        sha: "main",
        path: `/docs/content/docs/${page.file.path}`,
      }}
      tableOfContent={{
        style: "clerk",
        header: <div className="w-10 h-4"></div>,
      }}
      footer={{
        enabled: true,
        component: <div className="w-10 h-4" />,
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDXContent
          components={{
            ...defaultMdxComponents,
            Accordion,
            Accordions,
            Link: ({
              className,
              ...props
            }: React.ComponentProps<typeof Link>) => (
              <Link
                className={cn(
                  "font-medium underline underline-offset-4",
                  className
                )}
                {...props}
              />
            ),
            Step,
            Steps,
            File,
            Folder,
            Files,
            Tab,
            Tabs,
            GenerateSecret,
            AnimatePresence,
            Endpoint,
            DividerText,
            ForkButton,
            Features,
            DatabaseTable,
            Callout: ({ children, ...props }) => (
              <defaultMdxComponents.Callout
                {...props}
                className={cn(
                  props,
                  "bg-none rounded-none border-dashed border-border",
                  props.type === "info" && "border-l-blue-500/50",
                  props.type === "warn" && "border-l-amber-700/50",
                  props.type === "error" && "border-l-red-500/50"
                )}
              >
                {children}
              </defaultMdxComponents.Callout>
            ),
            iframe: (props) => (
              <iframe {...props} className="w-full h-[500px]" />
            ),
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
            // you can add other MDX components here
          }}
        />
        <Cards className="mt-16">
          {prevPage ? (
            <Card
              href={prevPage.url}
              className="[&>p]:ml-1 [&>p]:truncate [&>p]:w-full"
              description={<>{prevPage.data.description}</>}
              title={
                <div className="flex items-center gap-1">
                  <ChevronLeft className="size-4" />
                  {prevPage.data.title}
                </div>
              }
            />
          ) : (
            <div></div>
          )}
          {nextPage ? (
            <Card
              href={nextPage.url}
              description={<>{nextPage.data.description}</>}
              title={
                <div className="flex items-center gap-1">
                  {nextPage.data.title}
                  <ChevronRight className="size-4" />
                </div>
              }
              className="flex flex-col items-end text-right [&>p]:ml-1 [&>p]:truncate [&>p]:w-full"
            />
          ) : (
            <div></div>
          )}
        </Cards>
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (page == null) notFound();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL;
  const url = new URL(`http://localhost:3000/api/og`);
  const { title, description } = page.data;
  const pageSlug = page.file.path;
  url.searchParams.set("type", "Documentation");
  url.searchParams.set("mode", "dark");
  url.searchParams.set("heading", `${title}`);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}/docs/${pageSlug}`,
      images: [
        {
          url: url.toString(),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [url.toString()],
    },
  };
}
