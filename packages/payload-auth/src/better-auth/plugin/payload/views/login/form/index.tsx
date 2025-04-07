"use client";

import React, { useState } from "react";
import { createAuthClient } from "better-auth/react";
import { passkeyClient } from "better-auth/client/plugins";
import { Key } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type {
  BetterAuthPluginOptions,
  SanitizedBetterAuthOptions,
  SocialProviders,
} from "../../../../types";
import type { Data, FormState } from "payload";
import {
  Button,
  Form,
  FormSubmit,
  Link,
  PasswordField,
  useAuth,
  useConfig,
  useTranslation,
} from "@payloadcms/ui";

import { getSafeRedirect } from "../../../utils/get-safe-redirect";
import { Icons } from "../../../components/ui/icons";

import "./index.scss";
import { formatAdminURL, getLoginOptions } from "payload/shared";
import { LoginField, LoginFieldProps } from "./fields/login-field";
import { checkUsernamePlugin } from "../../../../helpers/check-username-plugin";
const baseClass = "login__form";

type LoginFormProps = {
  socialProviders: SocialProviders;
  hasUsernamePlugin: boolean;
  prefillEmail?: string;
  prefillPassword?: string;
  prefillUsername?: string;
  searchParams: { [key: string]: string | string[] | undefined };
};

export const LoginForm: React.FC<LoginFormProps> = ({
  socialProviders,
  hasUsernamePlugin,
  prefillEmail,
  prefillPassword,
  prefillUsername,
  searchParams,
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { setUser } = useAuth();
  const { config, getEntityConfig } = useConfig();
  const [loading, setLoading] = useState<Boolean>(false);

  const {
    admin: {
      routes: { forgot: forgotRoute },
      user: userSlug,
    },
    routes: { admin: adminRoute, api: apiRoute },
  } = config;

  const collectionConfig = getEntityConfig({ collectionSlug: userSlug });
  const { auth: authOptions } = collectionConfig;
  const loginWithUsername = authOptions?.loginWithUsername ?? false;
  const { canLoginWithEmail, canLoginWithUsername } =
    getLoginOptions(loginWithUsername);

  const [loginType] = React.useState<LoginFieldProps["type"]>(() => {
    if (canLoginWithEmail && canLoginWithUsername && hasUsernamePlugin) {
      return "emailOrUsername";
    }
    if (canLoginWithUsername && hasUsernamePlugin) {
      return "username";
    }
    return "email";
  });

  const authClient = React.useMemo(
    () =>
      createAuthClient({
        plugins: [passkeyClient()],
      }),
    []
  );

  const initialState: FormState = {
    password: {
      initialValue: prefillPassword ?? undefined,
      valid: true,
      value: prefillPassword ?? undefined,
    },
  };

  if (loginWithUsername) {
    initialState.username = {
      initialValue: prefillUsername ?? undefined,
      valid: true,
      value: prefillUsername ?? undefined,
    };
  } else {
    initialState.email = {
      initialValue: prefillEmail ?? undefined,
      valid: true,
      value: prefillEmail ?? undefined,
    };
  }

  const handleLogin = (data: any) => {
    console.log("Successfully logged in", data);
    setUser(data);
  };

  const handleSubmit = async (fields: FormState, data: Data) => {
    console.log(fields);
    console.log(data);
    await fetch(`${apiRoute}/${userSlug}/login`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  };

  return (
    <div className="space-y-4">
      <Form
        action={`${apiRoute}/${userSlug}/login`}
        className={baseClass}
        disableSuccessStatus
        initialState={initialState}
        method="POST"
        // onSubmit={handleSubmit}
        onSuccess={handleLogin}
        redirect={getSafeRedirect(searchParams?.redirect as string, adminRoute)}
        waitForAutocomplete
      >
        <div className={`${baseClass}__inputWrap`}>
          <LoginField type={loginType} />
          <PasswordField
            field={{
              name: "password",
              label: t("general:password"),
              required: true,
            }}
            path="password"
          />
        </div>
        <Link
          href={formatAdminURL({
            adminRoute: adminRoute,
            path: forgotRoute,
          })}
          prefetch={false}
        >
          {t("authentication:forgotPasswordQuestion")}
        </Link>
        <FormSubmit size="large">{t("authentication:login")}</FormSubmit>
      </Form>

      <div className="relative my-4">
        <div className="relative flex justify-center text-xs uppercase border-b border-muted pb-4">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {Object.keys(socialProviders ?? {}).map((provider) => {
          const typedProvider = provider as keyof SocialProviders;
          const providerConfig = socialProviders?.[typedProvider];

          const Icon = Icons[provider as keyof typeof Icons];

          return (
            <Button
              key={provider}
              type="button"
              onClick={async () => {
                setLoading(true);
                try {
                  await authClient.signIn.social({
                    provider: typedProvider,
                    callbackURL: adminRoute,
                    requestSignUp:
                      providerConfig?.disableSignUp === undefined
                        ? false
                        : !providerConfig.disableSignUp,
                  });
                } catch (error) {
                  toast.error(`Failed to sign in with ${typedProvider}`);
                } finally {
                  setLoading(false);
                }
              }}
            >
              {typedProvider.charAt(0).toUpperCase() + typedProvider.slice(1)}
              {Icon && <Icon />}
            </Button>
          );
        })}
      </div>

      <Button
        type="button"
        onClick={async () => {
          setLoading(true);
          try {
            await authClient.signIn.passkey({
              fetchOptions: {
                onSuccess() {
                  router.push(
                    getSafeRedirect(
                      searchParams?.redirect as string,
                      adminRoute
                    )
                  );
                },
                onError(context) {
                  toast.error(context.error.message);
                },
              },
            });
          } finally {
            setLoading(false);
          }
        }}
      >
        <Key size={16} />
        <span>Sign in with Passkey</span>
      </Button>
    </div>
  );
};
