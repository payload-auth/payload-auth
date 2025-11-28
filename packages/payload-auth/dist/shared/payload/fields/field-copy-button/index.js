'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import "./index.css";
import { Button, CopyIcon, useField } from "@payloadcms/ui";
import { useRef, useState } from "react";
export const FieldCopyButton = ({ path })=>{
    const { value } = useField({
        path
    });
    const [copied, setCopied] = useState(false);
    const buttonRef = useRef(null);
    const handleCopy = ()=>{
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(()=>{
            setCopied(false);
        }, 2000);
    };
    return /*#__PURE__*/ _jsxs("div", {
        className: "field-copy-text__button-wrapper",
        children: [
            /*#__PURE__*/ _jsx("div", {
                className: "field-copy-text__tooltip",
                "data-visible": copied,
                children: "Copied"
            }),
            /*#__PURE__*/ _jsx(Button, {
                ref: buttonRef,
                icon: /*#__PURE__*/ _jsx(CopyIcon, {}),
                buttonStyle: "transparent",
                onClick: handleCopy,
                className: "field-copy-text__button"
            })
        ]
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zaGFyZWQvcGF5bG9hZC9maWVsZHMvZmllbGQtY29weS1idXR0b24vaW5kZXgudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIid1c2UgY2xpZW50J1xuaW1wb3J0ICcuL2luZGV4LmNzcydcbmltcG9ydCB7IEJ1dHRvbiwgQ29weUljb24sIFRleHRGaWVsZCwgdXNlRmllbGQgfSBmcm9tICdAcGF5bG9hZGNtcy91aSdcbmltcG9ydCB7IHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcblxuZXhwb3J0IGNvbnN0IEZpZWxkQ29weUJ1dHRvbjogdHlwZW9mIFRleHRGaWVsZCA9ICh7IHBhdGggfSkgPT4ge1xuICBjb25zdCB7IHZhbHVlIH0gPSB1c2VGaWVsZCh7IHBhdGggfSlcbiAgY29uc3QgW2NvcGllZCwgc2V0Q29waWVkXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBidXR0b25SZWYgPSB1c2VSZWY8SFRNTEJ1dHRvbkVsZW1lbnQ+KG51bGwpXG5cbiAgY29uc3QgaGFuZGxlQ29weSA9ICgpID0+IHtcbiAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh2YWx1ZSBhcyBzdHJpbmcpXG4gICAgc2V0Q29waWVkKHRydWUpXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBzZXRDb3BpZWQoZmFsc2UpXG4gICAgfSwgMjAwMClcbiAgfVxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZmllbGQtY29weS10ZXh0X19idXR0b24td3JhcHBlclwiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJmaWVsZC1jb3B5LXRleHRfX3Rvb2x0aXBcIiBkYXRhLXZpc2libGU9e2NvcGllZH0+XG4gICAgICAgIENvcGllZFxuICAgICAgPC9kaXY+XG4gICAgICA8QnV0dG9uIHJlZj17YnV0dG9uUmVmfSBpY29uPXs8Q29weUljb24gLz59IGJ1dHRvblN0eWxlPVwidHJhbnNwYXJlbnRcIiBvbkNsaWNrPXtoYW5kbGVDb3B5fSBjbGFzc05hbWU9XCJmaWVsZC1jb3B5LXRleHRfX2J1dHRvblwiIC8+XG4gICAgPC9kaXY+XG4gIClcbn1cbiJdLCJuYW1lcyI6WyJCdXR0b24iLCJDb3B5SWNvbiIsInVzZUZpZWxkIiwidXNlUmVmIiwidXNlU3RhdGUiLCJGaWVsZENvcHlCdXR0b24iLCJwYXRoIiwidmFsdWUiLCJjb3BpZWQiLCJzZXRDb3BpZWQiLCJidXR0b25SZWYiLCJoYW5kbGVDb3B5IiwibmF2aWdhdG9yIiwiY2xpcGJvYXJkIiwid3JpdGVUZXh0Iiwic2V0VGltZW91dCIsImRpdiIsImNsYXNzTmFtZSIsImRhdGEtdmlzaWJsZSIsInJlZiIsImljb24iLCJidXR0b25TdHlsZSIsIm9uQ2xpY2siXSwibWFwcGluZ3MiOiJBQUFBOztBQUNBLE9BQU8sY0FBYTtBQUNwQixTQUFTQSxNQUFNLEVBQUVDLFFBQVEsRUFBYUMsUUFBUSxRQUFRLGlCQUFnQjtBQUN0RSxTQUFTQyxNQUFNLEVBQUVDLFFBQVEsUUFBUSxRQUFPO0FBRXhDLE9BQU8sTUFBTUMsa0JBQW9DLENBQUMsRUFBRUMsSUFBSSxFQUFFO0lBQ3hELE1BQU0sRUFBRUMsS0FBSyxFQUFFLEdBQUdMLFNBQVM7UUFBRUk7SUFBSztJQUNsQyxNQUFNLENBQUNFLFFBQVFDLFVBQVUsR0FBR0wsU0FBUztJQUNyQyxNQUFNTSxZQUFZUCxPQUEwQjtJQUU1QyxNQUFNUSxhQUFhO1FBQ2pCQyxVQUFVQyxTQUFTLENBQUNDLFNBQVMsQ0FBQ1A7UUFDOUJFLFVBQVU7UUFDVk0sV0FBVztZQUNUTixVQUFVO1FBQ1osR0FBRztJQUNMO0lBQ0EscUJBQ0UsTUFBQ087UUFBSUMsV0FBVTs7MEJBQ2IsS0FBQ0Q7Z0JBQUlDLFdBQVU7Z0JBQTJCQyxnQkFBY1Y7MEJBQVE7OzBCQUdoRSxLQUFDUjtnQkFBT21CLEtBQUtUO2dCQUFXVSxvQkFBTSxLQUFDbkI7Z0JBQWFvQixhQUFZO2dCQUFjQyxTQUFTWDtnQkFBWU0sV0FBVTs7OztBQUczRyxFQUFDIn0=