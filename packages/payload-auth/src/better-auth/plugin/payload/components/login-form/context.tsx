"use client";

import { passkeyClient } from "@better-auth/passkey/client";
import {
  magicLinkClient,
  twoFactorClient,
  usernameClient
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useMemo, useState } from "react";
import { adminRoutes } from "@/better-auth/plugin/constants";
import type { LoginMethod } from "@/better-auth/plugin/types";

interface LoginFormContextValue {
  loginMethods: LoginMethod[];
  email: string;
  setEmail: (email: string) => void;
  redirectUrl: string;
  isSignup: boolean;
  authClient: any;
  loginType: "email" | "username" | "emailOrUsername";
  hasMethod: (method: LoginMethod) => boolean;
  alternativeMethods: LoginMethod[];
  showIconOnly: boolean;
  adminInviteToken?: string;
  newUserCallbackURL?: string;
  prefill: {
    email?: string;
    password?: string;
    username?: string;
  };
}

const LoginFormContext = createContext<LoginFormContextValue | null>(null);

type Prefill = {
  email?: string;
  password?: string;
  username?: string;
};

type Plugins = {
  username?: boolean;
  passkey?: boolean;
  magicLink?: boolean;
};

type LoginIdentifier = "email" | "username";

export interface LoginFormProviderProps {
  children: React.ReactNode;
  loginMethods: LoginMethod[];
  redirectUrl: string;
  baseURL?: string;
  basePath?: string;
  isSignup?: boolean;
  loginIdentifiers: LoginIdentifier[];
  plugins?: Plugins;
  prefill?: Prefill;
  adminInviteToken?: string;
  newUserCallbackURL?: string;
}

export function LoginFormProvider({
  children,
  loginMethods,
  redirectUrl,
  baseURL,
  basePath,
  isSignup = false,
  loginIdentifiers,
  plugins,
  prefill,
  adminInviteToken,
  newUserCallbackURL
}: LoginFormProviderProps) {
  const {
    username: hasUsernamePlugin = false,
    passkey: hasPasskeyPlugin = false,
    magicLink: hasMagicLinkPlugin = false
  } = plugins ?? {};
  const resolvedPrefill: Prefill = prefill ?? {};

  const router = useRouter();
  const [email, setEmail] = useState(resolvedPrefill.email ?? "");

  const authClient = useMemo(
    () =>
      createAuthClient({
        baseURL,
        basePath,
        plugins: [
          usernameClient(),
          twoFactorClient({
            onTwoFactorRedirect() {
              router.push(
                `${redirectUrl.split("?")[0]}${adminRoutes.twoFactorVerify}?redirect=${redirectUrl}`
              );
            }
          }),
          ...(hasPasskeyPlugin ? [passkeyClient()] : []),
          ...(hasMagicLinkPlugin || loginMethods.includes("magicLink")
            ? [magicLinkClient()]
            : [])
        ]
      }),
    [
      baseURL,
      basePath,
      hasMagicLinkPlugin,
      hasPasskeyPlugin,
      loginMethods,
      redirectUrl,
      router
    ]
  );

  const canLoginWithEmail = loginIdentifiers.includes("email");
  const canLoginWithUsername = loginIdentifiers.includes("username");

  const loginType = useMemo(() => {
    if (canLoginWithEmail && canLoginWithUsername && hasUsernamePlugin)
      return "emailOrUsername";
    if (canLoginWithUsername && hasUsernamePlugin) return "username";
    return "email";
  }, [canLoginWithEmail, canLoginWithUsername, hasUsernamePlugin]);

  const hasMethod = (method: LoginMethod) => loginMethods.includes(method);
  const alternativeMethods = useMemo(
    () =>
      loginMethods.filter((m) => {
        if (m === "emailPassword") return false;
        if (isSignup && (m === "passkey" || m === "magicLink")) return false;
        return true;
      }),
    [loginMethods, isSignup]
  );
  const showIconOnly = alternativeMethods.length >= 3;

  const value: LoginFormContextValue = {
    loginMethods,
    email,
    setEmail,
    redirectUrl,
    isSignup,
    authClient,
    loginType,
    hasMethod,
    alternativeMethods,
    showIconOnly,
    adminInviteToken,
    newUserCallbackURL,
    prefill: {
      email: resolvedPrefill.email,
      password: resolvedPrefill.password,
      username: resolvedPrefill.username
    }
  };

  return (
    <LoginFormContext.Provider value={value}>
      {children}
    </LoginFormContext.Provider>
  );
}

export const useLoginForm = () => {
  const context = useContext(LoginFormContext);
  if (!context) {
    throw new Error("useLoginForm must be used within a LoginFormProvider");
  }
  return context;
};
