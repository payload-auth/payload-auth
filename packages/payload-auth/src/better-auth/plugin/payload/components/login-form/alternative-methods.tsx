"use client";

import { Button, toast } from "@payloadcms/ui";
import { Key, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { socialProviders } from "@/better-auth/plugin/constants";
import type { SocialProvider } from "@/better-auth/plugin/types";
import { Icons } from "@/shared/components/icons";
import { isValidEmail } from "@/shared/form/validation";
import { useLoginForm } from "./context";
import "./index.scss";

const baseClass = "login-form-methods";

function MagicLinkButton() {
  const { email, authClient, redirectUrl, showIconOnly } = useLoginForm();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const sentEmailRef = useRef("");

  useEffect(() => {
    if (sent && email !== sentEmailRef.current) {
      setSent(false);
    }
  }, [email, sent]);

  const handleClick = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const { error } = await authClient.signIn.magicLink({
        email,
        callbackURL: redirectUrl
      });
      if (error) {
        toast.error(error.message || "Failed to send magic link");
      } else {
        sentEmailRef.current = email;
        setSent(true);
        toast.success("Magic link sent! Check your email.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

  const label = sent ? "Resend Magic Link" : "Magic Link";

  return (
    <Button
      type="button"
      size="large"
      className={`${baseClass}__button provider--magic-link`}
      onClick={handleClick}
      disabled={loading}
      iconPosition="left"
      icon={<Mail className={`${baseClass}__icon`} />}
      tooltip={showIconOnly ? "Sign in with Magic Link" : undefined}
    >
      {!showIconOnly && <span>{loading ? "Sending..." : label}</span>}
    </Button>
  );
}

interface PasskeyButtonProps {
  setLoading: (loading: boolean) => void;
}

function PasskeyButton({ setLoading }: PasskeyButtonProps) {
  const router = useRouter();
  const { authClient, redirectUrl, showIconOnly } = useLoginForm();

  const handleClick = async () => {
    setLoading(true);
    try {
      await authClient.signIn.passkey({
        fetchOptions: {
          onSuccess() {
            if (redirectUrl) router.push(redirectUrl);
          },
          onError(context: any) {
            toast.error(
              context.error.message || "Failed to sign in with passkey"
            );
          }
        }
      });
    } catch (error: any) {
      toast.error(error?.message || "Failed to sign in with passkey");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      size="large"
      className={`${baseClass}__button provider--passkey`}
      onClick={handleClick}
      iconPosition="left"
      icon={<Key className={`${baseClass}__icon`} />}
      tooltip={showIconOnly ? "Sign in with Passkey" : undefined}
    >
      {!showIconOnly && <span>Passkey</span>}
    </Button>
  );
}

interface SocialButtonProps {
  provider: SocialProvider;
  setLoading: (loading: boolean) => void;
}

function SocialButton({ provider, setLoading }: SocialButtonProps) {
  const {
    authClient,
    redirectUrl,
    isSignup,
    showIconOnly,
    adminInviteToken,
    newUserCallbackURL
  } = useLoginForm();
  const Icon = Icons[provider as keyof typeof Icons] ?? null;
  const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);

  const handleClick = async () => {
    setLoading(true);
    try {
      const { error } = await authClient.signIn.social({
        provider,
        fetchOptions: {
          query: {
            ...(isSignup && { adminInviteToken })
          }
        },
        errorCallbackURL: window.location.href,
        callbackURL: redirectUrl,
        newUserCallbackURL,
        ...(isSignup && { requestSignUp: true })
      });
      if (error) {
        toast.error(error.message);
      }
    } catch {
      toast.error(`Failed to sign in with ${providerName}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      size="large"
      className={`${baseClass}__button provider--${provider}`}
      onClick={handleClick}
      iconPosition="left"
      icon={Icon ? <Icon className={`${baseClass}__icon`} /> : undefined}
      tooltip={showIconOnly ? `Sign in with ${providerName}` : undefined}
    >
      {!showIconOnly && <span>{providerName}</span>}
    </Button>
  );
}

export function AlternativeMethods() {
  const { alternativeMethods, hasMethod, isSignup, showIconOnly } =
    useLoginForm();
  const [_, setLoading] = useState(false);

  if (alternativeMethods.length === 0) return null;

  return (
    <>
      {hasMethod("emailPassword") && (
        <div className={`${baseClass}__divider`}>
          <span>Or {isSignup ? "sign up" : "login"} with</span>
        </div>
      )}
      <div
        className={`${baseClass} ${baseClass}--count-${showIconOnly ? "many" : alternativeMethods.length}`}
      >
        {alternativeMethods.map((method) => {
          if (method === "passkey") {
            if (isSignup) return null;
            return <PasskeyButton key={method} setLoading={setLoading} />;
          }

          if (method === "magicLink") {
            if (isSignup) return null;
            return <MagicLinkButton key={method} />;
          }

          if (socialProviders.includes(method as SocialProvider)) {
            return (
              <SocialButton
                key={method}
                provider={method as SocialProvider}
                setLoading={setLoading}
              />
            );
          }

          return null;
        })}
      </div>
    </>
  );
}
