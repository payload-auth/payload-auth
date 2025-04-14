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
import { Logo } from "../../components/logo";

const baseClass = "create-first-user";

type CreateFirstAdminProps = AdminViewServerProps & {
  defaultAdminRole: string;
  pluginOptions: BetterAuthPluginOptions;
  betterAuthOptions: SanitizedBetterAuthOptions;
};

const CreateFirstAdmin: React.FC<CreateFirstAdminProps> = async ({
  initPageResult,
  params,
  searchParams,
  pluginOptions,
  betterAuthOptions,
}: CreateFirstAdminProps) => {
  const {
    locale,
    permissions,
    req,
    req: {
      i18n,
      user,
      payload: {
        collections,
        config: {
          admin: { user: userSlug },
          routes: { admin },
        },
      },
    },
  } = initPageResult;
  const adminRole = pluginOptions.users?.defaultAdminRole ?? "admin";
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
        equals: adminRole,
      },
    },
  });

  const redirectUrl = getSafeRedirect(searchParams?.redirect ?? "", admin);

  if (adminCount.totalDocs > 0) {
    redirect(redirectUrl);
  }
  const socialProviders = pluginOptions.adminComponents?.socialProviders ?? {};

  // create an admin invitation to validate the secure admin signup
  const token = crypto.randomUUID();
  const adminInvitation = await req.payload.create({
    collection: pluginOptions.adminInvitations?.slug ?? "admin-invitations",
    data: {
      role: adminRole,
      token,
    },
  });

  return (
    <section className="create-first-user login template-minimal template-minimal--width-normal">
      <div className="template-minimal__wrap">
        <div className={`${baseClass}__brand`}>
          <Logo
            i18n={i18n}
            locale={locale}
            params={params}
            payload={req.payload}
            permissions={permissions}
            searchParams={searchParams}
            user={user ?? undefined}
          />
        </div>
        <CreateFirstUserClient
          token={token}
          defaultAdminRole={adminRole}
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
