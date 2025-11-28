export function getAllRoleOptions(pluginOptions) {
    const adminRoles = pluginOptions.users?.adminRoles ?? [
        'admin'
    ];
    const roles = pluginOptions.users?.roles ?? [
        'user'
    ];
    const allRoleOptions = [
        ...new Set([
            ...adminRoles,
            ...roles
        ])
    ].map((role)=>({
            label: role.split(/[-_\s]/).map((word)=>word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            value: role
        }));
    return allRoleOptions;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vaGVscGVycy9nZXQtYWxsLXJvbGVzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgQmV0dGVyQXV0aFBsdWdpbk9wdGlvbnMgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi90eXBlcydcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFsbFJvbGVPcHRpb25zKHBsdWdpbk9wdGlvbnM6IEJldHRlckF1dGhQbHVnaW5PcHRpb25zKSB7XG4gIGNvbnN0IGFkbWluUm9sZXMgPSBwbHVnaW5PcHRpb25zLnVzZXJzPy5hZG1pblJvbGVzID8/IFsnYWRtaW4nXVxuICBjb25zdCByb2xlcyA9IHBsdWdpbk9wdGlvbnMudXNlcnM/LnJvbGVzID8/IFsndXNlciddXG4gIGNvbnN0IGFsbFJvbGVPcHRpb25zID0gWy4uLm5ldyBTZXQoWy4uLmFkbWluUm9sZXMsIC4uLnJvbGVzXSldLm1hcCgocm9sZSkgPT4gKHtcbiAgICBsYWJlbDogcm9sZVxuICAgICAgLnNwbGl0KC9bLV9cXHNdLylcbiAgICAgIC5tYXAoKHdvcmQpID0+IHdvcmQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB3b3JkLnNsaWNlKDEpKVxuICAgICAgLmpvaW4oJyAnKSxcbiAgICB2YWx1ZTogcm9sZVxuICB9KSlcbiAgcmV0dXJuIGFsbFJvbGVPcHRpb25zXG59XG4iXSwibmFtZXMiOlsiZ2V0QWxsUm9sZU9wdGlvbnMiLCJwbHVnaW5PcHRpb25zIiwiYWRtaW5Sb2xlcyIsInVzZXJzIiwicm9sZXMiLCJhbGxSb2xlT3B0aW9ucyIsIlNldCIsIm1hcCIsInJvbGUiLCJsYWJlbCIsInNwbGl0Iiwid29yZCIsImNoYXJBdCIsInRvVXBwZXJDYXNlIiwic2xpY2UiLCJqb2luIiwidmFsdWUiXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sU0FBU0Esa0JBQWtCQyxhQUFzQztJQUN0RSxNQUFNQyxhQUFhRCxjQUFjRSxLQUFLLEVBQUVELGNBQWM7UUFBQztLQUFRO0lBQy9ELE1BQU1FLFFBQVFILGNBQWNFLEtBQUssRUFBRUMsU0FBUztRQUFDO0tBQU87SUFDcEQsTUFBTUMsaUJBQWlCO1dBQUksSUFBSUMsSUFBSTtlQUFJSjtlQUFlRTtTQUFNO0tBQUUsQ0FBQ0csR0FBRyxDQUFDLENBQUNDLE9BQVUsQ0FBQTtZQUM1RUMsT0FBT0QsS0FDSkUsS0FBSyxDQUFDLFVBQ05ILEdBQUcsQ0FBQyxDQUFDSSxPQUFTQSxLQUFLQyxNQUFNLENBQUMsR0FBR0MsV0FBVyxLQUFLRixLQUFLRyxLQUFLLENBQUMsSUFDeERDLElBQUksQ0FBQztZQUNSQyxPQUFPUjtRQUNULENBQUE7SUFDQSxPQUFPSDtBQUNUIn0=