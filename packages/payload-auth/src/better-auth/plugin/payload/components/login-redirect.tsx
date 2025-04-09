import React from "react";
import { redirect } from "next/navigation";

const LoginRedirect: React.FC = () => {
  redirect("/admin/login");
};

export default LoginRedirect;
