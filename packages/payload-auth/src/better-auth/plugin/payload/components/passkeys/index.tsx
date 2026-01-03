import React from "react";
import { PasskeysClient } from "./client";
import "./index.scss";
import type { PasskeysServerComponentProps, PasskeyWithId } from "./types";

export async function Passkeys({ ...props }: PasskeysServerComponentProps) {
  const {
    id,
    passkeySlug,
    payload,
    passkeyUserIdFieldName,
    req,
    user,
    pluginOptions
  } = props;

  if (!id || !passkeySlug || !passkeyUserIdFieldName) return null;

  const { docs: userPasskeys } = (await payload.find({
    collection: passkeySlug,
    where: {
      [passkeyUserIdFieldName]: { equals: id }
    },
    limit: 100,
    req,
    depth: 0
  })) as unknown as { docs: PasskeyWithId[] };

  return (
    <div className="passkeys-field">
      <h3 className="passkeys-field__title" style={{ marginBottom: "0.7rem" }}>
        Passkeys
      </h3>
      <PasskeysClient
        initialPasskeys={userPasskeys}
        documentId={id}
        currentUserId={user?.id}
        passkeySlug={passkeySlug}
        passkeyUserIdFieldName={passkeyUserIdFieldName}
        baseURL={pluginOptions.betterAuthOptions?.baseURL}
        basePath={pluginOptions.betterAuthOptions?.basePath}
      />
    </div>
  );
}
