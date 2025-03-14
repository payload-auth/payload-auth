import React from "react";
import type { AdminViewServerProps, ServerProps } from "payload";
import { RenderServerComponent } from "@payloadcms/ui/elements/RenderServerComponent";
import { redirect } from "next/navigation";
import getPayload from "@/lib/getPayload";
import { AuthForm } from "./form";
import { Gutter } from "@payloadcms/ui";

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

  const isFirstAdmin = await req.payload.count({
    collection: "users",
    where: {
      role: {
        equals: "admin",
      },
    },
  });

  //   if (isFirstAdmin.totalDocs === 0) {
  //     redirect("/admin/create-first-admin");
  //   }

  //   if (user && user.role !== "admin") {
  //     const payloadAuth = await getPayload();
  //     await payloadAuth.betterAuth.api.signOut({ headers: req.headers });
  //     redirect("/admin/login");
  //   }

  return (
    <Gutter className="mt-40">
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
        <AuthForm view="signIn" redirectTo="/admin" />
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
