import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import clsx from "clsx";
import { Tooltip } from "@payloadcms/ui/elements/Tooltip";
import "./index.scss";
const FormField = ({ children, hasError, className, ...rest })=>/*#__PURE__*/ _jsx("div", {
        className: clsx('field-type', className, {
            error: hasError
        }),
        ...rest,
        children: children
    });
const FormLabel = ({ label, required = false, className, ...rest })=>/*#__PURE__*/ _jsxs("label", {
        className: clsx('field-label', className),
        ...rest,
        children: [
            label,
            required && /*#__PURE__*/ _jsx("span", {
                className: "required",
                children: "*"
            })
        ]
    });
export const FieldErrors = ({ meta, className })=>{
    if (!meta.isTouched) return null;
    const error = meta.errors.at(0)?.message || null;
    return /*#__PURE__*/ _jsx(Tooltip, {
        alignCaret: "right",
        className: clsx('field-error', className),
        show: !!error,
        delay: 0,
        staticPositioning: true,
        children: error
    });
};
const FormError = ({ errors, className })=>errors ? /*#__PURE__*/ _jsx("div", {
        className: clsx('form-error', className),
        children: errors.join(', ')
    }) : null;
const Form = ({ children, className, ...rest })=>/*#__PURE__*/ _jsx("form", {
        className: clsx('form', className),
        ...rest,
        children: children
    });
const FormInputWrap = ({ children, className, ...rest })=>/*#__PURE__*/ _jsx("div", {
        className: `${className}__inputWrap`,
        ...rest,
        children: children
    });
const FieldInputWrap = ({ children, className, ...rest })=>/*#__PURE__*/ _jsx("div", {
        className: clsx('field-type__wrap', className),
        ...rest,
        children: children
    });
