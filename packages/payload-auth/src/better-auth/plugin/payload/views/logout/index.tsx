import React from "react";
import type { AdminViewServerProps } from "payload";
import { LogoutClient } from "./client";

import "./index.scss";

const baseClass = "logout";

const LogoutView: React.FC<
  {
    inactivity?: boolean;
  } & AdminViewServerProps
> = ({ inactivity, initPageResult, searchParams }) => {
  const {
    req: {
      payload: {
        config: {
          routes: { admin: adminRoute },
        },
      },
    },
  } = initPageResult;

  return (
    <div className={`${baseClass}`}>
      CUSTOM LOGOUT
      {/* <LogoutClient
        adminRoute={adminRoute}
        inactivity={inactivity}
        redirect={searchParams?.redirect as string}
      /> */}
    </div>
  );
};

export default LogoutView;
