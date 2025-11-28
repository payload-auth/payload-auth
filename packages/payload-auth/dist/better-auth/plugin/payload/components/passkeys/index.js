import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { PasskeysClient } from "./client";
import "./index.scss";
export const Passkeys = async (props)=>{
    const { id, passkeySlug, payload, passkeyUserIdFieldName, req, user, pluginOptions } = props;
    if (!id || !passkeySlug || !passkeyUserIdFieldName) return null;
    const { docs: userPasskeys } = await payload.find({
        collection: passkeySlug,
        where: {
            [passkeyUserIdFieldName]: {
                equals: id
            }
        },
        limit: 100,
        req,
        depth: 0
    });
    return /*#__PURE__*/ _jsxs("div", {
        className: "passkeys-field",
        children: [
            /*#__PURE__*/ _jsx("h3", {
                className: "passkeys-field__title",
                style: {
                    marginBottom: '0.7rem'
                },
                children: "Passkeys"
            }),
            /*#__PURE__*/ _jsx(PasskeysClient, {
                initialPasskeys: userPasskeys,
                documentId: id,
                currentUserId: user?.id,
                passkeySlug: passkeySlug,
                passkeyUserIdFieldName: passkeyUserIdFieldName,
                baseURL: pluginOptions.betterAuthOptions?.baseURL,
                basePath: pluginOptions.betterAuthOptions?.basePath
            })
        ]
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vcGF5bG9hZC9jb21wb25lbnRzL3Bhc3NrZXlzL2luZGV4LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBQYXNza2V5c0NsaWVudCB9IGZyb20gJy4vY2xpZW50J1xuaW1wb3J0ICcuL2luZGV4LnNjc3MnXG5pbXBvcnQgdHlwZSB7IFBhc3NrZXlzU2VydmVyQ29tcG9uZW50UHJvcHMsIFBhc3NrZXlXaXRoSWQgfSBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgY29uc3QgUGFzc2tleXM6IFJlYWN0LkZDPFBhc3NrZXlzU2VydmVyQ29tcG9uZW50UHJvcHM+ID0gYXN5bmMgKHByb3BzKSA9PiB7XG4gIGNvbnN0IHsgaWQsIHBhc3NrZXlTbHVnLCBwYXlsb2FkLCBwYXNza2V5VXNlcklkRmllbGROYW1lLCByZXEsIHVzZXIsIHBsdWdpbk9wdGlvbnMgfSA9IHByb3BzXG5cbiAgaWYgKCFpZCB8fCAhcGFzc2tleVNsdWcgfHwgIXBhc3NrZXlVc2VySWRGaWVsZE5hbWUpIHJldHVybiBudWxsXG5cbiAgY29uc3QgeyBkb2NzOiB1c2VyUGFzc2tleXMgfSA9IChhd2FpdCBwYXlsb2FkLmZpbmQoe1xuICAgIGNvbGxlY3Rpb246IHBhc3NrZXlTbHVnLFxuICAgIHdoZXJlOiB7XG4gICAgICBbcGFzc2tleVVzZXJJZEZpZWxkTmFtZV06IHsgZXF1YWxzOiBpZCB9XG4gICAgfSxcbiAgICBsaW1pdDogMTAwLFxuICAgIHJlcSxcbiAgICBkZXB0aDogMFxuICB9KSkgYXMgdW5rbm93biBhcyB7IGRvY3M6IFBhc3NrZXlXaXRoSWRbXSB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInBhc3NrZXlzLWZpZWxkXCI+XG4gICAgICA8aDMgY2xhc3NOYW1lPVwicGFzc2tleXMtZmllbGRfX3RpdGxlXCIgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnMC43cmVtJyB9fT5cbiAgICAgICAgUGFzc2tleXNcbiAgICAgIDwvaDM+XG4gICAgICA8UGFzc2tleXNDbGllbnRcbiAgICAgICAgaW5pdGlhbFBhc3NrZXlzPXt1c2VyUGFzc2tleXN9XG4gICAgICAgIGRvY3VtZW50SWQ9e2lkfVxuICAgICAgICBjdXJyZW50VXNlcklkPXt1c2VyPy5pZH1cbiAgICAgICAgcGFzc2tleVNsdWc9e3Bhc3NrZXlTbHVnfVxuICAgICAgICBwYXNza2V5VXNlcklkRmllbGROYW1lPXtwYXNza2V5VXNlcklkRmllbGROYW1lfVxuICAgICAgICBiYXNlVVJMPXtwbHVnaW5PcHRpb25zLmJldHRlckF1dGhPcHRpb25zPy5iYXNlVVJMfVxuICAgICAgICBiYXNlUGF0aD17cGx1Z2luT3B0aW9ucy5iZXR0ZXJBdXRoT3B0aW9ucz8uYmFzZVBhdGh9XG4gICAgICAvPlxuICAgIDwvZGl2PlxuICApXG59XG4iXSwibmFtZXMiOlsiUmVhY3QiLCJQYXNza2V5c0NsaWVudCIsIlBhc3NrZXlzIiwicHJvcHMiLCJpZCIsInBhc3NrZXlTbHVnIiwicGF5bG9hZCIsInBhc3NrZXlVc2VySWRGaWVsZE5hbWUiLCJyZXEiLCJ1c2VyIiwicGx1Z2luT3B0aW9ucyIsImRvY3MiLCJ1c2VyUGFzc2tleXMiLCJmaW5kIiwiY29sbGVjdGlvbiIsIndoZXJlIiwiZXF1YWxzIiwibGltaXQiLCJkZXB0aCIsImRpdiIsImNsYXNzTmFtZSIsImgzIiwic3R5bGUiLCJtYXJnaW5Cb3R0b20iLCJpbml0aWFsUGFzc2tleXMiLCJkb2N1bWVudElkIiwiY3VycmVudFVzZXJJZCIsImJhc2VVUkwiLCJiZXR0ZXJBdXRoT3B0aW9ucyIsImJhc2VQYXRoIl0sIm1hcHBpbmdzIjoiO0FBQUEsT0FBT0EsV0FBVyxRQUFPO0FBQ3pCLFNBQVNDLGNBQWMsUUFBUSxXQUFVO0FBQ3pDLE9BQU8sZUFBYztBQUdyQixPQUFPLE1BQU1DLFdBQW1ELE9BQU9DO0lBQ3JFLE1BQU0sRUFBRUMsRUFBRSxFQUFFQyxXQUFXLEVBQUVDLE9BQU8sRUFBRUMsc0JBQXNCLEVBQUVDLEdBQUcsRUFBRUMsSUFBSSxFQUFFQyxhQUFhLEVBQUUsR0FBR1A7SUFFdkYsSUFBSSxDQUFDQyxNQUFNLENBQUNDLGVBQWUsQ0FBQ0Usd0JBQXdCLE9BQU87SUFFM0QsTUFBTSxFQUFFSSxNQUFNQyxZQUFZLEVBQUUsR0FBSSxNQUFNTixRQUFRTyxJQUFJLENBQUM7UUFDakRDLFlBQVlUO1FBQ1pVLE9BQU87WUFDTCxDQUFDUix1QkFBdUIsRUFBRTtnQkFBRVMsUUFBUVo7WUFBRztRQUN6QztRQUNBYSxPQUFPO1FBQ1BUO1FBQ0FVLE9BQU87SUFDVDtJQUVBLHFCQUNFLE1BQUNDO1FBQUlDLFdBQVU7OzBCQUNiLEtBQUNDO2dCQUFHRCxXQUFVO2dCQUF3QkUsT0FBTztvQkFBRUMsY0FBYztnQkFBUzswQkFBRzs7MEJBR3pFLEtBQUN0QjtnQkFDQ3VCLGlCQUFpQlo7Z0JBQ2pCYSxZQUFZckI7Z0JBQ1pzQixlQUFlakIsTUFBTUw7Z0JBQ3JCQyxhQUFhQTtnQkFDYkUsd0JBQXdCQTtnQkFDeEJvQixTQUFTakIsY0FBY2tCLGlCQUFpQixFQUFFRDtnQkFDMUNFLFVBQVVuQixjQUFja0IsaUJBQWlCLEVBQUVDOzs7O0FBSW5ELEVBQUMifQ==