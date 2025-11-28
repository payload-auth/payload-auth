import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { useFormContext } from "..";
import { FormSubmit } from "@payloadcms/ui";
export const Submit = ({ label, loadingLabel })=>{
    const form = useFormContext();
    return /*#__PURE__*/ _jsx(form.Subscribe, {
        selector: (state)=>[
                state.canSubmit,
                state.isSubmitting
            ],
        children: ([canSubmit, isSubmitting])=>/*#__PURE__*/ _jsx(FormSubmit, {
                buttonStyle: "primary",
                type: "button",
                onClick: ()=>form.handleSubmit(),
                size: "large",
                disabled: !canSubmit,
                children: isSubmitting ? loadingLabel : label
            })
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zaGFyZWQvZm9ybS9jb21wb25lbnRzL3N1Ym1pdC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgdXNlRm9ybUNvbnRleHQgfSBmcm9tICcuLidcbmltcG9ydCB7IEZvcm1TdWJtaXQgfSBmcm9tICdAcGF5bG9hZGNtcy91aSdcblxudHlwZSBTdWJtaXRQcm9wcyA9IHtcbiAgbGFiZWw6IHN0cmluZ1xuICBsb2FkaW5nTGFiZWw6IHN0cmluZ1xufVxuXG5leHBvcnQgY29uc3QgU3VibWl0OiBSZWFjdC5GQzxTdWJtaXRQcm9wcz4gPSAoeyBsYWJlbCwgbG9hZGluZ0xhYmVsIH0pID0+IHtcbiAgY29uc3QgZm9ybSA9IHVzZUZvcm1Db250ZXh0KClcblxuICByZXR1cm4gKFxuICAgIDxmb3JtLlN1YnNjcmliZVxuICAgICAgc2VsZWN0b3I9eyhzdGF0ZSkgPT4gW3N0YXRlLmNhblN1Ym1pdCwgc3RhdGUuaXNTdWJtaXR0aW5nXX1cbiAgICAgIGNoaWxkcmVuPXsoW2NhblN1Ym1pdCwgaXNTdWJtaXR0aW5nXSkgPT4gKFxuICAgICAgICA8Rm9ybVN1Ym1pdCBidXR0b25TdHlsZT1cInByaW1hcnlcIiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gZm9ybS5oYW5kbGVTdWJtaXQoKX0gc2l6ZT1cImxhcmdlXCIgZGlzYWJsZWQ9eyFjYW5TdWJtaXR9PlxuICAgICAgICAgIHtpc1N1Ym1pdHRpbmcgPyBsb2FkaW5nTGFiZWwgOiBsYWJlbH1cbiAgICAgICAgPC9Gb3JtU3VibWl0PlxuICAgICAgKX1cbiAgICAvPlxuICApXG59XG4iXSwibmFtZXMiOlsiUmVhY3QiLCJ1c2VGb3JtQ29udGV4dCIsIkZvcm1TdWJtaXQiLCJTdWJtaXQiLCJsYWJlbCIsImxvYWRpbmdMYWJlbCIsImZvcm0iLCJTdWJzY3JpYmUiLCJzZWxlY3RvciIsInN0YXRlIiwiY2FuU3VibWl0IiwiaXNTdWJtaXR0aW5nIiwiY2hpbGRyZW4iLCJidXR0b25TdHlsZSIsInR5cGUiLCJvbkNsaWNrIiwiaGFuZGxlU3VibWl0Iiwic2l6ZSIsImRpc2FibGVkIl0sIm1hcHBpbmdzIjoiO0FBQUEsT0FBT0EsV0FBVyxRQUFPO0FBQ3pCLFNBQVNDLGNBQWMsUUFBUSxLQUFJO0FBQ25DLFNBQVNDLFVBQVUsUUFBUSxpQkFBZ0I7QUFPM0MsT0FBTyxNQUFNQyxTQUFnQyxDQUFDLEVBQUVDLEtBQUssRUFBRUMsWUFBWSxFQUFFO0lBQ25FLE1BQU1DLE9BQU9MO0lBRWIscUJBQ0UsS0FBQ0ssS0FBS0MsU0FBUztRQUNiQyxVQUFVLENBQUNDLFFBQVU7Z0JBQUNBLE1BQU1DLFNBQVM7Z0JBQUVELE1BQU1FLFlBQVk7YUFBQztRQUMxREMsVUFBVSxDQUFDLENBQUNGLFdBQVdDLGFBQWEsaUJBQ2xDLEtBQUNUO2dCQUFXVyxhQUFZO2dCQUFVQyxNQUFLO2dCQUFTQyxTQUFTLElBQU1ULEtBQUtVLFlBQVk7Z0JBQUlDLE1BQUs7Z0JBQVFDLFVBQVUsQ0FBQ1I7MEJBQ3pHQyxlQUFlTixlQUFlRDs7O0FBS3pDLEVBQUMifQ==