"use client";
import React, { useEffect, useState } from "react";
import type { FormProps, UserWithToken } from "@payloadcms/ui";
import type {
  DocumentPreferences,
  FormState,
  LoginWithUsernameOptions,
  Params,
  SanitizedDocumentPermissions,
} from "payload";
import {
  ConfirmPasswordField,
  EmailAndUsernameFields,
  Form,
  FormSubmit,
  PasswordField,
  RenderFields,
  useAuth,
  useConfig,
  useServerFunctions,
  useTranslation,
} from "@payloadcms/ui";
import { abortAndIgnore } from "@payloadcms/ui/shared";

import AdminSocialProviderButtons from "../../components/admin-social-provider-buttons";
import { SocialProviders } from "../../../types";
import { getSafeRedirect } from "../../utils/get-safe-redirect";

export const AcceptInviteClient: React.FC<{
  role: string;
  socialProviders: SocialProviders;
  loginWithUsername?: false | LoginWithUsernameOptions;
  userSlug: string;
  token: string;
  searchParams: Params | undefined;
}> = ({
  loginWithUsername,
  userSlug,
  socialProviders,
  role,
  token,
  searchParams,
}) => {
  const {
    config: {
      routes: { admin: adminRoute, api: apiRoute },
      serverURL,
    },
    getEntityConfig,
  } = useConfig();

  const { getFormState } = useServerFunctions();
  const [loading, setLoading] = useState(false);

  const { t } = useTranslation();
  const { setUser } = useAuth();

  const abortOnChangeRef = React.useRef<AbortController>(null);

  const collectionConfig = getEntityConfig({ collectionSlug: userSlug });

  const handleSignup = (data: any) => {
    setUser(data);
  };

  useEffect(() => {
    const abortOnChange = abortOnChangeRef.current;

    return () => {
      abortAndIgnore(abortOnChange ?? new AbortController());
    };
  }, []);

  const redirectUrl = getSafeRedirect(
    searchParams?.redirect as string,
    adminRoute
  );
  const newUserCallbackURL = `${serverURL}${apiRoute}/${userSlug}/set-admin-role?role=${role}&token=${token}&redirect=${redirectUrl}`;

  return (
    <div>
      <Form
        action={`${serverURL}${apiRoute}/${userSlug}/signup?token=${token}&role=${role}&redirect=${redirectUrl}`}
        method="POST"
        onSuccess={handleSignup}
        redirect={redirectUrl}
      >
        <EmailAndUsernameFields
          className="emailAndUsername"
          loginWithUsername={loginWithUsername}
          operation="create"
          readOnly={false}
          t={t as any}
        />
        <PasswordField
          autoComplete="off"
          field={{
            name: "password",
            label: t("authentication:newPassword"),
            required: true,
          }}
          path="password"
        />
        <ConfirmPasswordField />
        <FormSubmit size="large">{t("general:create")}</FormSubmit>
      </Form>
      <AdminSocialProviderButtons
        allowSignup={true}
        hasPasskeySupport={false}
        socialProviders={socialProviders}
        setLoading={setLoading}
        redirectUrl={redirectUrl}
        newUserCallbackURL={newUserCallbackURL}
      />
    </div>
  );
};
