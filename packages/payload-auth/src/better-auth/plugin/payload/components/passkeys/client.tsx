"use client";

import { useConfig } from "@payloadcms/ui";
import { useCallback, useEffect, useState } from "react";
import { PassKeyAddButton } from "./add-button";
import { PasskeyList } from "./list";
import type { PasskeysClientComponentProps, PasskeyWithId } from "./types";

export function PasskeysClient({
  initialPasskeys,
  documentId,
  currentUserId,
  passkeySlug,
  passkeyUserIdFieldName,
  baseURL,
  basePath
}: PasskeysClientComponentProps) {
  const {
    config: {
      routes: { api: apiRoute }
    }
  } = useConfig();

  const [passkeys, setPasskeys] = useState<PasskeyWithId[]>(initialPasskeys);

  const fetchPasskeys = useCallback(async () => {
    const url = `${apiRoute}/${passkeySlug}?where[${passkeyUserIdFieldName}][equals]=${documentId}`;
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) return;
    const data = (await res.json()) as { docs: PasskeyWithId[] };
    setPasskeys(data.docs);
  }, [apiRoute, passkeySlug, passkeyUserIdFieldName, documentId]);

  useEffect(() => {
    void fetchPasskeys();
  }, [fetchPasskeys]);

  const handleDelete = useCallback(
    async (id: string) => {
      const res = await fetch(`${apiRoute}/${passkeySlug}/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) return;
      void fetchPasskeys();
    },
    [apiRoute, passkeySlug, fetchPasskeys]
  );

  const handleAdd = useCallback(() => {
    void fetchPasskeys();
  }, [fetchPasskeys]);

  return (
    <>
      <PasskeyList passkeys={passkeys} onDelete={handleDelete} />
      {currentUserId === documentId && (
        <PassKeyAddButton
          onAdd={handleAdd}
          baseURL={baseURL}
          basePath={basePath}
        />
      )}
    </>
  );
}
