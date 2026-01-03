"use client";

import React from "react";
import { Fingerprint, Trash } from "lucide-react";
import { Button } from "@payloadcms/ui";
import type { PasskeyWithId } from "./types";

interface PasskeyListProps {
  passkeys: PasskeyWithId[];
  onDelete?: (id: string) => void;
}

export function PasskeyList({ passkeys, onDelete }: PasskeyListProps) {
  if (passkeys.length === 0)
    return <p style={{ marginBottom: "1rem" }}>No passkeys found.</p>;

  return (
    <ul className="passkeys-field__list">
      {passkeys.map((pk) => {
        const { id, createdAt } = pk;
        if (!id || !createdAt) return null;
        return (
          <li key={id} className="passkeys-field__list-item">
            <Fingerprint size={16} />
            <span>{pk.name || "My Passkey"}</span>
            <span className="passkeys-field__list-item-date"> - </span>
            <span className="passkeys-field__list-item-date">
              {new Date(createdAt).toLocaleString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true
              })}
            </span>
            {onDelete && (
              <Button
                buttonStyle="none"
                size="small"
                className="passkeys-field__delete-button"
                onClick={() => onDelete(id)}
              >
                <Trash size={16} />
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
