import React from "react";
import type { AdminViewServerProps, ServerProps } from "payload";
import { RenderServerComponent } from "@payloadcms/ui/elements/RenderServerComponent";
import { redirect } from "next/navigation";
import getPayload from "@/lib/getPayload";
import { AuthForm } from "./form";
import { Gutter } from "@payloadcms/ui";
import SignIn from "@/components/sign-in";

export default async function LoginView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const { locale, permissions, req } = initPageResult;
  const {
    i18n,
    payload: { config },
    payload,
    user,
  } = req;

  const {
    admin: {
      components: { afterLogin, beforeLogin, graphics } = {},
      user: userSlug,
    },
    routes: { admin },
  } = config;

  const adminCount = await req.payload.count({
    collection: "users",
    where: {
      role: {
        equals: "admin",
      },
    },
  });

  if (adminCount.totalDocs === 0) {
    redirect("/admin/create-first-admin");
  }

  return (
    <Gutter className="twp mt-40">
      {RenderServerComponent({
        Component: graphics?.Logo,
        importMap: payload.importMap,
        serverProps: {
          i18n,
          locale,
          params,
          payload,
          permissions,
          searchParams,
          user: user ?? undefined,
        } satisfies ServerProps,
      })}
      {/* {RenderServerComponent({
        Component: beforeLogin,
        importMap: payload.importMap,
        serverProps: {
          i18n,
          locale,
          params,
          payload,
          permissions,
          searchParams,
          user: user ?? undefined,
        } satisfies ServerProps,
      })} */}
      <div className="flex flex-col items-center justify-center">
        <SignIn admin={true} />
      </div>
      {RenderServerComponent({
        Component: afterLogin,
        importMap: payload.importMap,
        serverProps: {
          i18n,
          locale,
          params,
          payload,
          permissions,
          searchParams,
          user: user ?? undefined,
        } satisfies ServerProps,
      })}
    </Gutter>
  );
}
