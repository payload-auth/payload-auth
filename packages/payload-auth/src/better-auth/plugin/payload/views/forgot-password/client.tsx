"use client";

import React, { useMemo, useState, useTransition } from "react";
import { createAuthClient } from "better-auth/react";
import { Form } from "../../components/form/index";
import { EmailField } from "../../components/form/fields/email";
import { FormSubmit, toast, useConfig, useTranslation } from "@payloadcms/ui";
import { FormHeader } from "../../components/form/header";
import { getAdminRoutes } from "../../../helpers/get-admin-routes";
import type { FC, FormEvent, ChangeEvent, FocusEvent } from "react";

type ForgotPasswordFormProps = {};

export const ForgotPasswordForm: FC<ForgotPasswordFormProps> = () => {
  const authClient = useMemo(() => createAuthClient(), []);
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const { t } = useTranslation();
  const { config } = useConfig();
  const adminRoute = config?.routes?.admin || '/admin'
  const adminRoutes = getAdminRoutes(config);

  const handleFieldChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError(undefined);
  };

  const validateEmail = (value: string): boolean => {
    if (!value) {
      setEmailError(t("authentication:emailNotValid") || "Email is required");
      return false;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      setEmailError(t("authentication:emailNotValid") || "Invalid email");
      return false;
    }
    setEmailError(undefined);
    return true;
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    if (e.target.value) {
      validateEmail(e.target.value);
    } else {
      setEmailError(undefined);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const valid = validateEmail(email);
    if (!valid) return;
    startTransition(async () => {
      try {
        const { data, error } = await authClient.forgetPassword({
          email,
          redirectTo: `${adminRoute}${adminRoutes?.resetPassword}`,
        });
        if (error) {
          toast.error(error.message || t("authentication:emailNotValid") || "Error");
          return;
        }
        if (data?.status) {
          setHasSubmitted(true);
          toast.success("Successfully sent reset email.");
        } else {
          toast.error(t("general:error") || "Server Error");
        }
      } catch (e) {
        toast.error(t("general:error") || "An unexpected error occurred");
      }
    });
  };

  if (hasSubmitted) {
    return (
      <FormHeader
        description={t("authentication:checkYourEmailForPasswordReset")}
        heading={t("authentication:emailSent")}
      />
    );
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormHeader
        heading={t("authentication:forgotPassword")}
        description={t("authentication:forgotPasswordEmailInstructions")}
      />
      <EmailField
        id="email"
        label={t("general:email")}
        value={email}
        error={emailError}
        onChange={handleFieldChange}
        onBlur={handleBlur}
        required
      />
      <FormSubmit disabled={isPending} size="large">
        {isPending ? t("general:loading") : t("general:submit")}
      </FormSubmit>
    </Form>
  );
}; 