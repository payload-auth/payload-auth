"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  socialProviders,
  type AuthLocalization,
  type AuthView,
  type SocialProvider,
} from "@daveyplate/better-auth-ui";
import { PasswordInput } from "@daveyplate/better-auth-ui";
import { useIsRestoring } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// import type { AuthLocalization } from "../../lib/auth-localization";
// import { AuthUIContext } from "../../lib/auth-ui-provider";
// import type { AuthView } from "../../lib/auth-view-paths";
// import { PasswordInput } from "../password-input";
// import { ActionButton } from "./action-button";
// import { MagicLinkButton } from "./magic-link-button";
// import { PasskeyButton } from "./passkey-button";
// import { ProviderButton } from "./provider-button";

export type AuthFormClassNames = {
  base?: string;
  actionButton?: string;
  forgotPasswordLink?: string;
  input?: string;
  label?: string;
  description?: string;
  providerButton?: string;
  secondaryButton?: string;
};

export function AuthForm({
  className,
  classNames,
  callbackURL,
  localization,
  pathname,
  redirectTo,
  socialLayout = "auto",
  view,
}: {
  className?: string;
  classNames?: AuthFormClassNames;
  callbackURL?: string;
  localization?: Partial<AuthLocalization>;
  pathname?: string;
  redirectTo?: string;
  socialLayout?: "auto" | "horizontal" | "grid" | "vertical";
  view?: AuthView;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const isRestoring = useIsRestoring();
  const signingOut = useRef(false);
  const isRedirecting = useRef(false);
  const checkingResetPasswordToken = useRef(false);
  const router = useRouter();

  const formAction = async (formData: FormData) => {
    const provider = formData.get("provider") as SocialProvider;

    if (provider) {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL,
      });
      if (error) {
        toast.error(error.message || error.statusText);
      } else {
        setIsLoading(true);
      }

      return;
    }

    if (formData.get("passkey")) {
      const response = await authClient.signIn.passkey();

      if (response?.error) {
        toast.error(response.error.message || response.error.statusText);
      } else {
        setIsLoading(true);
        // await onSessionChange?.();
        redirectTo && router.push(redirectTo);
      }

      return;
    }

    let email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") || ("" as string);

    switch (view) {
      case "signIn": {
        const params = {
          password,
          rememberMe: formData.has("rememberMe"),
        };

        const { error } = await authClient.signIn.email({
          callbackURL: "/admin",
          email,
          ...params,
        });
        if (error) {
          toast.error(error.message || error.statusText);
        } else {
          setIsLoading(true);
          redirectTo && router.push(redirectTo);
        }

        break;
      }

      //   case "magicLink": {
      //     const { error } = await authClient.signIn.magicLink({
      //       email,
      //       callbackURL: getCallbackURL(),
      //     });

      //     if (error) {
      //       toast.error(error.message || error.statusText);
      //     } else {
      //       toast.success(localization.magicLinkEmail);
      //     }

      //     break;
      //   }

      //   case "signUp": {
      //     const params = {
      //       email,
      //       password,
      //       name,
      //       callbackURL: getCallbackURL(),
      //     } as Record<string, unknown>;

      //     if (usernamePlugin) {
      //       params.username = formData.get("username");
      //     }

      //     signUpFields?.map((field: string) => {
      //       if (field === "name") return;

      //       const additionalField = additionalFields?.[field];
      //       if (!additionalField) return;

      //       if (formData.has(field)) {
      //         const value = formData.get(field) as string;

      //         if (additionalField.validate && !additionalField.validate(value)) {
      //           toast.error(`${localization.failedToValidate} ${field}`);
      //           return;
      //         }

      //         params[field] =
      //           additionalField.type === "number"
      //             ? Number.parseFloat(value)
      //             : additionalField.type === "boolean"
      //               ? value === "on"
      //               : value;
      //       }
      //     });

      //     const { data, error } = await authClient.signUp.email(params);

      //     if (error) {
      //       toast.error(error.message || error.statusText);
      //     } else if (data.token) {
      //       setIsLoading(true);
      //       await onSessionChange?.();
      //       navigate(getRedirectTo());
      //     } else {
      //       navigate(viewPaths.signIn);
      //       toast.success(localization.signUpEmail);
      //     }

      //     break;
      //   }

      //   case "forgotPassword": {
      //     const { error } = await authClient.forgetPassword({
      //       email: email,
      //       redirectTo: window.location.pathname.replace(
      //         viewPaths.forgotPassword,
      //         viewPaths.resetPassword
      //       ),
      //     });

      //     if (error) {
      //       toast.error(error.message || error.statusText);
      //     } else {
      //       toast.success(localization.forgotPasswordEmail);
      //       navigate(viewPaths.signIn);
      //     }

      //     break;
      //   }

      //   case "resetPassword": {
      //     const searchParams = new URLSearchParams(window.location.search);
      //     const token = searchParams.get("token") as string;

      //     const { error } = await authClient.resetPassword({
      //       newPassword: password,
      //       token,
      //     });

      //     if (error) {
      //       toast.error(error.message || error.statusText);
      //     } else {
      //       toast.success(localization.resetPasswordSuccess);
      //       navigate(viewPaths.signIn);
      //     }

      //     break;
      //   }
    }
  };

  useEffect(() => {
    if (view !== "signOut") {
      signingOut.current = false;
    }

    if (view !== "callback") {
      isRedirecting.current = false;
    }
  }, [view]);

  //   useEffect(() => {
  //     if (view !== "signOut" || signingOut.current) return;

  //     signingOut.current = true;
  //     authClient.signOut().finally(async () => {
  //       replace(viewPaths.signIn);
  //       onSessionChange?.();
  //     });
  //   }, [view, authClient, replace, viewPaths.signIn, onSessionChange]);

  //   useEffect(() => {
  //     if (view !== "resetPassword" || checkingResetPasswordToken.current) return;

  //     checkingResetPasswordToken.current = true;

  //     const searchParams = new URLSearchParams(window.location.search);
  //     const token = searchParams.get("token");
  //     if (!token || token === "INVALID_TOKEN") {
  //       navigate(viewPaths.signIn);
  //       setTimeout(() => {
  //         toast.error(localization.resetPasswordInvalidToken);
  //         checkingResetPasswordToken.current = false;
  //       }, 100);
  //     }
  //   }, [view, viewPaths, navigate, localization]);

  //   useEffect(() => {
  //     if (view === "magicLink" && !magicLink) {
  //       navigate(viewPaths.signIn);
  //     }

  //     if (
  //       ["signUp", "forgotPassword", "resetPassword"].includes(view) &&
  //       !credentials
  //     ) {
  //       navigate(viewPaths.signIn);
  //     }
  //   }, [view, viewPaths, credentials, navigate, magicLink]);

  //   useEffect(() => {
  //     if (view !== "callback" || isRedirecting.current) return;

  //     if (!persistClient) {
  //       replace(getRedirectTo());
  //       return;
  //     }

  //     if (isRestoring) return;

  //     isRedirecting.current = true;

  //     const doRedirect = async () => {
  //       await onSessionChange?.();
  //       replace(getRedirectTo());
  //     };

  //     doRedirect();
  //   }, [
  //     isRestoring,
  //     view,
  //     replace,
  //     persistClient,
  //     getRedirectTo,
  //     onSessionChange,
  //   ]);

  if (["signOut", "callback"].includes(view || ""))
    return <Loader2 className="animate-spin" />;

  return (
    <form
      action={formAction}
      className={cn("twp grid w-full gap-4", className, classNames?.base)}
    >
      {/* <div className="grid gap-2">
        <Label className={classNames?.label} htmlFor="name">
          {localization.name}
        </Label>

        <Input
          className={classNames?.input}
          id="name"
          name="name"
          placeholder={localization.namePlaceholder}
          required={true}
        />
      </div> */}

      <div className="grid gap-2">
        <Label className={classNames?.label} htmlFor="email">
          Email
        </Label>

        <Input
          className={classNames?.input}
          id="email"
          name="email"
          placeholder={localization?.emailPlaceholder}
          required
          type="email"
        />
      </div>

      <div className="grid gap-2">
        <div className="flex items-center">
          <Label className={classNames?.label} htmlFor="password">
            Password
          </Label>

          {view === "signIn" && (
            <Link
              className={cn(
                "-my-1 ml-auto inline-block text-sm hover:underline",
                classNames?.forgotPasswordLink
              )}
              href="/admin/forgot-password"
            >
              Forgot password?
            </Link>
          )}
        </div>

        <PasswordInput
          id="password"
          name="password"
          autoComplete={
            ["signUp", "resetPassword"].includes(view || "")
              ? "new-password"
              : "password"
          }
          className={classNames?.input}
          enableToggle={view !== "signIn"}
          placeholder={"Password"}
          required
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="rememberMe" name="rememberMe" />

        <Label htmlFor="rememberMe">Remember me</Label>
      </div>

      <div
        className={cn(
          "flex w-full items-center gap-2",
          "justify-between",
          socialLayout === "horizontal" && "flex-wrap",
          socialLayout === "vertical" && "flex-col",
          socialLayout === "grid" && "grid grid-cols-2"
        )}
      >
        {["google"]?.map((provider) => {
          const socialProvider = socialProviders.find(
            (socialProvider) => socialProvider.provider === provider
          );
          if (!socialProvider) return null;

          return (
            <Button
              key={provider}
              className={cn(
                socialLayout === "vertical" ? "w-full" : "grow",
                "cursor-pointer"
              )}
              disabled={isLoading}
              formNoValidate
              name="provider"
              value={socialProvider.provider}
              variant="outline"
            >
              <>
                <socialProvider.icon className="dark:hidden size-4" color />
                <socialProvider.icon className="hidden dark:block size-4" />
              </>

              {socialLayout === "grid" && <>{socialProvider.name}</>}

              {socialLayout === "vertical" && (
                <>
                  {localization?.signInWith} {socialProvider.name}
                </>
              )}
            </Button>
          );
        })}
      </div>

      {/* {view === "signUp" &&
        signUpFields
          ?.filter((field) => field !== "name")
          .map((field) => {
            const additionalField = additionalFields?.[field];

            if (!additionalField) {
              console.error(`Invalid additional field: ${field}`);
              return null;
            }

            return additionalField.type === "boolean" ? (
              <div key={field} className="flex items-center gap-2">
                <Checkbox
                  id={field}
                  name={field}
                  required={additionalField.required}
                />

                <Label className={cn(classNames?.label)} htmlFor={field}>
                  {additionalField?.label}
                </Label>
              </div>
            ) : (
              <div key={field} className="grid gap-2">
                <Label className={classNames?.label} htmlFor={field}>
                  {additionalField?.label}
                </Label>

                <Input
                  className={classNames?.input}
                  id={field}
                  name={field}
                  placeholder={
                    additionalField?.placeholder ||
                    (typeof additionalField?.label === "string"
                      ? additionalField?.label
                      : "")
                  }
                  required={additionalField?.required}
                  type={additionalField?.type === "number" ? "number" : "text"}
                />
              </div>
            );
          })} */}

      {/* {(credentials ||
        (["signIn", "magicLink"].includes(view) && magicLink)) && (
        <ActionButton
          authView={view}
          className={classNames?.actionButton}
          isLoading={isLoading}
          localization={localization}
        />
      )} */}

      {/* {magicLink && credentials && view !== "resetPassword" && (
        <MagicLinkButton
          className={classNames?.secondaryButton}
          isLoading={isLoading}
          localization={localization}
          view={view}
        />
      )} */}

      {/* {!["forgotPassword", "resetPassword"].includes(view) &&
        providers?.length && (
          
        )} */}

      {/* {passkey && (
        <PasskeyButton
          className={classNames?.secondaryButton}
          isLoading={isLoading}
          localization={localization}
        />
      )} */}
    </form>
  );
}