export { FormField, FormLabel, FormError, Form, FormInputWrap, FieldInputWrap };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zaGFyZWQvZm9ybS91aS9pbmRleC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IHR5cGUgQ29tcG9uZW50UHJvcHNXaXRob3V0UmVmLCB0eXBlIFJlYWN0Tm9kZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IGNsc3ggZnJvbSAnY2xzeCdcbmltcG9ydCB0eXBlIHsgQW55RmllbGRNZXRhIH0gZnJvbSAnQHRhbnN0YWNrL3JlYWN0LWZvcm0nXG5pbXBvcnQgeyBUb29sdGlwIH0gZnJvbSAnQHBheWxvYWRjbXMvdWkvZWxlbWVudHMvVG9vbHRpcCdcblxuaW1wb3J0ICcuL2luZGV4LnNjc3MnXG5cbnR5cGUgRm9ybUZpZWxkUHJvcHMgPSBDb21wb25lbnRQcm9wc1dpdGhvdXRSZWY8J2Rpdic+ICYge1xuICBoYXNFcnJvcj86IGJvb2xlYW5cbn1cblxuY29uc3QgRm9ybUZpZWxkOiBSZWFjdC5GQzxGb3JtRmllbGRQcm9wcz4gPSAoeyBjaGlsZHJlbiwgaGFzRXJyb3IsIGNsYXNzTmFtZSwgLi4ucmVzdCB9KSA9PiAoXG4gIDxkaXYgY2xhc3NOYW1lPXtjbHN4KCdmaWVsZC10eXBlJywgY2xhc3NOYW1lLCB7IGVycm9yOiBoYXNFcnJvciB9KX0gey4uLnJlc3R9PlxuICAgIHtjaGlsZHJlbn1cbiAgPC9kaXY+XG4pXG5cbnR5cGUgRm9ybUxhYmVsUHJvcHMgPSBDb21wb25lbnRQcm9wc1dpdGhvdXRSZWY8J2xhYmVsJz4gJiB7XG4gIGxhYmVsOiBSZWFjdE5vZGVcbiAgcmVxdWlyZWQ/OiBib29sZWFuXG59XG5cbmNvbnN0IEZvcm1MYWJlbDogUmVhY3QuRkM8Rm9ybUxhYmVsUHJvcHM+ID0gKHsgbGFiZWwsIHJlcXVpcmVkID0gZmFsc2UsIGNsYXNzTmFtZSwgLi4ucmVzdCB9KSA9PiAoXG4gIDxsYWJlbCBjbGFzc05hbWU9e2Nsc3goJ2ZpZWxkLWxhYmVsJywgY2xhc3NOYW1lKX0gey4uLnJlc3R9PlxuICAgIHtsYWJlbH1cbiAgICB7cmVxdWlyZWQgJiYgPHNwYW4gY2xhc3NOYW1lPVwicmVxdWlyZWRcIj4qPC9zcGFuPn1cbiAgPC9sYWJlbD5cbilcblxudHlwZSBGaWVsZEVycm9yc1Byb3BzID0ge1xuICBtZXRhOiBBbnlGaWVsZE1ldGFcbiAgY2xhc3NOYW1lPzogc3RyaW5nXG59XG5cbmV4cG9ydCBjb25zdCBGaWVsZEVycm9ycyA9ICh7IG1ldGEsIGNsYXNzTmFtZSB9OiBGaWVsZEVycm9yc1Byb3BzKSA9PiB7XG4gIGlmICghbWV0YS5pc1RvdWNoZWQpIHJldHVybiBudWxsXG4gIGNvbnN0IGVycm9yID0gbWV0YS5lcnJvcnMuYXQoMCk/Lm1lc3NhZ2UgfHwgbnVsbFxuXG4gIHJldHVybiAoXG4gICAgPFRvb2x0aXAgYWxpZ25DYXJldD1cInJpZ2h0XCIgY2xhc3NOYW1lPXtjbHN4KCdmaWVsZC1lcnJvcicsIGNsYXNzTmFtZSl9IHNob3c9eyEhZXJyb3J9IGRlbGF5PXswfSBzdGF0aWNQb3NpdGlvbmluZz5cbiAgICAgIHtlcnJvcn1cbiAgICA8L1Rvb2x0aXA+XG4gIClcbn1cblxudHlwZSBGb3JtRXJyb3JQcm9wcyA9IHtcbiAgZXJyb3JzPzogc3RyaW5nW11cbiAgY2xhc3NOYW1lPzogc3RyaW5nXG59XG5cbmNvbnN0IEZvcm1FcnJvcjogUmVhY3QuRkM8Rm9ybUVycm9yUHJvcHM+ID0gKHsgZXJyb3JzLCBjbGFzc05hbWUgfSkgPT5cbiAgZXJyb3JzID8gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtjbHN4KCdmb3JtLWVycm9yJywgY2xhc3NOYW1lKX0+XG4gICAgICB7ZXJyb3JzLmpvaW4oJywgJyl9XG4gICAgPC9kaXY+XG4gICkgOiBudWxsXG5cbnR5cGUgRm9ybVByb3BzID0gQ29tcG9uZW50UHJvcHNXaXRob3V0UmVmPCdmb3JtJz5cblxuY29uc3QgRm9ybTogUmVhY3QuRkM8Rm9ybVByb3BzPiA9ICh7IGNoaWxkcmVuLCBjbGFzc05hbWUsIC4uLnJlc3QgfSkgPT4gKFxuICA8Zm9ybSBjbGFzc05hbWU9e2Nsc3goJ2Zvcm0nLCBjbGFzc05hbWUpfSB7Li4ucmVzdH0+XG4gICAge2NoaWxkcmVufVxuICA8L2Zvcm0+XG4pXG5cbnR5cGUgRm9ybUlucHV0V3JhcFByb3BzID0gQ29tcG9uZW50UHJvcHNXaXRob3V0UmVmPCdkaXYnPlxuXG5jb25zdCBGb3JtSW5wdXRXcmFwOiBSZWFjdC5GQzxGb3JtSW5wdXRXcmFwUHJvcHM+ID0gKHsgY2hpbGRyZW4sIGNsYXNzTmFtZSwgLi4ucmVzdCB9KSA9PiAoXG4gIDxkaXYgY2xhc3NOYW1lPXtgJHtjbGFzc05hbWV9X19pbnB1dFdyYXBgfSB7Li4ucmVzdH0+XG4gICAge2NoaWxkcmVufVxuICA8L2Rpdj5cbilcblxudHlwZSBGaWVsZElucHV0V3JhcFByb3BzID0gQ29tcG9uZW50UHJvcHNXaXRob3V0UmVmPCdkaXYnPlxuXG5jb25zdCBGaWVsZElucHV0V3JhcDogUmVhY3QuRkM8RmllbGRJbnB1dFdyYXBQcm9wcz4gPSAoeyBjaGlsZHJlbiwgY2xhc3NOYW1lLCAuLi5yZXN0IH0pID0+IChcbiAgPGRpdiBjbGFzc05hbWU9e2Nsc3goJ2ZpZWxkLXR5cGVfX3dyYXAnLCBjbGFzc05hbWUpfSB7Li4ucmVzdH0+XG4gICAge2NoaWxkcmVufVxuICA8L2Rpdj5cbilcblxuZXhwb3J0IHR5cGUgeyBGb3JtRmllbGRQcm9wcywgRm9ybUxhYmVsUHJvcHMsIEZvcm1FcnJvclByb3BzLCBGb3JtUHJvcHMsIEZvcm1JbnB1dFdyYXBQcm9wcyB9XG5leHBvcnQgeyBGb3JtRmllbGQsIEZvcm1MYWJlbCwgRm9ybUVycm9yLCBGb3JtLCBGb3JtSW5wdXRXcmFwLCBGaWVsZElucHV0V3JhcCB9XG4iXSwibmFtZXMiOlsiUmVhY3QiLCJjbHN4IiwiVG9vbHRpcCIsIkZvcm1GaWVsZCIsImNoaWxkcmVuIiwiaGFzRXJyb3IiLCJjbGFzc05hbWUiLCJyZXN0IiwiZGl2IiwiZXJyb3IiLCJGb3JtTGFiZWwiLCJsYWJlbCIsInJlcXVpcmVkIiwic3BhbiIsIkZpZWxkRXJyb3JzIiwibWV0YSIsImlzVG91Y2hlZCIsImVycm9ycyIsImF0IiwibWVzc2FnZSIsImFsaWduQ2FyZXQiLCJzaG93IiwiZGVsYXkiLCJzdGF0aWNQb3NpdGlvbmluZyIsIkZvcm1FcnJvciIsImpvaW4iLCJGb3JtIiwiZm9ybSIsIkZvcm1JbnB1dFdyYXAiLCJGaWVsZElucHV0V3JhcCJdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU9BLFdBQThELFFBQU87QUFDNUUsT0FBT0MsVUFBVSxPQUFNO0FBRXZCLFNBQVNDLE9BQU8sUUFBUSxrQ0FBaUM7QUFFekQsT0FBTyxlQUFjO0FBTXJCLE1BQU1DLFlBQXNDLENBQUMsRUFBRUMsUUFBUSxFQUFFQyxRQUFRLEVBQUVDLFNBQVMsRUFBRSxHQUFHQyxNQUFNLGlCQUNyRixLQUFDQztRQUFJRixXQUFXTCxLQUFLLGNBQWNLLFdBQVc7WUFBRUcsT0FBT0o7UUFBUztRQUFLLEdBQUdFLElBQUk7a0JBQ3pFSDs7QUFTTCxNQUFNTSxZQUFzQyxDQUFDLEVBQUVDLEtBQUssRUFBRUMsV0FBVyxLQUFLLEVBQUVOLFNBQVMsRUFBRSxHQUFHQyxNQUFNLGlCQUMxRixNQUFDSTtRQUFNTCxXQUFXTCxLQUFLLGVBQWVLO1FBQWEsR0FBR0MsSUFBSTs7WUFDdkRJO1lBQ0FDLDBCQUFZLEtBQUNDO2dCQUFLUCxXQUFVOzBCQUFXOzs7O0FBUzVDLE9BQU8sTUFBTVEsY0FBYyxDQUFDLEVBQUVDLElBQUksRUFBRVQsU0FBUyxFQUFvQjtJQUMvRCxJQUFJLENBQUNTLEtBQUtDLFNBQVMsRUFBRSxPQUFPO0lBQzVCLE1BQU1QLFFBQVFNLEtBQUtFLE1BQU0sQ0FBQ0MsRUFBRSxDQUFDLElBQUlDLFdBQVc7SUFFNUMscUJBQ0UsS0FBQ2pCO1FBQVFrQixZQUFXO1FBQVFkLFdBQVdMLEtBQUssZUFBZUs7UUFBWWUsTUFBTSxDQUFDLENBQUNaO1FBQU9hLE9BQU87UUFBR0MsaUJBQWlCO2tCQUM5R2Q7O0FBR1AsRUFBQztBQU9ELE1BQU1lLFlBQXNDLENBQUMsRUFBRVAsTUFBTSxFQUFFWCxTQUFTLEVBQUUsR0FDaEVXLHVCQUNFLEtBQUNUO1FBQUlGLFdBQVdMLEtBQUssY0FBY0s7a0JBQ2hDVyxPQUFPUSxJQUFJLENBQUM7U0FFYjtBQUlOLE1BQU1DLE9BQTRCLENBQUMsRUFBRXRCLFFBQVEsRUFBRUUsU0FBUyxFQUFFLEdBQUdDLE1BQU0saUJBQ2pFLEtBQUNvQjtRQUFLckIsV0FBV0wsS0FBSyxRQUFRSztRQUFhLEdBQUdDLElBQUk7a0JBQy9DSDs7QUFNTCxNQUFNd0IsZ0JBQThDLENBQUMsRUFBRXhCLFFBQVEsRUFBRUUsU0FBUyxFQUFFLEdBQUdDLE1BQU0saUJBQ25GLEtBQUNDO1FBQUlGLFdBQVcsR0FBR0EsVUFBVSxXQUFXLENBQUM7UUFBRyxHQUFHQyxJQUFJO2tCQUNoREg7O0FBTUwsTUFBTXlCLGlCQUFnRCxDQUFDLEVBQUV6QixRQUFRLEVBQUVFLFNBQVMsRUFBRSxHQUFHQyxNQUFNLGlCQUNyRixLQUFDQztRQUFJRixXQUFXTCxLQUFLLG9CQUFvQks7UUFBYSxHQUFHQyxJQUFJO2tCQUMxREg7O0FBS0wsU0FBU0QsU0FBUyxFQUFFTyxTQUFTLEVBQUVjLFNBQVMsRUFBRUUsSUFBSSxFQUFFRSxhQUFhLEVBQUVDLGNBQWMsR0FBRSJ9