import React from "react";
import { AdminViewServerProps } from "payload";
import LogoutView from "../logout";

const LogoutInactivity: React.FC<AdminViewServerProps> = (props) => {
  return <LogoutView inactivity {...props} />;
};

export default LogoutInactivity;
