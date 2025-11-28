'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Button, TextInput, useField, useFormFields } from "@payloadcms/ui";
const AdminInviteTokenField = (props)=>{
    const { path } = props;
    const { setValue } = useField({
        path
    });
    const token = useFormFields(([fields])=>fields.token);
    const value = token.value ?? '';
    return /*#__PURE__*/ _jsxs("div", {
        children: [
            /*#__PURE__*/ _jsx(Button, {
                onClick: ()=>setValue(crypto.randomUUID()),
                children: "Generate Token"
            }),
            /*#__PURE__*/ _jsx(TextInput, {
                path: path,
                readOnly: true,
                label: "Token",
                placeholder: "Click 'Generate Token' to create a token",
                value: value
            })
        ]
    });
};
export default AdminInviteTokenField;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC9jb21wb25lbnRzL3Rva2VuLWZpZWxkLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGNsaWVudCdcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQnV0dG9uLCBUZXh0SW5wdXQsIHVzZUZpZWxkLCB1c2VGb3JtRmllbGRzIH0gZnJvbSAnQHBheWxvYWRjbXMvdWknXG5pbXBvcnQgeyBUZXh0RmllbGRDbGllbnRQcm9wcyB9IGZyb20gJ3BheWxvYWQnXG5cbmNvbnN0IEFkbWluSW52aXRlVG9rZW5GaWVsZDogUmVhY3QuRkM8VGV4dEZpZWxkQ2xpZW50UHJvcHM+ID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IHsgcGF0aCB9ID0gcHJvcHNcbiAgY29uc3QgeyBzZXRWYWx1ZSB9ID0gdXNlRmllbGQoeyBwYXRoIH0pXG4gIGNvbnN0IHRva2VuID0gdXNlRm9ybUZpZWxkcygoW2ZpZWxkc10pID0+IGZpZWxkcy50b2tlbilcbiAgY29uc3QgdmFsdWUgPSAodG9rZW4udmFsdWUgYXMgc3RyaW5nKSA/PyAnJ1xuXG4gIHJldHVybiAoXG4gICAgPGRpdj5cbiAgICAgIDxCdXR0b24gb25DbGljaz17KCkgPT4gc2V0VmFsdWUoY3J5cHRvLnJhbmRvbVVVSUQoKSl9PkdlbmVyYXRlIFRva2VuPC9CdXR0b24+XG4gICAgICA8VGV4dElucHV0IHBhdGg9e3BhdGh9IHJlYWRPbmx5IGxhYmVsPVwiVG9rZW5cIiBwbGFjZWhvbGRlcj1cIkNsaWNrICdHZW5lcmF0ZSBUb2tlbicgdG8gY3JlYXRlIGEgdG9rZW5cIiB2YWx1ZT17dmFsdWV9IC8+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgQWRtaW5JbnZpdGVUb2tlbkZpZWxkXG4iXSwibmFtZXMiOlsiUmVhY3QiLCJCdXR0b24iLCJUZXh0SW5wdXQiLCJ1c2VGaWVsZCIsInVzZUZvcm1GaWVsZHMiLCJBZG1pbkludml0ZVRva2VuRmllbGQiLCJwcm9wcyIsInBhdGgiLCJzZXRWYWx1ZSIsInRva2VuIiwiZmllbGRzIiwidmFsdWUiLCJkaXYiLCJvbkNsaWNrIiwiY3J5cHRvIiwicmFuZG9tVVVJRCIsInJlYWRPbmx5IiwibGFiZWwiLCJwbGFjZWhvbGRlciJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUEsT0FBT0EsV0FBVyxRQUFPO0FBQ3pCLFNBQVNDLE1BQU0sRUFBRUMsU0FBUyxFQUFFQyxRQUFRLEVBQUVDLGFBQWEsUUFBUSxpQkFBZ0I7QUFHM0UsTUFBTUMsd0JBQXdELENBQUNDO0lBQzdELE1BQU0sRUFBRUMsSUFBSSxFQUFFLEdBQUdEO0lBQ2pCLE1BQU0sRUFBRUUsUUFBUSxFQUFFLEdBQUdMLFNBQVM7UUFBRUk7SUFBSztJQUNyQyxNQUFNRSxRQUFRTCxjQUFjLENBQUMsQ0FBQ00sT0FBTyxHQUFLQSxPQUFPRCxLQUFLO0lBQ3RELE1BQU1FLFFBQVEsQUFBQ0YsTUFBTUUsS0FBSyxJQUFlO0lBRXpDLHFCQUNFLE1BQUNDOzswQkFDQyxLQUFDWDtnQkFBT1ksU0FBUyxJQUFNTCxTQUFTTSxPQUFPQyxVQUFVOzBCQUFLOzswQkFDdEQsS0FBQ2I7Z0JBQVVLLE1BQU1BO2dCQUFNUyxRQUFRO2dCQUFDQyxPQUFNO2dCQUFRQyxhQUFZO2dCQUEyQ1AsT0FBT0E7Ozs7QUFHbEg7QUFFQSxlQUFlTixzQkFBcUIifQ==