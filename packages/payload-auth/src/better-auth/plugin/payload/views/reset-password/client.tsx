"use client";

import { toast, useAuth, useConfig, useTranslation } from "@payloadcms/ui";
import { createAuthClient } from "better-auth/react";
import { useRouter } from "next/navigation.js";
import { formatAdminURL } from "payload/shared";
import React, { useMemo } from "react";
import { z } from "zod";
import { useAppForm } from "@/shared/form";
import { Form, FormInputWrap } from "@/shared/form/ui";

interface PasswordResetFormProps {
  readonly token: string;
  readonly minPasswordLength?: number;
  readonly maxPasswordLength?: number;
  readonly baseURL?: string;
  readonly basePath?: string;
}

export function PasswordResetForm({
  token,
  baseURL,
  basePath
}: PasswordResetFormProps) {
  const { t } = useTranslation();
  const history = useRouter();
  const { fetchFullUser } = useAuth();
  const authClient = useMemo(() => createAuthClient({ baseURL, basePath }), []);
  const {
    config: {
      admin: {
        routes: { login: loginRoute }
      },
      routes: { admin: adminRoute }
    }
  } = useConfig();

  const resetPasswordSchema = z
    .object({
      password: z
        .string()
        .min(1, t("validation:required") || "Password is required"),
      confirmPassword: z
        .string()
        .min(1, t("validation:required") || "Confirm password is required")
    })
    .refine(
      (data) => {
        // Only validate matching passwords if both fields have values
        if (data.password && data.confirmPassword) {
          return data.password === data.confirmPassword;
        }
        // If one or both fields are empty, validation will be handled by the min(1) validators
        return true;
      },
      {
        message: t("fields:passwordsDoNotMatch") || "Passwords do not match",
        path: ["confirmPassword"]
      }
    );

  const form = useAppForm({
    defaultValues: {
      password: "",
      confirmPassword: ""
    },
    onSubmit: async ({ value }) => {
      const { password } = value;
      try {
        const { data, error } = await authClient.resetPassword({
          newPassword: password,
          token
        });
        if (error) {
          toast.error(error.message || "Error resetting password");
          return;
        }
        if (data?.status) {
          const user = await fetchFullUser();
          if (user) {
            history.push(adminRoute);
          } else {
            history.push(
              formatAdminURL({
                adminRoute,
                path: loginRoute
              })
            );
          }
          toast.success(t("authentication:passwordResetSuccessfully"));
        }
      } catch (e) {
        toast.error("An unexpected error occurred");
      }
    },
    validators: {
      onSubmit: resetPasswordSchema
    }
  });

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <FormInputWrap className="login__form">
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
            label={t("authentication:resetPassword")}
            loadingLabel={t("general:loading")}
          />
        }
      />
    </Form>
  );
}
