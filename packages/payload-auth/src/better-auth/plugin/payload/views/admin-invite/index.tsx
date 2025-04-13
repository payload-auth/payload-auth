import React from "react";
import { AdminViewServerProps } from "payload";
import { BetterAuthPluginOptions } from "../../../types";
import { SanitizedBetterAuthOptions } from "../../../types";
import { AcceptInviteClient } from "./client";
import { z } from "zod";
import { checkUsernamePlugin } from "../../../helpers/check-username-plugin";

const inviteSchema = z.object({
  token: z.string(),
});

type AcceptInviteViewProps = AdminViewServerProps & {
  pluginOptions: BetterAuthPluginOptions;
  betterAuthOptions: SanitizedBetterAuthOptions;
};

const AcceptInviteView: React.FC<AcceptInviteViewProps> = async ({
  payload,
  initPageResult,
  params,
  searchParams,
  pluginOptions,
  betterAuthOptions,
}) => {
  const {
    req,
    req: {
      payload: {
        collections,
        config: {
          admin: { user: userSlug },
          routes: { admin },
        },
      },
    },
  } = initPageResult;
  // verify the token and get the invite role
  const { success, data } = inviteSchema.safeParse(searchParams);
  if (!success) {
    return (
      <section className="accept-invite-view login template-minimal template-minimal--width-normal">
        <div className="template-minimal__wrap">
          <h1>Invalid token</h1>
        </div>
      </section>
    );
  }
  const invite = await payload.find({
    collection: pluginOptions.adminInvitations?.slug ?? "admin-invitations",
    where: {
      token: {
        equals: data.token,
      },
    },
    limit: 1,
  });
  if (invite.docs.length === 0) {
    return (
      <section className="accept-invite-view login template-minimal template-minimal--width-normal">
        <div className="template-minimal__wrap">
          <h1>Invalid token</h1>
        </div>
      </section>
    );
  }

  const collectionConfig = collections?.[userSlug]?.config;
  const { auth: authOptions } = collectionConfig;
  const hasUsernamePlugin = checkUsernamePlugin(betterAuthOptions);
  const loginWithUsername = authOptions.loginWithUsername;
  const canLoginWithUsername =
    (hasUsernamePlugin && loginWithUsername) ?? false;

  const inviteRole = invite.docs[0].role as string;
  const socialProviders = pluginOptions.adminComponents?.socialProviders ?? {};

  return (
    <section className="accept-invite-view login template-minimal template-minimal--width-normal">
      <div className="template-minimal__wrap">
        <h1>{req.t("general:welcome")}</h1>
        <AcceptInviteClient
          token={data.token}
          role={inviteRole}
          socialProviders={socialProviders}
          userSlug={userSlug}
          searchParams={searchParams}
          loginWithUsername={canLoginWithUsername}
        />
      </div>
    </section>
  );
};

export default AcceptInviteView;
