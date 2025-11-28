'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import "./index.css";
import { Button, useField } from "@payloadcms/ui";
import { useRef } from "react";
export const GenerateUuidButton = ({ path })=>{
    const { setValue } = useField({
        path
    });
    const buttonRef = useRef(null);
    const handleGenerate = ()=>{
        setValue(crypto.randomUUID());
    };
    return /*#__PURE__*/ _jsx("div", {
        className: "generate-uuid-button-wrapper",
        children: /*#__PURE__*/ _jsx(Button, {
            ref: buttonRef,
            buttonStyle: "primary",
            onClick: handleGenerate,
            className: "generate-uuid-button",
            children: "Generate UUID"
        })
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zaGFyZWQvcGF5bG9hZC9maWVsZHMvZ2VuZXJhdGUtdXVpZC1idXR0b24vaW5kZXgudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIid1c2UgY2xpZW50J1xuXG5pbXBvcnQgJy4vaW5kZXguY3NzJ1xuaW1wb3J0IHsgQnV0dG9uLCBUZXh0RmllbGQsIHVzZUZpZWxkIH0gZnJvbSAnQHBheWxvYWRjbXMvdWknXG5pbXBvcnQgeyB1c2VSZWYgfSBmcm9tICdyZWFjdCdcblxuZXhwb3J0IGNvbnN0IEdlbmVyYXRlVXVpZEJ1dHRvbjogdHlwZW9mIFRleHRGaWVsZCA9ICh7IHBhdGggfSkgPT4ge1xuICBjb25zdCB7IHNldFZhbHVlIH0gPSB1c2VGaWVsZCh7IHBhdGggfSlcbiAgY29uc3QgYnV0dG9uUmVmID0gdXNlUmVmPEhUTUxCdXR0b25FbGVtZW50PihudWxsKVxuXG4gIGNvbnN0IGhhbmRsZUdlbmVyYXRlID0gKCkgPT4ge1xuICAgIHNldFZhbHVlKGNyeXB0by5yYW5kb21VVUlEKCkpXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZ2VuZXJhdGUtdXVpZC1idXR0b24td3JhcHBlclwiPlxuICAgICAgPEJ1dHRvbiByZWY9e2J1dHRvblJlZn0gYnV0dG9uU3R5bGU9XCJwcmltYXJ5XCIgb25DbGljaz17aGFuZGxlR2VuZXJhdGV9IGNsYXNzTmFtZT1cImdlbmVyYXRlLXV1aWQtYnV0dG9uXCI+XG4gICAgICAgIEdlbmVyYXRlIFVVSURcbiAgICAgIDwvQnV0dG9uPlxuICAgIDwvZGl2PlxuICApXG59XG4iXSwibmFtZXMiOlsiQnV0dG9uIiwidXNlRmllbGQiLCJ1c2VSZWYiLCJHZW5lcmF0ZVV1aWRCdXR0b24iLCJwYXRoIiwic2V0VmFsdWUiLCJidXR0b25SZWYiLCJoYW5kbGVHZW5lcmF0ZSIsImNyeXB0byIsInJhbmRvbVVVSUQiLCJkaXYiLCJjbGFzc05hbWUiLCJyZWYiLCJidXR0b25TdHlsZSIsIm9uQ2xpY2siXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBLE9BQU8sY0FBYTtBQUNwQixTQUFTQSxNQUFNLEVBQWFDLFFBQVEsUUFBUSxpQkFBZ0I7QUFDNUQsU0FBU0MsTUFBTSxRQUFRLFFBQU87QUFFOUIsT0FBTyxNQUFNQyxxQkFBdUMsQ0FBQyxFQUFFQyxJQUFJLEVBQUU7SUFDM0QsTUFBTSxFQUFFQyxRQUFRLEVBQUUsR0FBR0osU0FBUztRQUFFRztJQUFLO0lBQ3JDLE1BQU1FLFlBQVlKLE9BQTBCO0lBRTVDLE1BQU1LLGlCQUFpQjtRQUNyQkYsU0FBU0csT0FBT0MsVUFBVTtJQUM1QjtJQUVBLHFCQUNFLEtBQUNDO1FBQUlDLFdBQVU7a0JBQ2IsY0FBQSxLQUFDWDtZQUFPWSxLQUFLTjtZQUFXTyxhQUFZO1lBQVVDLFNBQVNQO1lBQWdCSSxXQUFVO3NCQUF1Qjs7O0FBSzlHLEVBQUMifQ==