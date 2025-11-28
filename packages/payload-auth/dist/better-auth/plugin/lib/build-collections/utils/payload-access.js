export const isAdminWithRoles = (config = {})=>({ req })=>{
        const { adminRoles = [
            'admin'
        ] } = config;
        if (!req?.user || !req.user.role || !hasAdminRoles(adminRoles)({
            req
        })) return false;
        return true;
    };
export const isAdminOrCurrentUserWithRoles = (config = {})=>({ req })=>{
        const { adminRoles = [
            'admin'
        ], idField = 'id' } = config;
        if (isAdminWithRoles({
            adminRoles
        })({
            req
        })) return true;
        if (!req?.user) return false;
        return {
            [idField]: {
                equals: req?.user?.id
            }
        };
    };
export const hasAdminRoles = (adminRoles)=>{
    return ({ req })=>{
        let userRoles = [];
        if (Array.isArray(req.user?.role)) {
            userRoles = req.user.role;
        } else if (typeof req.user?.role === 'string') {
            if (req.user.role.includes(',')) {
                userRoles = req.user.role.split(',').map((r)=>r.trim()).filter(Boolean);
            } else if (req.user.role) {
                userRoles = [
                    req.user.role
                ];
            }
        }
        if (!userRoles) return false;
        return userRoles.some((role)=>adminRoles.includes(role));
    };
};
export const isAdminOrCurrentUserUpdateWithAllowedFields = (config)=>{
    return async ({ req, id, data })=>{
        const { adminRoles = [
            'admin'
        ], allowedFields = [], userSlug, idField = 'id' } = config;
        const user = req.user;
        if (isAdminWithRoles({
            adminRoles
        })({
            req
        })) return true;
        if (!user) return false;
        if (user[idField] === id && data) {
            const dataKeys = Object.keys(data);
            const hasCurrentPassword = dataKeys.includes('currentPassword');
            const hasPassword = dataKeys.includes('password');
            if (hasPassword || hasCurrentPassword) {
                if (!(hasCurrentPassword && hasPassword)) return false;
                try {
                    if (!user.email) return false;
                    const result = await req.payload.login({
                        collection: userSlug,
                        data: {
                            email: user.email,
                            password: data.currentPassword
                        }
                    });
                    if (!result) return false;
                    allowedFields.push('password', 'currentPassword');
                } catch (error) {
                    return false;
                }
            }
            const hasDisallowedField = dataKeys.some((key)=>!allowedFields.includes(key));
            return !hasDisallowedField;
        }
        return false;
    };
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3V0aWxzL3BheWxvYWQtYWNjZXNzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgQWNjZXNzLCBGaWVsZEFjY2VzcyB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgdHlwZSB7IFBheWxvYWRSZXF1ZXN0IH0gZnJvbSAncGF5bG9hZCdcblxuZXhwb3J0IHR5cGUgQWRtaW5Sb2xlc0NvbmZpZyA9IHtcbiAgYWRtaW5Sb2xlcz86IHN0cmluZ1tdXG59XG5cbmV4cG9ydCB0eXBlIEFkbWluT3JDdXJyZW50VXNlckNvbmZpZyA9IEFkbWluUm9sZXNDb25maWcgJiB7XG4gIGlkRmllbGQ/OiBzdHJpbmdcbn1cblxuZXhwb3J0IHR5cGUgQWRtaW5PckN1cnJlbnRVc2VyVXBkYXRlQ29uZmlnID0gQWRtaW5PckN1cnJlbnRVc2VyQ29uZmlnICYge1xuICBhbGxvd2VkRmllbGRzPzogc3RyaW5nW11cbiAgdXNlclNsdWc6IHN0cmluZ1xufVxuXG5leHBvcnQgY29uc3QgaXNBZG1pbldpdGhSb2xlcyA9XG4gIChjb25maWc6IEFkbWluUm9sZXNDb25maWcgPSB7fSk6IEZpZWxkQWNjZXNzID0+XG4gICh7IHJlcSB9KSA9PiB7XG4gICAgY29uc3QgeyBhZG1pblJvbGVzID0gWydhZG1pbiddIH0gPSBjb25maWdcbiAgICBpZiAoIXJlcT8udXNlciB8fCAhcmVxLnVzZXIucm9sZSB8fCAhaGFzQWRtaW5Sb2xlcyhhZG1pblJvbGVzKSh7IHJlcSB9KSkgcmV0dXJuIGZhbHNlXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG5leHBvcnQgY29uc3QgaXNBZG1pbk9yQ3VycmVudFVzZXJXaXRoUm9sZXMgPVxuICAoY29uZmlnOiBBZG1pbk9yQ3VycmVudFVzZXJDb25maWcgPSB7fSk6IEFjY2VzcyA9PlxuICAoeyByZXEgfSkgPT4ge1xuICAgIGNvbnN0IHsgYWRtaW5Sb2xlcyA9IFsnYWRtaW4nXSwgaWRGaWVsZCA9ICdpZCcgfSA9IGNvbmZpZ1xuICAgIGlmIChpc0FkbWluV2l0aFJvbGVzKHsgYWRtaW5Sb2xlcyB9KSh7IHJlcSB9KSkgcmV0dXJuIHRydWVcbiAgICBpZiAoIXJlcT8udXNlcikgcmV0dXJuIGZhbHNlXG4gICAgcmV0dXJuIHtcbiAgICAgIFtpZEZpZWxkXToge1xuICAgICAgICBlcXVhbHM6IHJlcT8udXNlcj8uaWRcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuZXhwb3J0IGNvbnN0IGhhc0FkbWluUm9sZXMgPSAoYWRtaW5Sb2xlczogc3RyaW5nW10pID0+IHtcbiAgcmV0dXJuICh7IHJlcSB9OiB7IHJlcTogUGF5bG9hZFJlcXVlc3QgfSk6IGJvb2xlYW4gPT4ge1xuICAgIGxldCB1c2VyUm9sZXM6IHN0cmluZ1tdID0gW11cbiAgICBpZiAoQXJyYXkuaXNBcnJheShyZXEudXNlcj8ucm9sZSkpIHtcbiAgICAgIHVzZXJSb2xlcyA9IHJlcS51c2VyLnJvbGVcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiByZXEudXNlcj8ucm9sZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGlmIChyZXEudXNlci5yb2xlLmluY2x1ZGVzKCcsJykpIHtcbiAgICAgICAgdXNlclJvbGVzID0gcmVxLnVzZXIucm9sZVxuICAgICAgICAgIC5zcGxpdCgnLCcpXG4gICAgICAgICAgLm1hcCgocjogc3RyaW5nKSA9PiByLnRyaW0oKSlcbiAgICAgICAgICAuZmlsdGVyKEJvb2xlYW4pXG4gICAgICB9IGVsc2UgaWYgKHJlcS51c2VyLnJvbGUpIHtcbiAgICAgICAgdXNlclJvbGVzID0gW3JlcS51c2VyLnJvbGVdXG4gICAgICB9XG4gICAgfVxuICAgIGlmICghdXNlclJvbGVzKSByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gdXNlclJvbGVzLnNvbWUoKHJvbGUpID0+IGFkbWluUm9sZXMuaW5jbHVkZXMocm9sZSkpXG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGlzQWRtaW5PckN1cnJlbnRVc2VyVXBkYXRlV2l0aEFsbG93ZWRGaWVsZHMgPSAoY29uZmlnOiBBZG1pbk9yQ3VycmVudFVzZXJVcGRhdGVDb25maWcpOiBBY2Nlc3MgPT4ge1xuICByZXR1cm4gYXN5bmMgKHsgcmVxLCBpZCwgZGF0YSB9KSA9PiB7XG4gICAgY29uc3QgeyBhZG1pblJvbGVzID0gWydhZG1pbiddLCBhbGxvd2VkRmllbGRzID0gW10sIHVzZXJTbHVnLCBpZEZpZWxkID0gJ2lkJyB9ID0gY29uZmlnXG4gICAgY29uc3QgdXNlciA9IHJlcS51c2VyXG5cbiAgICBpZiAoaXNBZG1pbldpdGhSb2xlcyh7IGFkbWluUm9sZXMgfSkoeyByZXEgfSkpIHJldHVybiB0cnVlXG5cbiAgICBpZiAoIXVzZXIpIHJldHVybiBmYWxzZVxuXG4gICAgaWYgKHVzZXJbaWRGaWVsZF0gPT09IGlkICYmIGRhdGEpIHtcbiAgICAgIGNvbnN0IGRhdGFLZXlzID0gT2JqZWN0LmtleXMoZGF0YSlcblxuICAgICAgY29uc3QgaGFzQ3VycmVudFBhc3N3b3JkID0gZGF0YUtleXMuaW5jbHVkZXMoJ2N1cnJlbnRQYXNzd29yZCcpXG4gICAgICBjb25zdCBoYXNQYXNzd29yZCA9IGRhdGFLZXlzLmluY2x1ZGVzKCdwYXNzd29yZCcpXG5cbiAgICAgIGlmIChoYXNQYXNzd29yZCB8fCBoYXNDdXJyZW50UGFzc3dvcmQpIHtcbiAgICAgICAgaWYgKCEoaGFzQ3VycmVudFBhc3N3b3JkICYmIGhhc1Bhc3N3b3JkKSkgcmV0dXJuIGZhbHNlXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKCF1c2VyLmVtYWlsKSByZXR1cm4gZmFsc2VcblxuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJlcS5wYXlsb2FkLmxvZ2luKHtcbiAgICAgICAgICAgIGNvbGxlY3Rpb246IHVzZXJTbHVnLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICBlbWFpbDogdXNlci5lbWFpbCxcbiAgICAgICAgICAgICAgcGFzc3dvcmQ6IGRhdGEuY3VycmVudFBhc3N3b3JkXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGlmICghcmVzdWx0KSByZXR1cm4gZmFsc2VcblxuICAgICAgICAgIGFsbG93ZWRGaWVsZHMucHVzaCgncGFzc3dvcmQnLCAnY3VycmVudFBhc3N3b3JkJylcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBoYXNEaXNhbGxvd2VkRmllbGQgPSBkYXRhS2V5cy5zb21lKChrZXkpID0+ICFhbGxvd2VkRmllbGRzLmluY2x1ZGVzKGtleSkpXG5cbiAgICAgIHJldHVybiAhaGFzRGlzYWxsb3dlZEZpZWxkXG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJpc0FkbWluV2l0aFJvbGVzIiwiY29uZmlnIiwicmVxIiwiYWRtaW5Sb2xlcyIsInVzZXIiLCJyb2xlIiwiaGFzQWRtaW5Sb2xlcyIsImlzQWRtaW5PckN1cnJlbnRVc2VyV2l0aFJvbGVzIiwiaWRGaWVsZCIsImVxdWFscyIsImlkIiwidXNlclJvbGVzIiwiQXJyYXkiLCJpc0FycmF5IiwiaW5jbHVkZXMiLCJzcGxpdCIsIm1hcCIsInIiLCJ0cmltIiwiZmlsdGVyIiwiQm9vbGVhbiIsInNvbWUiLCJpc0FkbWluT3JDdXJyZW50VXNlclVwZGF0ZVdpdGhBbGxvd2VkRmllbGRzIiwiZGF0YSIsImFsbG93ZWRGaWVsZHMiLCJ1c2VyU2x1ZyIsImRhdGFLZXlzIiwiT2JqZWN0Iiwia2V5cyIsImhhc0N1cnJlbnRQYXNzd29yZCIsImhhc1Bhc3N3b3JkIiwiZW1haWwiLCJyZXN1bHQiLCJwYXlsb2FkIiwibG9naW4iLCJjb2xsZWN0aW9uIiwicGFzc3dvcmQiLCJjdXJyZW50UGFzc3dvcmQiLCJwdXNoIiwiZXJyb3IiLCJoYXNEaXNhbGxvd2VkRmllbGQiLCJrZXkiXSwibWFw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