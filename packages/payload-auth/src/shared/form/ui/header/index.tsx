import React from "react";

import "./index.scss";

const baseClass = "form-header";

interface Props extends React.ComponentProps<"div"> {
  description?: React.ReactNode | string;
  heading: string;
}

export function FormHeader({ description, heading, ...props }: Props) {
  if (!heading) {
    return null;
  }

  return (
    <div className={baseClass} {...props}>
      <h1>{heading}</h1>
      {Boolean(description) && <p>{description}</p>}
    </div>
  );
}
