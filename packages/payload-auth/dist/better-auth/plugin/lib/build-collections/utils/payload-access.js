export const isAdminWithRoles = (config = {})=>({ req })=>{
        const { adminRoles = [
            'admin'
        ] } = config;
        if (!req?.user || !req.user.role || !adminRoles.includes(req.user.role)) return false;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3V0aWxzL3BheWxvYWQtYWNjZXNzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgQWNjZXNzLCBGaWVsZEFjY2VzcyB9IGZyb20gJ3BheWxvYWQnXG5cbmV4cG9ydCB0eXBlIEFkbWluUm9sZXNDb25maWcgPSB7XG4gIGFkbWluUm9sZXM/OiBzdHJpbmdbXVxufVxuXG5leHBvcnQgdHlwZSBBZG1pbk9yQ3VycmVudFVzZXJDb25maWcgPSBBZG1pblJvbGVzQ29uZmlnICYge1xuICBpZEZpZWxkPzogc3RyaW5nXG59XG5cbmV4cG9ydCB0eXBlIEFkbWluT3JDdXJyZW50VXNlclVwZGF0ZUNvbmZpZyA9IEFkbWluT3JDdXJyZW50VXNlckNvbmZpZyAmIHtcbiAgYWxsb3dlZEZpZWxkcz86IHN0cmluZ1tdXG4gIHVzZXJTbHVnOiBzdHJpbmdcbn1cblxuZXhwb3J0IGNvbnN0IGlzQWRtaW5XaXRoUm9sZXMgPVxuICAoY29uZmlnOiBBZG1pblJvbGVzQ29uZmlnID0ge30pOiBGaWVsZEFjY2VzcyA9PlxuICAoeyByZXEgfSkgPT4ge1xuICAgIGNvbnN0IHsgYWRtaW5Sb2xlcyA9IFsnYWRtaW4nXSB9ID0gY29uZmlnXG4gICAgaWYgKCFyZXE/LnVzZXIgfHwgIXJlcS51c2VyLnJvbGUgfHwgIWFkbWluUm9sZXMuaW5jbHVkZXMocmVxLnVzZXIucm9sZSkpIHJldHVybiBmYWxzZVxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuZXhwb3J0IGNvbnN0IGlzQWRtaW5PckN1cnJlbnRVc2VyV2l0aFJvbGVzID1cbiAgKGNvbmZpZzogQWRtaW5PckN1cnJlbnRVc2VyQ29uZmlnID0ge30pOiBBY2Nlc3MgPT5cbiAgKHsgcmVxIH0pID0+IHtcbiAgICBjb25zdCB7IGFkbWluUm9sZXMgPSBbJ2FkbWluJ10sIGlkRmllbGQgPSAnaWQnIH0gPSBjb25maWdcbiAgICBpZiAoaXNBZG1pbldpdGhSb2xlcyh7IGFkbWluUm9sZXMgfSkoeyByZXEgfSkpIHJldHVybiB0cnVlXG4gICAgaWYgKCFyZXE/LnVzZXIpIHJldHVybiBmYWxzZVxuICAgIHJldHVybiB7XG4gICAgICBbaWRGaWVsZF06IHtcbiAgICAgICAgZXF1YWxzOiByZXE/LnVzZXI/LmlkXG4gICAgICB9XG4gICAgfVxuICB9XG5cbmV4cG9ydCBjb25zdCBpc0FkbWluT3JDdXJyZW50VXNlclVwZGF0ZVdpdGhBbGxvd2VkRmllbGRzID0gKGNvbmZpZzogQWRtaW5PckN1cnJlbnRVc2VyVXBkYXRlQ29uZmlnKTogQWNjZXNzID0+IHtcbiAgcmV0dXJuIGFzeW5jICh7IHJlcSwgaWQsIGRhdGEgfSkgPT4ge1xuICAgIGNvbnN0IHsgYWRtaW5Sb2xlcyA9IFsnYWRtaW4nXSwgYWxsb3dlZEZpZWxkcyA9IFtdLCB1c2VyU2x1ZywgaWRGaWVsZCA9ICdpZCcgfSA9IGNvbmZpZ1xuICAgIGNvbnN0IHVzZXIgPSByZXEudXNlclxuXG4gICAgaWYgKGlzQWRtaW5XaXRoUm9sZXMoeyBhZG1pblJvbGVzIH0pKHsgcmVxIH0pKSByZXR1cm4gdHJ1ZVxuXG4gICAgaWYgKCF1c2VyKSByZXR1cm4gZmFsc2VcblxuICAgIGlmICh1c2VyW2lkRmllbGRdID09PSBpZCAmJiBkYXRhKSB7XG4gICAgICBjb25zdCBkYXRhS2V5cyA9IE9iamVjdC5rZXlzKGRhdGEpXG5cbiAgICAgIGNvbnN0IGhhc0N1cnJlbnRQYXNzd29yZCA9IGRhdGFLZXlzLmluY2x1ZGVzKCdjdXJyZW50UGFzc3dvcmQnKVxuICAgICAgY29uc3QgaGFzUGFzc3dvcmQgPSBkYXRhS2V5cy5pbmNsdWRlcygncGFzc3dvcmQnKVxuXG4gICAgICBpZiAoaGFzUGFzc3dvcmQgfHwgaGFzQ3VycmVudFBhc3N3b3JkKSB7XG4gICAgICAgIGlmICghKGhhc0N1cnJlbnRQYXNzd29yZCAmJiBoYXNQYXNzd29yZCkpIHJldHVybiBmYWxzZVxuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICghdXNlci5lbWFpbCkgcmV0dXJuIGZhbHNlXG5cbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZXEucGF5bG9hZC5sb2dpbih7XG4gICAgICAgICAgICBjb2xsZWN0aW9uOiB1c2VyU2x1ZyxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgZW1haWw6IHVzZXIuZW1haWwsXG4gICAgICAgICAgICAgIHBhc3N3b3JkOiBkYXRhLmN1cnJlbnRQYXNzd29yZFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpZiAoIXJlc3VsdCkgcmV0dXJuIGZhbHNlXG5cbiAgICAgICAgICBhbGxvd2VkRmllbGRzLnB1c2goJ3Bhc3N3b3JkJywgJ2N1cnJlbnRQYXNzd29yZCcpXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgaGFzRGlzYWxsb3dlZEZpZWxkID0gZGF0YUtleXMuc29tZSgoa2V5KSA9PiAhYWxsb3dlZEZpZWxkcy5pbmNsdWRlcyhrZXkpKVxuXG4gICAgICByZXR1cm4gIWhhc0Rpc2FsbG93ZWRGaWVsZFxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG4iXSwibmFtZXMiOlsiaXNBZG1pbldpdGhSb2xlcyIsImNvbmZpZyIsInJlcSIsImFkbWluUm9sZXMiLCJ1c2VyIiwicm9sZSIsImluY2x1ZGVzIiwiaXNBZG1pbk9yQ3VycmVudFVzZXJXaXRoUm9sZXMiLCJpZEZpZWxkIiwiZXF1YWxzIiwiaWQiLCJpc0FkbWluT3JDdXJyZW50VXNlclVwZGF0ZVdpdGhBbGxvd2VkRmllbGRzIiwiZGF0YSIsImFsbG93ZWRGaWVsZHMiLCJ1c2VyU2x1ZyIsImRhdGFLZXlzIiwiT2JqZWN0Iiwia2V5cyIsImhhc0N1cnJlbnRQYXNzd29yZCIsImhhc1Bhc3N3b3JkIiwiZW1haWwiLCJyZXN1bHQiLCJwYXlsb2FkIiwibG9naW4iLCJjb2xsZWN0aW9uIiwicGFzc3dvcmQiLCJjdXJyZW50UGFzc3dvcmQiLCJwdXNoIiwiZXJyb3IiLCJoYXNEaXNhbGxvd2VkRmllbGQiLCJzb21lIiwia2V5Il0sIm1hcHBpbmdzIjoiQUFlQSxPQUFPLE1BQU1BLG1CQUNYLENBQUNDLFNBQTJCLENBQUMsQ0FBQyxHQUM5QixDQUFDLEVBQUVDLEdBQUcsRUFBRTtRQUNOLE1BQU0sRUFBRUMsYUFBYTtZQUFDO1NBQVEsRUFBRSxHQUFHRjtRQUNuQyxJQUFJLENBQUNDLEtBQUtFLFFBQVEsQ0FBQ0YsSUFBSUUsSUFBSSxDQUFDQyxJQUFJLElBQUksQ0FBQ0YsV0FBV0csUUFBUSxDQUFDSixJQUFJRSxJQUFJLENBQUNDLElBQUksR0FBRyxPQUFPO1FBQ2hGLE9BQU87SUFDVCxFQUFDO0FBRUgsT0FBTyxNQUFNRSxnQ0FDWCxDQUFDTixTQUFtQyxDQUFDLENBQUMsR0FDdEMsQ0FBQyxFQUFFQyxHQUFHLEVBQUU7UUFDTixNQUFNLEVBQUVDLGFBQWE7WUFBQztTQUFRLEVBQUVLLFVBQVUsSUFBSSxFQUFFLEdBQUdQO1FBQ25ELElBQUlELGlCQUFpQjtZQUFFRztRQUFXLEdBQUc7WUFBRUQ7UUFBSSxJQUFJLE9BQU87UUFDdEQsSUFBSSxDQUFDQSxLQUFLRSxNQUFNLE9BQU87UUFDdkIsT0FBTztZQUNMLENBQUNJLFFBQVEsRUFBRTtnQkFDVEMsUUFBUVAsS0FBS0UsTUFBTU07WUFDckI7UUFDRjtJQUNGLEVBQUM7QUFFSCxPQUFPLE1BQU1DLDhDQUE4QyxDQUFDVjtJQUMxRCxPQUFPLE9BQU8sRUFBRUMsR0FBRyxFQUFFUSxFQUFFLEVBQUVFLElBQUksRUFBRTtRQUM3QixNQUFNLEVBQUVULGFBQWE7WUFBQztTQUFRLEVBQUVVLGdCQUFnQixFQUFFLEVBQUVDLFFBQVEsRUFBRU4sVUFBVSxJQUFJLEVBQUUsR0FBR1A7UUFDakYsTUFBTUcsT0FBT0YsSUFBSUUsSUFBSTtRQUVyQixJQUFJSixpQkFBaUI7WUFBRUc7UUFBVyxHQUFHO1lBQUVEO1FBQUksSUFBSSxPQUFPO1FBRXRELElBQUksQ0FBQ0UsTUFBTSxPQUFPO1FBRWxCLElBQUlBLElBQUksQ0FBQ0ksUUFBUSxLQUFLRSxNQUFNRSxNQUFNO1lBQ2hDLE1BQU1HLFdBQVdDLE9BQU9DLElBQUksQ0FBQ0w7WUFFN0IsTUFBTU0scUJBQXFCSCxTQUFTVCxRQUFRLENBQUM7WUFDN0MsTUFBTWEsY0FBY0osU0FBU1QsUUFBUSxDQUFDO1lBRXRDLElBQUlhLGVBQWVELG9CQUFvQjtnQkFDckMsSUFBSSxDQUFFQSxDQUFBQSxzQkFBc0JDLFdBQVUsR0FBSSxPQUFPO2dCQUNqRCxJQUFJO29CQUNGLElBQUksQ0FBQ2YsS0FBS2dCLEtBQUssRUFBRSxPQUFPO29CQUV4QixNQUFNQyxTQUFTLE1BQU1uQixJQUFJb0IsT0FBTyxDQUFDQyxLQUFLLENBQUM7d0JBQ3JDQyxZQUFZVjt3QkFDWkYsTUFBTTs0QkFDSlEsT0FBT2hCLEtBQUtnQixLQUFLOzRCQUNqQkssVUFBVWIsS0FBS2MsZUFBZTt3QkFDaEM7b0JBQ0Y7b0JBRUEsSUFBSSxDQUFDTCxRQUFRLE9BQU87b0JBRXBCUixjQUFjYyxJQUFJLENBQUMsWUFBWTtnQkFDakMsRUFBRSxPQUFPQyxPQUFPO29CQUNkLE9BQU87Z0JBQ1Q7WUFDRjtZQUVBLE1BQU1DLHFCQUFxQmQsU0FBU2UsSUFBSSxDQUFDLENBQUNDLE1BQVEsQ0FBQ2xCLGNBQWNQLFFBQVEsQ0FBQ3lCO1lBRTFFLE9BQU8sQ0FBQ0Y7UUFDVjtRQUVBLE9BQU87SUFDVDtBQUNGLEVBQUMifQ==