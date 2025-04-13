"use client";
import {
  FormSubmit,
  toast,
  useAuth,
  useConfig,
  useTranslation,
} from "@payloadcms/ui";
import { createAuthClient } from "better-auth/react";
import { useRouter } from "next/navigation.js";
import { formatAdminURL } from "payload/shared";
import React, { useMemo, useState, useTransition } from "react";
import { PasswordField } from "./password-field";

type PasswordResetFormArgs = {
  readonly token: string;
  readonly minPasswordLength?: number;
  readonly maxPasswordLength?: number;
};

function isValidPassword(input: string, minLength: number = 8, maxLength: number = 128): true | string {
  if (!input) {
    return "Password cannot be empty";
  }

  if (input.length < minLength) {
    return `Password must be at least ${minLength} characters long`;
  }

  if (input.length > maxLength) {
    return `Password cannot be longer than ${maxLength} characters`;
  }

  // Add more password requirements as needed
  return true;
}

export const PasswordResetForm: React.FC<PasswordResetFormArgs> = ({ 
  token,
  minPasswordLength = 8,
  maxPasswordLength = 128
}) => {
  const authClient = useMemo(() => createAuthClient(), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isPending, startTransition] = useTransition();
  const { t } = useTranslation();
  const history = useRouter();
  const { fetchFullUser } = useAuth();
  const {
    config: {
      admin: {
        routes: { login: loginRoute },
      },
      routes: { admin: adminRoute },
    },
  } = useConfig();

  const validatePassword = (value: string, isOnBlur: boolean = false) => {
    if (isOnBlur && !value) {
      setPasswordError("");
      return true;
    }

    const result = isValidPassword(value, minPasswordLength, maxPasswordLength);
    setPasswordError(result === true ? "" : result);
    return result === true;
  };

  const validateConfirmPassword = (value: string, isOnBlur: boolean = false) => {
    if (isOnBlur && !value) {
      setConfirmPasswordError("");
      return true;
    }

    if (!value) {
      setConfirmPasswordError("Confirm password cannot be empty");
      return false;
    }
    if (value !== password) {
      setConfirmPasswordError("Passwords do not match");
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError("");
    setConfirmPasswordError("");
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setConfirmPasswordError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const isPasswordValid = validatePassword(password, false);
    const isConfirmValid = validateConfirmPassword(confirmPassword, false);

    if (!isPasswordValid || !isConfirmValid) return;

    startTransition(async () => {
      try {
        const { data, error } = await authClient.resetPassword({
          newPassword: password,
          token,
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
                path: loginRoute,
              })
            );
          }
          toast.success(t("authentication:passwordResetSuccessfully"));
        }
      } catch (e) {
        toast.error("An unexpected error occurred");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <PasswordField
        id="password"
        label={t("authentication:newPassword")}
        value={password}
        error={passwordError}
        onChange={handlePasswordChange}
        onBlur={(e) => validatePassword(e.target.value, true)}
      />

      <PasswordField
        id="confirm-password"
        label={t("authentication:confirmPassword")}
        value={confirmPassword}
        error={confirmPasswordError}
        onChange={handleConfirmPasswordChange}
        onBlur={(e) => validateConfirmPassword(e.target.value, true)}
      />

      <FormSubmit size="large" disabled={isPending}>
        {isPending ? t("general:loading") : t("authentication:resetPassword")}
      </FormSubmit>
    </form>
  );
};
