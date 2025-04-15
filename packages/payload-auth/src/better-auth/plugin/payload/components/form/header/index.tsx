import React, { type ComponentPropsWithoutRef } from "react";

import "./index.scss";

const baseClass = "form-header";

type Props = ComponentPropsWithoutRef<'div'> & {
  description?: React.ReactNode | string;
  heading: string;
};

const FormHeader: React.FC<Props> = ({ description, heading, ...props }) => {
  if (!heading) {
    return null;
  }

  return (
    <div className={baseClass} {...props}>
      <h1>{heading}</h1>
      {Boolean(description) && <p>{description}</p>}
    </div>
  );
};

export { FormHeader };
