"use client";

import { toast, useConfig, useTranslation } from "@payloadcms/ui";
import { usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { LoginWithUsernameOptions } from "payload";
import React, { useState } from "react";
import { adminEndpoints } from "@/better-auth/plugin/constants";
import {
  AlternativeMethods,
  LoginFormProvider
} from "@/better-auth/plugin/payload/components/login-form";
import { getSafeRedirect } from "@/better-auth/plugin/payload/utils/get-safe-redirect";
import type { LoginMethod } from "@/better-auth/plugin/types";
import { useAppForm } from "@/shared/form";
import { Form, FormInputWrap } from "@/shared/form/ui";
import { FormHeader } from "@/shared/form/ui/header";
import { createSignupSchema } from "@/shared/form/validation";

interface AdminSignupClientProps {
  adminInviteToken: string;
  userSlug: string;
  loginMethods: LoginMethod[];
  searchParams: { [key: string]: string | string[] | undefined };
  loginWithUsername: false | LoginWithUsernameOptions;
  loginIdentifiers: ("email" | "username")[];
  plugins?: {
    username?: boolean;
    passkey?: boolean;
    magicLink?: boolean;
  };
  baseURL?: string;
  basePath?: string;
}

const baseClass = "admin-signup";

interface SignupFormProps {
  adminInviteToken: string;
  searchParams: { [key: string]: string | string[] | undefined };
  loginWithUsername: false | LoginWithUsernameOptions;
  requireEmailVerification: boolean;
  setRequireEmailVerification: React.Dispatch<React.SetStateAction<boolean>>;
  baseURL?: string;
  basePath?: string;
}

function SignupForm({
  searchParams,
  loginWithUsername,
  requireEmailVerification,
  setRequireEmailVerification,
  adminInviteToken,
  baseURL,
  basePath
}: SignupFormProps) {
  const {
    config: {
      admin: { user: userSlug },
      routes: { admin: adminRoute }
    }
  } = useConfig();
  const { t } = useTranslation();
  const redirectUrl = getSafeRedirect(
    searchParams?.redirect as string,
    adminRoute
  );
  const authClient = createAuthClient({
    baseURL,
    basePath,
    plugins: [usernameClient()]
  });

  const requireUsername = Boolean(
    loginWithUsername &&
      typeof loginWithUsername === "object" &&
      loginWithUsername.requireUsername
  );

  const requireConfirmPassword = true;
  const signupSchema = createSignupSchema({
    t,
    requireUsername,
    requireConfirmPassword
  });

  const form = useAppForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      ...(requireConfirmPassword ? { confirmPassword: "" } : {}),
      ...(loginWithUsername ? { username: "" } : {})
    },
    onSubmit: async ({ value }) => {
      const { name, email, username, password } = value;

      const { data, error } = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: redirectUrl,
        ...(loginWithUsername && username ? { username } : {}),
        fetchOptions: {
          query: {
            adminInviteToken
          }
        }
      });

      if (
        (error && error.code === "EMAIL_NOT_VERIFIED") ||
        (!error && !data.token && !data?.user.emailVerified)
      ) {
        setRequireEmailVerification(true);
        toast.success("Check your email for a verification link");
        return;
      }

      if (error) {
        toast.error(error.message);
        return;
      }
    },
    validators: {
      onSubmit: signupSchema
    }
  });

  if (requireEmailVerification) {
    return (
      <FormHeader
        heading="Please verify your email"
        description={"Check your email for a verification link."}
        style={{ textAlign: "center" }}
      />
    );
  }

  return (
    <Form
      className={baseClass}
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <FormInputWrap className="login__form">
        <form.AppField
          name="name"
          children={(field) => (
            <field.TextField
              type="name"
              className="text"
              autoComplete="name"
              label="Name"
              required
            />
          )}
        />
        <form.AppField
          name="email"
          children={(field) => (
            <field.TextField
              type="email"
              className="email"
              autoComplete="email"
              label={t("general:email")}
              required
            />
          )}
        />
        {loginWithUsername && (
          <form.AppField
            name="username"
            children={(field) => (
              <field.TextField
                type="name"
                className="text"
                autoComplete="username"
                label={t("authentication:username")}
                required={requireUsername}
              />
            )}
          />
        )}
        <form.AppField
          name="password"
          children={(field) => (
            <field.TextField
              type="password"
              className="password"
              label={t("authentication:newPassword")}
              required
            />
          )}
        />
        <form.AppField
          name="confirmPassword"
          children={(field) => (
            <field.TextField
              type="password"
              className="password"
              label={t("authentication:confirmPassword")}
              required
            />
          )}
        />
      </FormInputWrap>
      <form.AppForm
        children={
          <form.Submit
            label={t("general:create")}
            loadingLabel={t("general:loading")}
          />
        }
      />
    </Form>
  );
}

export function AdminSignupClient({
  adminInviteToken,
  userSlug,
  searchParams,
  loginMethods,
  loginWithUsername,
  loginIdentifiers,
  plugins,
  baseURL,
  basePath
}: AdminSignupClientProps) {
  const {
    config: {
      routes: { admin: adminRoute, api: apiRoute },
      serverURL
    }
  } = useConfig();
  const [requireEmailVerification, setRequireEmailVerification] =
    useState<boolean>(false);
  const redirectUrl = getSafeRedirect(
    searchParams?.redirect as string,
    adminRoute
  );
  const setAdminRoleCallbackURL = `${serverURL}${apiRoute}/${userSlug}${adminEndpoints.setAdminRole}?token=${adminInviteToken}&redirect=${redirectUrl}`;

  return (
    <>
      {loginMethods.includes("emailPassword") && (
        <SignupForm
          adminInviteToken={adminInviteToken}
          searchParams={searchParams}
          loginWithUsername={loginWithUsername}
          requireEmailVerification={requireEmailVerification}
          setRequireEmailVerification={setRequireEmailVerification}
          baseURL={baseURL}
          basePath={basePath}
        />
      )}
      {!requireEmailVerification && (
        <LoginFormProvider
          loginMethods={loginMethods}
          redirectUrl={redirectUrl}
          baseURL={baseURL}
          basePath={basePath}
          isSignup={true}
          loginIdentifiers={loginIdentifiers}
          plugins={plugins}
          adminInviteToken={adminInviteToken}
          newUserCallbackURL={setAdminRoleCallbackURL}
        >
          <AlternativeMethods />
        </LoginFormProvider>
      )}
    </>
  );
}
