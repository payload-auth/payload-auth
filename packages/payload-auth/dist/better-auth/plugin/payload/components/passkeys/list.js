'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Fingerprint, Trash } from "lucide-react";
import { Button } from "@payloadcms/ui";
export const PasskeyList = ({ passkeys, onDelete })=>{
    if (passkeys.length === 0) return /*#__PURE__*/ _jsx("p", {
        style: {
            marginBottom: '1rem'
        },
        children: "No passkeys found."
    });
    return /*#__PURE__*/ _jsx("ul", {
        className: "passkeys-field__list",
        children: passkeys.map((pk)=>{
            const { id, createdAt } = pk;
            if (!id || !createdAt) return null;
            return /*#__PURE__*/ _jsxs("li", {
                className: "passkeys-field__list-item",
                children: [
                    /*#__PURE__*/ _jsx(Fingerprint, {
                        size: 16
                    }),
                    /*#__PURE__*/ _jsx("span", {
                        children: pk.name || 'My Passkey'
                    }),
                    /*#__PURE__*/ _jsx("span", {
                        className: "passkeys-field__list-item-date",
                        children: " - "
                    }),
                    /*#__PURE__*/ _jsx("span", {
                        className: "passkeys-field__list-item-date",
                        children: new Date(createdAt).toLocaleString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        })
                    }),
                    onDelete && /*#__PURE__*/ _jsx(Button, {
                        buttonStyle: "none",
                        size: "small",
                        className: "passkeys-field__delete-button",
                        onClick: ()=>onDelete(id),
                        children: /*#__PURE__*/ _jsx(Trash, {
                            size: 16
                        })
                    })
                ]
            }, id);
        })
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC9jb21wb25lbnRzL3Bhc3NrZXlzL2xpc3QudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIid1c2UgY2xpZW50J1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBGaW5nZXJwcmludCwgVHJhc2ggfSBmcm9tICdsdWNpZGUtcmVhY3QnXG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICdAcGF5bG9hZGNtcy91aSdcbmltcG9ydCB0eXBlIHsgUGFzc2tleVdpdGhJZCB9IGZyb20gJy4vdHlwZXMnXG5cbmludGVyZmFjZSBQYXNza2V5TGlzdFByb3BzIHtcbiAgcGFzc2tleXM6IFBhc3NrZXlXaXRoSWRbXVxuICBvbkRlbGV0ZT86IChpZDogc3RyaW5nKSA9PiB2b2lkXG59XG5cbmV4cG9ydCBjb25zdCBQYXNza2V5TGlzdDogUmVhY3QuRkM8UGFzc2tleUxpc3RQcm9wcz4gPSAoeyBwYXNza2V5cywgb25EZWxldGUgfSkgPT4ge1xuICBpZiAocGFzc2tleXMubGVuZ3RoID09PSAwKSByZXR1cm4gPHAgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnMXJlbScgfX0+Tm8gcGFzc2tleXMgZm91bmQuPC9wPlxuXG4gIHJldHVybiAoXG4gICAgPHVsIGNsYXNzTmFtZT1cInBhc3NrZXlzLWZpZWxkX19saXN0XCI+XG4gICAgICB7cGFzc2tleXMubWFwKChwaykgPT4ge1xuICAgICAgICBjb25zdCB7IGlkLCBjcmVhdGVkQXQgfSA9IHBrXG4gICAgICAgIGlmICghaWQgfHwgIWNyZWF0ZWRBdCkgcmV0dXJuIG51bGxcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8bGkga2V5PXtpZH0gY2xhc3NOYW1lPVwicGFzc2tleXMtZmllbGRfX2xpc3QtaXRlbVwiPlxuICAgICAgICAgICAgPEZpbmdlcnByaW50IHNpemU9ezE2fSAvPlxuICAgICAgICAgICAgPHNwYW4+e3BrLm5hbWUgfHwgJ015IFBhc3NrZXknfTwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInBhc3NrZXlzLWZpZWxkX19saXN0LWl0ZW0tZGF0ZVwiPiAtIDwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInBhc3NrZXlzLWZpZWxkX19saXN0LWl0ZW0tZGF0ZVwiPlxuICAgICAgICAgICAgICB7bmV3IERhdGUoY3JlYXRlZEF0KS50b0xvY2FsZVN0cmluZygnZW4tVVMnLCB7XG4gICAgICAgICAgICAgICAgbW9udGg6ICdsb25nJyxcbiAgICAgICAgICAgICAgICBkYXk6ICdudW1lcmljJyxcbiAgICAgICAgICAgICAgICB5ZWFyOiAnbnVtZXJpYycsXG4gICAgICAgICAgICAgICAgaG91cjogJ251bWVyaWMnLFxuICAgICAgICAgICAgICAgIG1pbnV0ZTogJzItZGlnaXQnLFxuICAgICAgICAgICAgICAgIGhvdXIxMjogdHJ1ZVxuICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIHtvbkRlbGV0ZSAmJiAoXG4gICAgICAgICAgICAgIDxCdXR0b24gYnV0dG9uU3R5bGU9XCJub25lXCIgc2l6ZT1cInNtYWxsXCIgY2xhc3NOYW1lPVwicGFzc2tleXMtZmllbGRfX2RlbGV0ZS1idXR0b25cIiBvbkNsaWNrPXsoKSA9PiBvbkRlbGV0ZShpZCl9PlxuICAgICAgICAgICAgICAgIDxUcmFzaCBzaXplPXsxNn0gLz5cbiAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICApfVxuICAgICAgICAgIDwvbGk+XG4gICAgICAgIClcbiAgICAgIH0pfVxuICAgIDwvdWw+XG4gIClcbn1cbiJdLCJuYW1lcyI6WyJSZWFjdCIsIkZpbmdlcnByaW50IiwiVHJhc2giLCJCdXR0b24iLCJQYXNza2V5TGlzdCIsInBhc3NrZXlzIiwib25EZWxldGUiLCJsZW5ndGgiLCJwIiwic3R5bGUiLCJtYXJnaW5Cb3R0b20iLCJ1bCIsImNsYXNzTmFtZSIsIm1hcCIsInBrIiwiaWQiLCJjcmVhdGVkQXQiLCJsaSIsInNpemUiLCJzcGFuIiwibmFtZSIsIkRhdGUiLCJ0b0xvY2FsZVN0cmluZyIsIm1vbnRoIiwiZGF5IiwieWVhciIsImhvdXIiLCJtaW51dGUiLCJob3VyMTIiLCJidXR0b25TdHlsZSIsIm9uQ2xpY2siXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBLE9BQU9BLFdBQVcsUUFBTztBQUN6QixTQUFTQyxXQUFXLEVBQUVDLEtBQUssUUFBUSxlQUFjO0FBQ2pELFNBQVNDLE1BQU0sUUFBUSxpQkFBZ0I7QUFRdkMsT0FBTyxNQUFNQyxjQUEwQyxDQUFDLEVBQUVDLFFBQVEsRUFBRUMsUUFBUSxFQUFFO0lBQzVFLElBQUlELFNBQVNFLE1BQU0sS0FBSyxHQUFHLHFCQUFPLEtBQUNDO1FBQUVDLE9BQU87WUFBRUMsY0FBYztRQUFPO2tCQUFHOztJQUV0RSxxQkFDRSxLQUFDQztRQUFHQyxXQUFVO2tCQUNYUCxTQUFTUSxHQUFHLENBQUMsQ0FBQ0M7WUFDYixNQUFNLEVBQUVDLEVBQUUsRUFBRUMsU0FBUyxFQUFFLEdBQUdGO1lBQzFCLElBQUksQ0FBQ0MsTUFBTSxDQUFDQyxXQUFXLE9BQU87WUFDOUIscUJBQ0UsTUFBQ0M7Z0JBQVlMLFdBQVU7O2tDQUNyQixLQUFDWDt3QkFBWWlCLE1BQU07O2tDQUNuQixLQUFDQztrQ0FBTUwsR0FBR00sSUFBSSxJQUFJOztrQ0FDbEIsS0FBQ0Q7d0JBQUtQLFdBQVU7a0NBQWlDOztrQ0FDakQsS0FBQ087d0JBQUtQLFdBQVU7a0NBQ2IsSUFBSVMsS0FBS0wsV0FBV00sY0FBYyxDQUFDLFNBQVM7NEJBQzNDQyxPQUFPOzRCQUNQQyxLQUFLOzRCQUNMQyxNQUFNOzRCQUNOQyxNQUFNOzRCQUNOQyxRQUFROzRCQUNSQyxRQUFRO3dCQUNWOztvQkFFRHRCLDBCQUNDLEtBQUNIO3dCQUFPMEIsYUFBWTt3QkFBT1gsTUFBSzt3QkFBUU4sV0FBVTt3QkFBZ0NrQixTQUFTLElBQU14QixTQUFTUztrQ0FDeEcsY0FBQSxLQUFDYjs0QkFBTWdCLE1BQU07Ozs7ZUFoQlZIO1FBcUJiOztBQUdOLEVBQUMifQ==