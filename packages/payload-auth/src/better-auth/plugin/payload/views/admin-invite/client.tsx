"use client";

import React, { useEffect, useState } from "react";
import type { LoginWithUsernameOptions, Params } from "payload";
import {
  ConfirmPasswordField,
  EmailAndUsernameFields,
  Form,
  FormSubmit,
  PasswordField,
  useAuth,
  useConfig,
  useTranslation,
} from "@payloadcms/ui";
import { abortAndIgnore } from "@payloadcms/ui/shared";
import AdminSocialProviderButtons from "../../components/admin-social-provider-buttons";
import { SocialProviders } from "../../../types";
import { getSafeRedirect } from "../../utils/get-safe-redirect";
import { useRouter } from "next/navigation";
import { toast } from "@payloadcms/ui";

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
  } = useConfig();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [requireEmailVerification, setRequireEmailVerification] =
    useState<boolean>(false);
  const { t } = useTranslation();
  const { setUser } = useAuth();

  const abortOnChangeRef = React.useRef<AbortController>(null);

  const handleSignup = (data: any) => {
    setUser(data);
  };

  useEffect(() => {
    const abortOnChange = abortOnChangeRef.current;

    return () => {
      abortAndIgnore(abortOnChange ?? new AbortController());
    };
  }, []);

  const handleResponse = (res: Response) => {
    res.json().then((json: any) => {
      if (json.requireEmailVerification) {
        setRequireEmailVerification(true);
        toast.message(json.message);
      } else {
        toast.success(json.message);
        router.push(redirectUrl);
      }
    });
  };

  const redirectUrl = getSafeRedirect(
    searchParams?.redirect as string,
    adminRoute
  );
  const newUserCallbackURL = `${serverURL}${apiRoute}/${userSlug}/set-admin-role?role=${role}&token=${token}&redirect=${redirectUrl}`;

  return (
    <div>
      {requireEmailVerification ? (
        <h1 className={`email-verification-required`}>
          Please verify your email to login. Check your email for a verification
          link.
        </h1>
      ) : (
        <>
          <h1>{t("general:welcome")}</h1>
          <Form
            action={`${serverURL}${apiRoute}/${userSlug}/signup?token=${token}&role=${role}&redirect=${redirectUrl}`}
            method="POST"
            onSuccess={handleSignup}
            handleResponse={handleResponse}
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
        </>
      )}
    </div>
  );
};
