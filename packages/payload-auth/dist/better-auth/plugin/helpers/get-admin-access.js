import { isAdminWithRoles } from "../lib/build-collections/utils/payload-access";
export function getAdminAccess(pluginOptions) {
    const adminRoles = pluginOptions.users?.adminRoles ?? [
        'admin'
    ];
    return {
        create: isAdminWithRoles({
            adminRoles
        }),
        read: isAdminWithRoles({
            adminRoles
        }),
        update: isAdminWithRoles({
            adminRoles
        }),
        delete: isAdminWithRoles({
            adminRoles
        })
    };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vaGVscGVycy9nZXQtYWRtaW4tYWNjZXNzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgQmV0dGVyQXV0aFBsdWdpbk9wdGlvbnMgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi90eXBlcydcbmltcG9ydCB7IGlzQWRtaW5XaXRoUm9sZXMgfSBmcm9tICcuLi9saWIvYnVpbGQtY29sbGVjdGlvbnMvdXRpbHMvcGF5bG9hZC1hY2Nlc3MnXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBZG1pbkFjY2VzcyhwbHVnaW5PcHRpb25zOiBCZXR0ZXJBdXRoUGx1Z2luT3B0aW9ucykge1xuICBjb25zdCBhZG1pblJvbGVzID0gcGx1Z2luT3B0aW9ucy51c2Vycz8uYWRtaW5Sb2xlcyA/PyBbJ2FkbWluJ11cbiAgcmV0dXJuIHtcbiAgICBjcmVhdGU6IGlzQWRtaW5XaXRoUm9sZXMoe1xuICAgICAgYWRtaW5Sb2xlc1xuICAgIH0pLFxuICAgIHJlYWQ6IGlzQWRtaW5XaXRoUm9sZXMoe1xuICAgICAgYWRtaW5Sb2xlc1xuICAgIH0pLFxuICAgIHVwZGF0ZTogaXNBZG1pbldpdGhSb2xlcyh7XG4gICAgICBhZG1pblJvbGVzXG4gICAgfSksXG4gICAgZGVsZXRlOiBpc0FkbWluV2l0aFJvbGVzKHtcbiAgICAgIGFkbWluUm9sZXNcbiAgICB9KVxuICB9XG59XG4iXSwibmFtZXMiOlsiaXNBZG1pbldpdGhSb2xlcyIsImdldEFkbWluQWNjZXNzIiwicGx1Z2luT3B0aW9ucyIsImFkbWluUm9sZXMiLCJ1c2VycyIsImNyZWF0ZSIsInJlYWQiLCJ1cGRhdGUiLCJkZWxldGUiXSwibWFwcGluZ3MiOiJBQUNBLFNBQVNBLGdCQUFnQixRQUFRLGdEQUErQztBQUVoRixPQUFPLFNBQVNDLGVBQWVDLGFBQXNDO0lBQ25FLE1BQU1DLGFBQWFELGNBQWNFLEtBQUssRUFBRUQsY0FBYztRQUFDO0tBQVE7SUFDL0QsT0FBTztRQUNMRSxRQUFRTCxpQkFBaUI7WUFDdkJHO1FBQ0Y7UUFDQUcsTUFBTU4saUJBQWlCO1lBQ3JCRztRQUNGO1FBQ0FJLFFBQVFQLGlCQUFpQjtZQUN2Qkc7UUFDRjtRQUNBSyxRQUFRUixpQkFBaUI7WUFDdkJHO1FBQ0Y7SUFDRjtBQUNGIn0=