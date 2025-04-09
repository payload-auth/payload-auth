import { Button, toast, useConfig } from "@payloadcms/ui";
import { createAuthClient } from "better-auth/react";
import React, { useMemo } from "react";
import type { SocialProviders } from "../../../../types";
import { Icons } from "../../components/ui/icons";
import { Key } from "lucide-react";
import { getSafeRedirect } from "../../utils/get-safe-redirect";
import { useRouter } from "next/navigation";

import "./style.scss";
import { passkeyClient } from "better-auth/client/plugins";

type AdminSocialProviderButtonsProps = {
  isFirstAdmin: boolean;
  socialProviders: SocialProviders;
  setLoading: (loading: boolean) => void;
  searchParams?: { [key: string]: string | string[] | undefined };
  defaultAdminRole?: string;
};

const baseClass = "admin-social-provider-buttons";

export const AdminSocialProviderButtons: React.FC<
  AdminSocialProviderButtonsProps
> = ({
  isFirstAdmin,
  socialProviders,
  setLoading,
  searchParams,
  defaultAdminRole,
}) => {
  const { config } = useConfig();
  const router = useRouter();
  const adminRoute = config?.routes?.admin;
  const authClient = useMemo(
    () => createAuthClient({ plugins: [passkeyClient()] }),
    []
  );

  const providers = Object.keys(socialProviders ?? {}) as Array<
    keyof SocialProviders
  >;
  const providerCount = providers.length;

  const hasPasskeySupport = "passkey" in authClient.signIn;

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
            await authClient.signIn.social(
              {
                provider: provider,
                requestSignUp: isFirstAdmin
                  ? true
                  : providerConfig?.disableSignUp === undefined
                    ? false
                    : !providerConfig.disableSignUp,
                newUserCallbackURL: `http://localhost:3000/api/${config.admin.user}/set-first-admin`,
              },
              {
                onSuccess: async (context) => {
                  console.log(context);
                  const data = context.data;
                  if (isFirstAdmin) {
                    const user =
                      typeof data === "object" && "user" in data
                        ? data.user
                        : null;
                    if (user && user.id) {
                      console.log("user", user);
                      try {
                        // Update the first user to have admin role
                        const response = await fetch(
                          `${process.env.NEXT_PUBLIC_API_URL}/api/${config.admin.user}/${user.id}`,
                          {
                            method: "PATCH",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              overrideAccess: true,
                              role: defaultAdminRole,
                            }),
                          }
                        );

                        console.log(response);

                        if (!response.ok) {
                          console.error(
                            "Failed to set admin role for the first user"
                          );
                        }
                      } catch (error) {
                        console.error("Error setting admin role:", error);
                      }
                    }
                    const callbackURL = getSafeRedirect(
                      searchParams?.redirect as string,
                      adminRoute
                    );
                    router.push(callbackURL);
                  } else {
                    const callbackURL = getSafeRedirect(
                      searchParams?.redirect as string,
                      adminRoute
                    );
                    router.push(callbackURL);
                  }
                },
              }
            );

            // console.log(data);

            // if (error) {
            //   toast.error(`Failed to sign in with ${providerName}`);
            // } else if (data) {
            //
            // }
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
        {!showIconOnly && <span>{providerName}</span>}
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

      {hasPasskeySupport && !isFirstAdmin && (
        <Button
          type="button"
          size="large"
          className={`${baseClass}__button provider--passkey`}
          onClick={async () => {
            setLoading(true);
            try {
              await (authClient.signIn as any).passkey({
                fetchOptions: {
                  onSuccess() {
                    // Only redirect if router is available
                    if (router && searchParams) {
                      router.push(
                        getSafeRedirect(
                          searchParams?.redirect as string,
                          adminRoute
                        )
                      );
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
