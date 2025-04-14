import type { FieldHook } from "payload";

export const getUrlBeforeChangeHook = () => {
  const hook: FieldHook = ({ siblingData }) => {
    delete siblingData["url"];
  };
  return hook;
};
