"use client";

import {
  Form,
  FormSubmit,
  Link,
  PasswordField,
  useAuth,
  useConfig,
  useTranslation,
  toast,
} from "@payloadcms/ui";
import type { FormState } from "payload";
import React, { useState } from "react";
import type { SocialProviders } from "../../../../types";

import AdminSocialProviderButtons from "../../../components/admin-social-provider-buttons";
import { getSafeRedirect } from "../../../utils/get-safe-redirect";

import "./index.scss";

import { formatAdminURL, getLoginOptions } from "payload/shared";
import { LoginField, LoginFieldProps } from "./fields/login-field";
import { getAdminRoutes } from "../../../../helpers/get-admin-routes";
import { useRouter } from "next/navigation";
const baseClass = "login__form";

type LoginFormProps = {
  socialProviders: SocialProviders;
  hasUsernamePlugin: boolean;
  hasPasskeySupport: boolean;
  prefillEmail?: string;
  prefillPassword?: string;
  prefillUsername?: string;
  searchParams: { [key: string]: string | string[] | undefined };
};

export const LoginForm: React.FC<LoginFormProps> = ({
  socialProviders,
  hasUsernamePlugin,
  hasPasskeySupport,
  prefillEmail,
  prefillPassword,
  prefillUsername,
  searchParams,
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { setUser } = useAuth();
  const { config, getEntityConfig } = useConfig();
  const [loading, setLoading] = useState<boolean>(false);
  const [requireEmailVerification, setRequireEmailVerification] =
    useState<boolean>(false);

  const {
    admin: { user: userSlug },
    routes: { admin: adminRoute, api: apiRoute },
  } = config;
  const adminRoutes = getAdminRoutes(config.admin.custom);

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

  const initialState: FormState = {
    password: {
      initialValue: prefillPassword ?? undefined,
      valid: true,
      value: prefillPassword ?? undefined,
    },
  };

  if (loginType === "emailOrUsername" || loginType === "username") {
    initialState.username = {
      initialValue: prefillUsername ?? undefined,
      valid: true,
      value: prefillUsername ?? undefined,
    };
  }
  if (loginType === "emailOrUsername" || loginType === "email") {
    initialState.email = {
      initialValue: prefillEmail ?? undefined,
      valid: true,
      value: prefillEmail ?? undefined,
    };
  }

  const redirectUrl = getSafeRedirect(
    searchParams?.redirect as string,
    adminRoute
  );

  const handleLogin = (data: any) => {
    setUser(data);
  };

  const handleResponse = (res: Response) => {
    res.json().then((json: any) => {
      if (json.requireEmailVerification) {
        setRequireEmailVerification(true);
        toast.message(json.message);
      } else {
        toast.success(json.message);
        router.push(redirectUrl);
      }
    });
  };

  return (
    <div className={`${baseClass}__wrapper`}>
      {requireEmailVerification ? (
        <h1 className={`${baseClass}__email-verification-required`}>
          Please verify your email to login. Check your email for a verification
          link.
        </h1>
      ) : (
        <>
          <Form
            action={`${apiRoute}/${userSlug}/login`}
            className={baseClass}
            disableSuccessStatus
            initialState={initialState}
            method="POST"
            onSuccess={handleLogin}
            handleResponse={handleResponse}
            redirect={redirectUrl}
            waitForAutocomplete
          >
            <div className={`${baseClass}__input-wrap`}>
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
            <div className={`${baseClass}__forgot-password-wrap`}>
              <Link
                href={formatAdminURL({
                  adminRoute: adminRoute,
                  path: adminRoutes.forgotPassword as `/${string}`,
                })}
                prefetch={false}
              >
                {t("authentication:forgotPasswordQuestion")}
              </Link>
            </div>
            <FormSubmit size="large" disabled={loading}>
              {t("authentication:login")}
            </FormSubmit>
          </Form>
          <AdminSocialProviderButtons
            allowSignup={false}
            socialProviders={socialProviders}
            setLoading={setLoading}
            hasPasskeySupport={hasPasskeySupport}
            redirectUrl={redirectUrl}
          />
        </>
      )}
    </div>
  );
};
