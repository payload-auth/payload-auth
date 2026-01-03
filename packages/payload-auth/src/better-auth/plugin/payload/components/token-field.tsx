"use client";

import { Button, TextInput, useField, useFormFields } from "@payloadcms/ui";
import { TextFieldClientProps } from "payload";

function AdminInviteTokenField({ ...props }: TextFieldClientProps) {
  const { path } = props;
  const { setValue } = useField({ path });
  const token = useFormFields(([fields]) => fields.token);
  const value = (token.value as string) ?? "";

  return (
    <div>
      <Button onClick={() => setValue(crypto.randomUUID())}>
        Generate Token
      </Button>
      <TextInput
        path={path}
        readOnly
        label="Token"
        placeholder="Click 'Generate Token' to create a token"
        value={value}
      />
    </div>
  );
}

export default AdminInviteTokenField;
