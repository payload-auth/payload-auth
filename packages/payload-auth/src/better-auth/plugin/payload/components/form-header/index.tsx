import React from "react";

import "./index.scss";

const baseClass = "form-header";

type Props = {
  description?: React.ReactNode | string;
  heading: string;
};

const FormHeader: React.FC<Props> = ({ description, heading }) => {
  if (!heading) {
    return null;
  }

  return (
    <div className={baseClass}>
      <h1>{heading}</h1>
      {Boolean(description) && <p>{description}</p>}
    </div>
  );
};

export { FormHeader };
