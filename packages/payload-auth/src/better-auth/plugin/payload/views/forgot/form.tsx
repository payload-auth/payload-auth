"use client";

import {
  FormSubmit,
  toast,
  useConfig,
  useTranslation
} from "@payloadcms/ui";
import { Tooltip } from "@payloadcms/ui/elements/Tooltip";
import { createAuthClient } from "better-auth/react";
import React, { useMemo, useState, useTransition } from "react";

function isEmail(input: string): true | string {
  if (!input) {
    return "Email cannot be empty";
  }
  
  const emailRegex = /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_'+\-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i;
  
  if (!emailRegex.test(input)) {
    return "Invalid email format";
  }
  
  return true;
}

const ForgotPasswordForm: React.FC = () => {
  const authClient = useMemo(() => createAuthClient(), []);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isPending, startTransition] = useTransition();
  const { config: { routes: { admin: adminRoute } } } = useConfig();

  const { t } = useTranslation();

  const validateEmail = (value: string) => {
    const result = isEmail(value);
    setEmailError(result === true ? "" : result);
    return result === true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!validateEmail(email)) return;

    startTransition(async () => {
      try {
        const { data: forgotPasswordData, error } = await authClient.forgetPassword({ email, redirectTo: `${adminRoute}/reset-password` });

        if (error) {
          toast.error(error.message);
          return;
        }

        if (!forgotPasswordData?.status) {
          toast.error("Password reset failed");
          return;
        }

        toast.success("Password reset email sent");
      } catch (e) {
        toast.error("An unexpected error occurred");
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h1>{t("authentication:forgotPassword")}</h1>
      <p>{t("authentication:forgotPasswordEmailInstructions")}</p>
      <form onSubmit={handleSubmit}>
        <div className={`field-type email${emailError ? " error" : ""}`}>
          <label className="field-label" htmlFor="field-email">
            {t("general:email")}<span className="required">*</span>
          </label>
          <div className="field-type__wrap">
            {emailError && (
              <Tooltip
                alignCaret="right"
                className="field-error"
                delay={0}
                staticPositioning
              >
                {emailError}
              </Tooltip>
            )}
            <input
              autoComplete="email"
              id="field-email"
              placeholder="Email"
              onChange={handleEmailChange}
              onBlur={(e) => validateEmail(e.target.value)}
              type="email"
              name="email"
              value={email}
            />
          </div>
        </div>
        <FormSubmit size="large" disabled={isPending}>
          {isPending ? t("general:loading") : t("general:submit")}
        </FormSubmit>
      </form>
    </div>
  );
};

export { ForgotPasswordForm };