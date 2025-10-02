import { RenderServerComponent } from "@payloadcms/ui/elements/RenderServerComponent";
import { PayloadLogo } from "@payloadcms/ui/shared";
export const Logo = (props)=>{
    const { i18n, locale, params, payload, permissions, searchParams, user } = props;
    const { admin: { components: { graphics: { Logo: CustomLogo } = {
        Logo: undefined
    } } = {} } = {} } = payload.config;
    return RenderServerComponent({
        Component: CustomLogo,
        Fallback: PayloadLogo,
        importMap: payload.importMap,
        serverProps: {
            i18n,
            locale,
            params,
            payload,
            permissions,
            searchParams,
            user
        }
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zaGFyZWQvY29tcG9uZW50cy9sb2dvLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFNlcnZlclByb3BzIH0gZnJvbSAncGF5bG9hZCdcbmltcG9ydCB0eXBlIFJlYWN0IGZyb20gJ3JlYWN0J1xuXG5pbXBvcnQgeyBSZW5kZXJTZXJ2ZXJDb21wb25lbnQgfSBmcm9tICdAcGF5bG9hZGNtcy91aS9lbGVtZW50cy9SZW5kZXJTZXJ2ZXJDb21wb25lbnQnXG5pbXBvcnQgeyBQYXlsb2FkTG9nbyB9IGZyb20gJ0BwYXlsb2FkY21zL3VpL3NoYXJlZCdcblxuZXhwb3J0IGNvbnN0IExvZ286IFJlYWN0LkZDPFNlcnZlclByb3BzPiA9IChwcm9wcykgPT4ge1xuICBjb25zdCB7IGkxOG4sIGxvY2FsZSwgcGFyYW1zLCBwYXlsb2FkLCBwZXJtaXNzaW9ucywgc2VhcmNoUGFyYW1zLCB1c2VyIH0gPSBwcm9wc1xuXG4gIGNvbnN0IHtcbiAgICBhZG1pbjoge1xuICAgICAgY29tcG9uZW50czoge1xuICAgICAgICBncmFwaGljczogeyBMb2dvOiBDdXN0b21Mb2dvIH0gPSB7XG4gICAgICAgICAgTG9nbzogdW5kZWZpbmVkXG4gICAgICAgIH1cbiAgICAgIH0gPSB7fVxuICAgIH0gPSB7fVxuICB9ID0gcGF5bG9hZC5jb25maWdcblxuICByZXR1cm4gUmVuZGVyU2VydmVyQ29tcG9uZW50KHtcbiAgICBDb21wb25lbnQ6IEN1c3RvbUxvZ28sXG4gICAgRmFsbGJhY2s6IFBheWxvYWRMb2dvLFxuICAgIGltcG9ydE1hcDogcGF5bG9hZC5pbXBvcnRNYXAsXG4gICAgc2VydmVyUHJvcHM6IHtcbiAgICAgIGkxOG4sXG4gICAgICBsb2NhbGUsXG4gICAgICBwYXJhbXMsXG4gICAgICBwYXlsb2FkLFxuICAgICAgcGVybWlzc2lvbnMsXG4gICAgICBzZWFyY2hQYXJhbXMsXG4gICAgICB1c2VyXG4gICAgfVxuICB9KVxufVxuIl0sIm5hbWVzIjpbIlJlbmRlclNlcnZlckNvbXBvbmVudCIsIlBheWxvYWRMb2dvIiwiTG9nbyIsInByb3BzIiwiaTE4biIsImxvY2FsZSIsInBhcmFtcyIsInBheWxvYWQiLCJwZXJtaXNzaW9ucyIsInNlYXJjaFBhcmFtcyIsInVzZXIiLCJhZG1pbiIsImNvbXBvbmVudHMiLCJncmFwaGljcyIsIkN1c3RvbUxvZ28iLCJ1bmRlZmluZWQiLCJjb25maWciLCJDb21wb25lbnQiLCJGYWxsYmFjayIsImltcG9ydE1hcCIsInNlcnZlclByb3BzIl0sIm1hcHBpbmdzIjoiQUFHQSxTQUFTQSxxQkFBcUIsUUFBUSxnREFBK0M7QUFDckYsU0FBU0MsV0FBVyxRQUFRLHdCQUF1QjtBQUVuRCxPQUFPLE1BQU1DLE9BQThCLENBQUNDO0lBQzFDLE1BQU0sRUFBRUMsSUFBSSxFQUFFQyxNQUFNLEVBQUVDLE1BQU0sRUFBRUMsT0FBTyxFQUFFQyxXQUFXLEVBQUVDLFlBQVksRUFBRUMsSUFBSSxFQUFFLEdBQUdQO0lBRTNFLE1BQU0sRUFDSlEsT0FBTyxFQUNMQyxZQUFZLEVBQ1ZDLFVBQVUsRUFBRVgsTUFBTVksVUFBVSxFQUFFLEdBQUc7UUFDL0JaLE1BQU1hO0lBQ1IsQ0FBQyxFQUNGLEdBQUcsQ0FBQyxDQUFDLEVBQ1AsR0FBRyxDQUFDLENBQUMsRUFDUCxHQUFHUixRQUFRUyxNQUFNO0lBRWxCLE9BQU9oQixzQkFBc0I7UUFDM0JpQixXQUFXSDtRQUNYSSxVQUFVakI7UUFDVmtCLFdBQVdaLFFBQVFZLFNBQVM7UUFDNUJDLGFBQWE7WUFDWGhCO1lBQ0FDO1lBQ0FDO1lBQ0FDO1lBQ0FDO1lBQ0FDO1lBQ0FDO1FBQ0Y7SUFDRjtBQUNGLEVBQUMifQ==