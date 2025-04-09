"use client";
import React, { useEffect, useState } from "react";
import type { FormProps, UserWithToken } from "@payloadcms/ui";
import type {
  DocumentPreferences,
  FormState,
  LoginWithUsernameOptions,
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
import { abortAndIgnore, handleAbortRef } from "@payloadcms/ui/shared";

import { AdminSocialProviderButtons } from "../../components/admin-social-provider-buttons";
import { SocialProviders } from "../../../types";
export const CreateFirstUserClient: React.FC<{
  //   docPermissions: SanitizedDocumentPermissions;
  //   docPreferences: DocumentPreferences;
  //   initialState: FormState;
  defaultAdminRole: string;
  socialProviders: SocialProviders;
  searchParams: { [key: string]: string | string[] | undefined };
  loginWithUsername?: false | LoginWithUsernameOptions;
  userSlug: string;
}> = ({
  //   docPermissions,
  //   docPreferences,
  //   initialState,
  loginWithUsername,
  defaultAdminRole,
  userSlug,
  socialProviders,
  searchParams,
}) => {
  const {
    config: {
      routes: { admin, api: apiRoute },
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

  const handleFirstRegister = (data: any) => {
    setUser(data);
  };

  useEffect(() => {
    const abortOnChange = abortOnChangeRef.current;

    return () => {
      abortAndIgnore(abortOnChange ?? new AbortController());
    };
  }, []);

  return (
    <div>
      <Form
        action={`${serverURL}${apiRoute}/${userSlug}/first-register`}
        initialState={{}}
        method="POST"
        onSuccess={handleFirstRegister}
        redirect={admin}
        validationOperation="create"
      >
        <EmailAndUsernameFields
          className="emailAndUsername"
          loginWithUsername={loginWithUsername}
          operation="create"
          readOnly={false}
          t={t as any}
          // t={t}
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
        defaultAdminRole={defaultAdminRole}
        isFirstAdmin={true}
        socialProviders={socialProviders}
        setLoading={setLoading}
        searchParams={searchParams}
      />
    </div>
  );
};
