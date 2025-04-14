"use client";

import React, { useCallback } from "react";
import {
  ConfirmPasswordField,
  PasswordField,
  Form,
  FormSubmit,
  HiddenField,
  useAuth,
  useConfig,
  useTranslation,
} from "@payloadcms/ui";
import { useRouter } from "next/navigation.js";
import { formatAdminURL } from "payload/shared";
import { FormState } from "payload";

type PasswordResetFormArgs = {
  readonly token: string;
};

const initialState: FormState = {
  "confirm-password": {
    initialValue: "",
    valid: false,
    value: "",
  },
  password: {
    initialValue: "",
    valid: false,
    value: "",
  },
};

export const PasswordResetClient: React.FC<PasswordResetFormArgs> = ({
  token,
}) => {
  const { t } = useTranslation();
  const {
    config: {
      serverURL,
      admin: {
        user: userSlug,
        routes: { login: loginRoute },
      },
      routes: { admin: adminRoute, api: apiRoute },
    },
  } = useConfig();
  const history = useRouter();
  const { fetchFullUser } = useAuth();
  const onSuccess = useCallback(async () => {
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
  }, [adminRoute, fetchFullUser, history, loginRoute]);

  return (
    <Form
      action={`${serverURL}${apiRoute}/${userSlug}/reset-password`}
      initialState={initialState}
      method="POST"
      onSuccess={onSuccess}
    >
      <div className="inputWrap">
        <PasswordField
          field={{
            name: "password",
            label: t("authentication:newPassword"),
            required: true,
          }}
          path="password"
        />
        <ConfirmPasswordField />
        <HiddenField path="token" value={token} />
      </div>

      <FormSubmit size="large">{t("authentication:resetPassword")}</FormSubmit>
    </Form>
  );
};
