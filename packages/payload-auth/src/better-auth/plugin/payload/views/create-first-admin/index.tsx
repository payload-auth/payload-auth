import React from "react";
import type { AdminViewServerProps } from "payload";
import "./index.scss";
import { CreateFirstUserClient } from "./client";
import {
  BetterAuthPluginOptions,
  SanitizedBetterAuthOptions,
} from "../../../types";
import { checkUsernamePlugin } from "../../../helpers/check-username-plugin";
import { getSafeRedirect } from "../../utils/get-safe-redirect";
import { redirect } from "next/navigation";

type CreateFirstAdminProps = AdminViewServerProps & {
  defaultAdminRole: string;
  pluginOptions: BetterAuthPluginOptions;
  betterAuthOptions: SanitizedBetterAuthOptions;
};

const CreateFirstAdmin: React.FC<CreateFirstAdminProps> = async ({
  initPageResult,
  params,
  searchParams,
  defaultAdminRole,
  pluginOptions,
  betterAuthOptions,
}: CreateFirstAdminProps) => {
  const {
    locale,
    req,
    req: {
      payload: {
        collections,
        config: {
          admin: { user: userSlug },
          routes: { admin },
        },
      },
    },
  } = initPageResult;

  const collectionConfig = collections?.[userSlug]?.config;
  const { auth: authOptions } = collectionConfig;
  const hasUsernamePlugin = checkUsernamePlugin(betterAuthOptions);
  const loginWithUsername = authOptions.loginWithUsername;
  const canLoginWithUsername =
    (hasUsernamePlugin && loginWithUsername) ?? false;

  const adminCount = await req.payload.count({
    collection: userSlug,
    where: {
      role: {
        equals: defaultAdminRole ?? "admin",
      },
    },
  });

  const redirectUrl = getSafeRedirect(searchParams?.redirect ?? "", admin);

  if (adminCount.totalDocs > 0) {
    redirect(redirectUrl);
  }
  const socialProviders = pluginOptions.adminComponents?.socialProviders ?? {};

  return (
    <section className="create-first-user login template-minimal template-minimal--width-normal">
      <div className="template-minimal__wrap">
        <h1>{req.t("general:welcome")}</h1>
        <p>{req.t("authentication:beginCreateFirstUser")}</p>
        <CreateFirstUserClient
          defaultAdminRole={defaultAdminRole}
          socialProviders={socialProviders}
          searchParams={searchParams ?? {}}
          loginWithUsername={canLoginWithUsername}
          userSlug={userSlug}
        />
      </div>
    </section>
  );
};

export default CreateFirstAdmin;

{
  /* <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              marginBottom: "1.5rem",
            }}
          >
            {RenderServerComponent({
              Component: graphics?.Logo,
              Fallback: () => <PayloadLogo />,
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
          </div>
          {RenderServerComponent({
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
          })}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SignUp
              admin={true}
              apiRoute={api}
              userSlug={userSlug}
              defaultAdminRole={defaultAdminRole}
            />
          </div>
          {RenderServerComponent({
            Component: filteredAfterLogin,
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
        </div> */
}
