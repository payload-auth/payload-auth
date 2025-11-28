import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import "./index.scss";
const baseClass = 'form-header';
const FormHeader = ({ description, heading, ...props })=>{
    if (!heading) {
        return null;
    }
    return /*#__PURE__*/ _jsxs("div", {
        className: baseClass,
        ...props,
        children: [
            /*#__PURE__*/ _jsx("h1", {
                children: heading
            }),
            Boolean(description) && /*#__PURE__*/ _jsx("p", {
                children: description
            })
        ]
    });
};
export { FormHeader };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zaGFyZWQvZm9ybS91aS9oZWFkZXIvaW5kZXgudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyB0eXBlIENvbXBvbmVudFByb3BzV2l0aG91dFJlZiB9IGZyb20gJ3JlYWN0J1xuXG5pbXBvcnQgJy4vaW5kZXguc2NzcydcblxuY29uc3QgYmFzZUNsYXNzID0gJ2Zvcm0taGVhZGVyJ1xuXG50eXBlIFByb3BzID0gQ29tcG9uZW50UHJvcHNXaXRob3V0UmVmPCdkaXYnPiAmIHtcbiAgZGVzY3JpcHRpb24/OiBSZWFjdC5SZWFjdE5vZGUgfCBzdHJpbmdcbiAgaGVhZGluZzogc3RyaW5nXG59XG5cbmNvbnN0IEZvcm1IZWFkZXI6IFJlYWN0LkZDPFByb3BzPiA9ICh7IGRlc2NyaXB0aW9uLCBoZWFkaW5nLCAuLi5wcm9wcyB9KSA9PiB7XG4gIGlmICghaGVhZGluZykge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtiYXNlQ2xhc3N9IHsuLi5wcm9wc30+XG4gICAgICA8aDE+e2hlYWRpbmd9PC9oMT5cbiAgICAgIHtCb29sZWFuKGRlc2NyaXB0aW9uKSAmJiA8cD57ZGVzY3JpcHRpb259PC9wPn1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgeyBGb3JtSGVhZGVyIH1cbiJdLCJuYW1lcyI6WyJSZWFjdCIsImJhc2VDbGFzcyIsIkZvcm1IZWFkZXIiLCJkZXNjcmlwdGlvbiIsImhlYWRpbmciLCJwcm9wcyIsImRpdiIsImNsYXNzTmFtZSIsImgxIiwiQm9vbGVhbiIsInAiXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPQSxXQUE4QyxRQUFPO0FBRTVELE9BQU8sZUFBYztBQUVyQixNQUFNQyxZQUFZO0FBT2xCLE1BQU1DLGFBQThCLENBQUMsRUFBRUMsV0FBVyxFQUFFQyxPQUFPLEVBQUUsR0FBR0MsT0FBTztJQUNyRSxJQUFJLENBQUNELFNBQVM7UUFDWixPQUFPO0lBQ1Q7SUFFQSxxQkFDRSxNQUFDRTtRQUFJQyxXQUFXTjtRQUFZLEdBQUdJLEtBQUs7OzBCQUNsQyxLQUFDRzswQkFBSUo7O1lBQ0pLLFFBQVFOLDhCQUFnQixLQUFDTzswQkFBR1A7Ozs7QUFHbkM7QUFFQSxTQUFTRCxVQUFVLEdBQUUifQ==