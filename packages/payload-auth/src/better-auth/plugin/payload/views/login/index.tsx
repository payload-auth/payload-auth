import { RenderServerComponent } from "@payloadcms/ui/elements/RenderServerComponent";
import { redirect } from "next/navigation";
import { type AdminViewServerProps, type ServerProps } from "payload";
import React from "react";
import { checkUsernamePlugin } from "../../../helpers/check-username-plugin";
import type {
  BetterAuthPluginOptions,
  SanitizedBetterAuthOptions,
} from "../../../types";
import { getSafeRedirect } from "../../utils/get-safe-redirect";
import { LoginForm } from "./form/index";
import { Logo } from "../../components/logo";
import { checkPasskeyPlugin } from "../../../helpers/check-passkey-plugin";

export const loginBaseClass = "login";

type LoginViewProps = AdminViewServerProps & {
  pluginOptions: BetterAuthPluginOptions;
  betterAuthOptions: SanitizedBetterAuthOptions;
};

const LoginView: React.FC<LoginViewProps> = async ({
  initPageResult,
  params,
  searchParams,
  pluginOptions,
  betterAuthOptions,
}: LoginViewProps) => {
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
    routes: { admin: adminRoute },
  } = config;

  const adminRole = pluginOptions.users?.defaultAdminRole ?? "admin";
  const redirectUrl = getSafeRedirect(searchParams?.redirect ?? "", adminRoute);

  if (user) {
    redirect(redirectUrl);
  }

  const adminCount = await req.payload.count({
    collection: userSlug,
    where: {
      role: {
        equals: adminRole,
      },
    },
  });

  // Filter out the first component from afterLogin array or set to undefined if not more than 1
  const filteredAfterLogin =
    Array.isArray(afterLogin) && afterLogin.length > 1
      ? afterLogin.slice(1)
      : undefined;

  const prefillAutoLogin =
    typeof config.admin?.autoLogin === "object" &&
    config.admin?.autoLogin.prefillOnly;

  const prefillUsername =
    prefillAutoLogin && typeof config.admin?.autoLogin === "object"
      ? config.admin?.autoLogin.username
      : undefined;

  const prefillEmail =
    prefillAutoLogin && typeof config.admin?.autoLogin === "object"
      ? config.admin?.autoLogin.email
      : undefined;

  const prefillPassword =
    prefillAutoLogin && typeof config.admin?.autoLogin === "object"
      ? config.admin?.autoLogin.password
      : undefined;

  if (adminCount.totalDocs === 0) {
    redirect(`${adminRoute}/create-first-admin`);
  }

  const canLoginWithUsername = checkUsernamePlugin(betterAuthOptions);
  const hasPasskeyPlugin = checkPasskeyPlugin(betterAuthOptions);
  const socialProviders = pluginOptions.adminComponents?.socialProviders ?? {};

  return (
    <section className="login template-minimal template-minimal--width-normal">
      <div className="template-minimal__wrap">
        <div className={`${loginBaseClass}__brand`}>
          <Logo
            i18n={i18n}
            locale={locale}
            params={params}
            payload={payload}
            permissions={permissions}
            searchParams={searchParams}
            user={user ?? undefined}
          />
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
        <LoginForm
          hasPasskeySupport={hasPasskeyPlugin}
          hasUsernamePlugin={canLoginWithUsername}
          socialProviders={socialProviders}
          prefillEmail={prefillEmail}
          prefillPassword={prefillPassword}
          prefillUsername={prefillUsername}
          searchParams={searchParams ?? {}}
        />
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
      </div>
    </section>
  );
};

export default LoginView;
