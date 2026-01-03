import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { Submit } from "./components/submit";
import { TextField } from "./fields/text-field";

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField
  },
  formComponents: {
    Submit
  }
});

export {
  fieldContext,
  formContext,
  useAppForm,
  useFieldContext,
  useFormContext,
  withForm
};
