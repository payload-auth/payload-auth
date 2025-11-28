import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useStore } from "@tanstack/react-form";
import { useFieldContext } from "../index";
import { FieldErrors, FieldInputWrap, FormField, FormLabel } from "../ui";
export function TextField({ className, label, required = false, type = 'text', autoComplete = 'off' }) {
    const field = useFieldContext();
    const meta = useStore(field.store, (state)=>state.meta);
    const hasError = meta.isTouched && meta.errors.length > 0;
    return /*#__PURE__*/ _jsxs(FormField, {
        id: field.name,
        className: className,
        hasError: hasError,
        children: [
            /*#__PURE__*/ _jsx(FormLabel, {
                label: label,
                htmlFor: field.name,
                required: required
            }),
            /*#__PURE__*/ _jsxs(FieldInputWrap, {
                children: [
                    /*#__PURE__*/ _jsx("input", {
                        autoComplete: autoComplete,
                        type: type,
                        id: field.name,
                        name: field.name,
                        value: field.state.value,
                        onChange: (e)=>field.handleChange(e.target.value),
                        onBlur: field.handleBlur,
                        required: required,
                        className: "text-field"
                    }),
                    /*#__PURE__*/ _jsx(FieldErrors, {
                        meta: meta
                    })
                ]
            })
        ]
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zaGFyZWQvZm9ybS9maWVsZHMvdGV4dC1maWVsZC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlU3RvcmUgfSBmcm9tICdAdGFuc3RhY2svcmVhY3QtZm9ybSdcbmltcG9ydCB7IHVzZUZpZWxkQ29udGV4dCB9IGZyb20gJy4uL2luZGV4J1xuaW1wb3J0IHsgRmllbGRFcnJvcnMsIEZpZWxkSW5wdXRXcmFwLCBGb3JtRmllbGQsIEZvcm1MYWJlbCB9IGZyb20gJy4uL3VpJ1xuXG5leHBvcnQgZnVuY3Rpb24gVGV4dEZpZWxkKHtcbiAgY2xhc3NOYW1lLFxuICBsYWJlbCxcbiAgcmVxdWlyZWQgPSBmYWxzZSxcbiAgdHlwZSA9ICd0ZXh0JyxcbiAgYXV0b0NvbXBsZXRlID0gJ29mZidcbn06IHtcbiAgY2xhc3NOYW1lOiBzdHJpbmdcbiAgbGFiZWw6IHN0cmluZ1xuICByZXF1aXJlZD86IGJvb2xlYW5cbiAgdHlwZT86IHN0cmluZ1xuICBhdXRvQ29tcGxldGU/OiBzdHJpbmdcbn0pIHtcbiAgY29uc3QgZmllbGQgPSB1c2VGaWVsZENvbnRleHQ8c3RyaW5nPigpXG4gIGNvbnN0IG1ldGEgPSB1c2VTdG9yZShmaWVsZC5zdG9yZSwgKHN0YXRlKSA9PiBzdGF0ZS5tZXRhKVxuXG4gIGNvbnN0IGhhc0Vycm9yID0gbWV0YS5pc1RvdWNoZWQgJiYgbWV0YS5lcnJvcnMubGVuZ3RoID4gMFxuXG4gIHJldHVybiAoXG4gICAgPEZvcm1GaWVsZCBpZD17ZmllbGQubmFtZX0gY2xhc3NOYW1lPXtjbGFzc05hbWV9IGhhc0Vycm9yPXtoYXNFcnJvcn0+XG4gICAgICA8Rm9ybUxhYmVsIGxhYmVsPXtsYWJlbH0gaHRtbEZvcj17ZmllbGQubmFtZX0gcmVxdWlyZWQ9e3JlcXVpcmVkfSAvPlxuICAgICAgPEZpZWxkSW5wdXRXcmFwPlxuICAgICAgICA8aW5wdXRcbiAgICAgICAgICBhdXRvQ29tcGxldGU9e2F1dG9Db21wbGV0ZX1cbiAgICAgICAgICB0eXBlPXt0eXBlfVxuICAgICAgICAgIGlkPXtmaWVsZC5uYW1lfVxuICAgICAgICAgIG5hbWU9e2ZpZWxkLm5hbWV9XG4gICAgICAgICAgdmFsdWU9e2ZpZWxkLnN0YXRlLnZhbHVlfVxuICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gZmllbGQuaGFuZGxlQ2hhbmdlKGUudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICBvbkJsdXI9e2ZpZWxkLmhhbmRsZUJsdXJ9XG4gICAgICAgICAgcmVxdWlyZWQ9e3JlcXVpcmVkfVxuICAgICAgICAgIGNsYXNzTmFtZT1cInRleHQtZmllbGRcIlxuICAgICAgICAvPlxuICAgICAgICA8RmllbGRFcnJvcnMgbWV0YT17bWV0YX0gLz5cbiAgICAgIDwvRmllbGRJbnB1dFdyYXA+XG4gICAgPC9Gb3JtRmllbGQ+XG4gIClcbn1cbiJdLCJuYW1lcyI6WyJ1c2VTdG9yZSIsInVzZUZpZWxkQ29udGV4dCIsIkZpZWxkRXJyb3JzIiwiRmllbGRJbnB1dFdyYXAiLCJGb3JtRmllbGQiLCJGb3JtTGFiZWwiLCJUZXh0RmllbGQiLCJjbGFzc05hbWUiLCJsYWJlbCIsInJlcXVpcmVkIiwidHlwZSIsImF1dG9Db21wbGV0ZSIsImZpZWxkIiwibWV0YSIsInN0b3JlIiwic3RhdGUiLCJoYXNFcnJvciIsImlzVG91Y2hlZCIsImVycm9ycyIsImxlbmd0aCIsImlkIiwibmFtZSIsImh0bWxGb3IiLCJpbnB1dCIsInZhbHVlIiwib25DaGFuZ2UiLCJlIiwiaGFuZGxlQ2hhbmdlIiwidGFyZ2V0Iiwib25CbHVyIiwiaGFuZGxlQmx1ciJdLCJtYXBwaW5ncyI6IjtBQUFBLFNBQVNBLFFBQVEsUUFBUSx1QkFBc0I7QUFDL0MsU0FBU0MsZUFBZSxRQUFRLFdBQVU7QUFDMUMsU0FBU0MsV0FBVyxFQUFFQyxjQUFjLEVBQUVDLFNBQVMsRUFBRUMsU0FBUyxRQUFRLFFBQU87QUFFekUsT0FBTyxTQUFTQyxVQUFVLEVBQ3hCQyxTQUFTLEVBQ1RDLEtBQUssRUFDTEMsV0FBVyxLQUFLLEVBQ2hCQyxPQUFPLE1BQU0sRUFDYkMsZUFBZSxLQUFLLEVBT3JCO0lBQ0MsTUFBTUMsUUFBUVg7SUFDZCxNQUFNWSxPQUFPYixTQUFTWSxNQUFNRSxLQUFLLEVBQUUsQ0FBQ0MsUUFBVUEsTUFBTUYsSUFBSTtJQUV4RCxNQUFNRyxXQUFXSCxLQUFLSSxTQUFTLElBQUlKLEtBQUtLLE1BQU0sQ0FBQ0MsTUFBTSxHQUFHO0lBRXhELHFCQUNFLE1BQUNmO1FBQVVnQixJQUFJUixNQUFNUyxJQUFJO1FBQUVkLFdBQVdBO1FBQVdTLFVBQVVBOzswQkFDekQsS0FBQ1g7Z0JBQVVHLE9BQU9BO2dCQUFPYyxTQUFTVixNQUFNUyxJQUFJO2dCQUFFWixVQUFVQTs7MEJBQ3hELE1BQUNOOztrQ0FDQyxLQUFDb0I7d0JBQ0NaLGNBQWNBO3dCQUNkRCxNQUFNQTt3QkFDTlUsSUFBSVIsTUFBTVMsSUFBSTt3QkFDZEEsTUFBTVQsTUFBTVMsSUFBSTt3QkFDaEJHLE9BQU9aLE1BQU1HLEtBQUssQ0FBQ1MsS0FBSzt3QkFDeEJDLFVBQVUsQ0FBQ0MsSUFBTWQsTUFBTWUsWUFBWSxDQUFDRCxFQUFFRSxNQUFNLENBQUNKLEtBQUs7d0JBQ2xESyxRQUFRakIsTUFBTWtCLFVBQVU7d0JBQ3hCckIsVUFBVUE7d0JBQ1ZGLFdBQVU7O2tDQUVaLEtBQUNMO3dCQUFZVyxNQUFNQTs7Ozs7O0FBSTNCIn0=