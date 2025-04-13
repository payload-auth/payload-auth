import { Tooltip } from "@payloadcms/ui/elements/Tooltip";
import React, { ComponentPropsWithoutRef } from "react";

type PasswordFieldProps = ComponentPropsWithoutRef<"input"> & {
  label: string;
  error?: string;
};

export const PasswordField: React.FC<PasswordFieldProps> = ({
  id,
  label,
  placeholder,
  value,
  error,
  onChange,
  onBlur,
  autoComplete = "new-password",
}) => {
  return (
    <div className={`field-type password${error ? " error" : ""}`}>
      <label className="field-label" htmlFor={id}>
        {label}<span className="required">*</span>
      </label>
      <div className="field-type__wrap">
        {error && (
          <Tooltip
            alignCaret="right"
            className="field-error"
            delay={0}
            staticPositioning
          >
            {error}
          </Tooltip>
        )}
        <input
          autoComplete={autoComplete}
          id={id}
          placeholder={placeholder || label}
          onChange={onChange}
          onBlur={onBlur}
          type="password"
          name={id}
          value={value}
        />
      </div>
    </div>
  );
}; 