"use client";

import React, { useState } from "react";
import {
  EmailField,
  Form,
  FormProps,
  FormSubmit,
  TextField,
  toast,
  useConfig,
  useTranslation,
} from "@payloadcms/ui";
import { text, email } from "payload/shared";
import { FormHeader } from "../../components/form-header";
import { FormState, LoginWithUsernameOptions, PayloadRequest } from "payload";

type ForgotPasswordFormProps = {
  loginWithUsername?: false | LoginWithUsernameOptions;
};

const ForgotPasswordClient: React.FC<ForgotPasswordFormProps> = ({
  loginWithUsername,
}) => {
  const { config } = useConfig();
  const {
    admin: { user: userSlug },
    routes: { api },
  } = config;
  const { t } = useTranslation();
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleResponse: FormProps["handleResponse"] = (
    res,
    successToast,
    errorToast
  ) => {
    res
      .json()
      .then(() => {
        setHasSubmitted(true);
        successToast(t("general:submissionSuccessful"));
      })
      .catch(() => {
        errorToast(
          loginWithUsername
            ? t("authentication:usernameNotValid")
            : t("authentication:emailNotValid")
        );
      });
  };

  const initialState: FormState = loginWithUsername
    ? {
        username: {
          initialValue: "",
          valid: true,
          value: undefined,
        },
      }
    : {
        email: {
          initialValue: "",
          valid: true,
          value: undefined,
        },
      };

  if (hasSubmitted) {
    return (
      <FormHeader
        description={t("authentication:checkYourEmailForPasswordReset")}
        heading={t("authentication:emailSent")}
      />
    );
  }

  return (
    <Form
      action={`${api}/${userSlug}/forgot-password`}
      handleResponse={handleResponse}
      initialState={initialState}
      method="POST"
    >
      <FormHeader
        description={
          loginWithUsername
            ? t("authentication:forgotPasswordUsernameInstructions")
            : t("authentication:forgotPasswordEmailInstructions")
        }
        heading={t("authentication:forgotPassword")}
      />
      {loginWithUsername ? (
        <TextField
          field={{
            name: "username",
            label: t("authentication:username"),
            required: true,
          }}
          path="username"
          validate={(value) =>
            text(value, {
              name: "username",
              type: "text",
              blockData: {},
              data: {},
              event: "onChange",
              path: ["username"],
              preferences: { fields: {} },
              req: {
                payload: {
                  config,
                },
                t,
              } as unknown as PayloadRequest,
              required: true,
              siblingData: {},
            })
          }
        />
      ) : (
        <EmailField
          field={{
            name: "email",
            admin: {
              autoComplete: "email",
              placeholder: "Email",
            },
            label: t("general:email"),
            required: true,
          }}
          path="email"
          validate={(value) =>
            email(value, {
              name: "email",
              type: "email",
              blockData: {},
              data: {},
              event: "onChange",
              path: ["email"],
              preferences: { fields: {} },
              req: { payload: { config }, t } as unknown as PayloadRequest,
              required: true,
              siblingData: {},
            })
          }
        />
      )}
      <FormSubmit size="large">{t("general:submit")}</FormSubmit>
    </Form>
    // <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
    //   <h1>{t("authentication:forgotPassword")}</h1>
    //   <p>{t("authentication:forgotPasswordEmailInstructions")}</p>
    //   <form onSubmit={handleSubmit}>
    //     <div className={`field-type email${emailError ? " error" : ""}`}>
    //       <label className="field-label" htmlFor="field-email">
    //         {t("general:email")}
    //         <span className="required">*</span>
    //       </label>
    //       <div className="field-type__wrap">
    //         {emailError && (
    //           <Tooltip
    //             alignCaret="right"
    //             className="field-error"
    //             delay={0}
    //             staticPositioning
    //           >
    //             {emailError}
    //           </Tooltip>
    //         )}
    //         <input
    //           autoComplete="email"
    //           id="field-email"
    //           placeholder="Email"
    //           onChange={handleEmailChange}
    //           onBlur={(e) => validateEmail(e.target.value)}
    //           type="email"
    //           name="email"
    //           value={email}
    //         />
    //       </div>
    //     </div>

    //   </form>
    // </div>
  );
};

export { ForgotPasswordClient };
