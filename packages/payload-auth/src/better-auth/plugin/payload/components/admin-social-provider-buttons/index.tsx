"use client";

import React, { useMemo } from "react";
import { Icons } from "../icons";
import { Key } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, toast } from "@payloadcms/ui";
import { createAuthClient } from "better-auth/react";
import type { SocialProviders } from "../../../../types";
import { passkeyClient } from "better-auth/client/plugins";

import "./index.scss";

type AdminSocialProviderButtonsProps = {
  allowSignup: boolean;
  socialProviders: SocialProviders;
  setLoading: (loading: boolean) => void;
  hasPasskeySupport?: boolean;
  redirectUrl?: string;
  newUserCallbackURL?: string;
};

const baseClass = "admin-social-provider-buttons";

const AdminSocialProviderButtons: React.FC<AdminSocialProviderButtonsProps> = ({
  allowSignup,
  socialProviders,
  setLoading,
  hasPasskeySupport,
  redirectUrl,
  newUserCallbackURL,
}) => {
  const router = useRouter();
  const authClient = useMemo(
    () => createAuthClient({ plugins: [passkeyClient()] }),
    []
  );
  const providers = Object.keys(socialProviders ?? {}) as Array<
    keyof SocialProviders
  >;
  const providerCount = providers.length;
  // const redirectUrl = getSafeRedirect(searchParams?.redirect ?? "", adminRoute);
  // const newUserCallbackURL = `${config.serverURL}${config.routes.api}/${config.admin.user}/set-admin-role?role=${adminRole}&token=${token}&redirect=${redirectUrl}`;

  const renderProviderButton = (
    provider: keyof SocialProviders,
    showIconOnly: boolean
  ) => {
    const providerConfig = socialProviders?.[provider];
    const Icon = Icons[provider as keyof typeof Icons];
    const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);

    return (
      <Button
        key={provider}
        type="button"
        size="large"
        className={`${baseClass}__button provider--${provider}`}
        onClick={async () => {
          setLoading(true);
          try {
            await authClient.signIn.social({
              provider: provider,
              requestSignUp: allowSignup
                ? true
                : !providerConfig?.disableSignUp,
              callbackURL: redirectUrl,
              newUserCallbackURL: newUserCallbackURL,
            });
          } catch (error: any) {
            toast.error(`Failed to sign in with ${providerName}`);
          } finally {
            setLoading(false);
          }
        }}
        icon={
          showIconOnly ? <Icon className={`${baseClass}__icon`} /> : undefined
        }
        tooltip={showIconOnly ? `Sign in with ${providerName}` : undefined}
      >
        {!showIconOnly && (
          <>
            <Icon className={`${baseClass}__icon`} />{" "}
            <span>{providerName}</span>
          </>
        )}
      </Button>
    );
  };

  if (providerCount === 0 && !hasPasskeySupport) {
    return null;
  }

  const showIconOnly = providerCount >= 3;

  return (
    <div
      className={`${baseClass} ${baseClass}--count-${
        showIconOnly ? "many" : providerCount
      }`}
    >
      {providers.map((provider) =>
        renderProviderButton(provider, showIconOnly)
      )}

      {hasPasskeySupport && !allowSignup && (
        <Button
          type="button"
          size="large"
          className={`${baseClass}__button provider--passkey`}
          onClick={async () => {
            setLoading(true);
            try {
              await authClient.signIn.passkey({
                fetchOptions: {
                  onSuccess() {
                    if (router && redirectUrl) {
                      router.push(redirectUrl);
                    }
                  },
                  onError(context: any) {
                    toast.error(
                      context.error.message || "Failed to sign in with passkey"
                    );
                  },
                },
              });
            } catch (error: any) {
              toast.error(error?.message || "Failed to sign in with passkey");
            } finally {
              setLoading(false);
            }
          }}
        >
          <Key size={16} className={`${baseClass}__icon`} />
          <span>Passkey</span>
        </Button>
      )}
    </div>
  );
};

export default AdminSocialProviderButtons;
