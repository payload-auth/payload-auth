import { setCookieCache } from "better-auth/cookies";
import { getFieldsToSign, refreshOperation } from "payload";
import { getPayloadAuth } from "../../../get-payload-auth";
import { adminEndpoints } from "../../../../constants";
export const getRefreshTokenEndpoint = (userSlug)=>{
    const endpoint = {
        path: adminEndpoints.refreshToken,
        method: 'post',
        handler: async (req)=>{
            const payload = await getPayloadAuth(req.payload.config);
            const authContext = await payload.betterAuth?.$context;
            const userCollection = payload.collections[userSlug];
            if (!userCollection) {
                return new Response(JSON.stringify({
                    message: 'User collection not found'
                }), {
                    status: 500
                });
            }
            if (!payload.betterAuth || !authContext) {
                return new Response(JSON.stringify({
                    message: 'BetterAuth not initialized'
                }), {
                    status: 500
                });
            }
            const sessionTokenName = authContext.authCookies.sessionToken.name;
            const cookieHeader = req.headers.get('cookie') || '';
            const hasSessionToken = cookieHeader.includes(`${sessionTokenName}=`);
            if (!hasSessionToken) {
                try {
                    const result = await refreshOperation({
                        collection: userCollection,
                        req
                    });
                    return new Response(JSON.stringify(result), {
                        status: 200
                    });
                } catch (error) {
                    console.error('Token refresh failed:', error);
                    return new Response(JSON.stringify({
                        message: 'Token refresh failed'
                    }), {
                        status: 401
                    });
                }
            }
            const res = await payload.betterAuth.api.getSession({
                headers: req.headers,
                query: {
                    disableCookieCache: true
                }
            });
            if (!res) {
                return new Response(JSON.stringify({
                    message: 'No current session'
                }), {
                    status: 401
                });
            }
            const user = await payload.findByID({
                collection: userSlug,
                id: res.session.userId
            });
            if (!user) {
                return new Response(JSON.stringify({
                    message: 'No user found'
                }), {
                    status: 401
                });
            }
            const cookieCacheFields = getFieldsToSign({
                collectionConfig: userCollection?.config,
                email: user.email,
                user: user
            });
            const responseData = {
                refreshedToken: null,
                setCookie: !!authContext.options.session?.cookieCache?.enabled,
                strategy: 'better-auth',
                user: {
                    ...user,
                    collection: userSlug
                }
            };
            const response = new Response(JSON.stringify(responseData), {
                status: 200
            });
            const ctx = {
                context: authContext,
                setCookie (name, value, options) {
                    const path = options?.path || '/';
                    const maxAge = options?.maxAge ? `; Max-Age=${options.maxAge}` : '';
                    const httpOnly = options?.httpOnly ? '; HttpOnly' : '';
                    const secure = options?.secure ? '; Secure' : '';
                    const sameSite = options?.sameSite ? `; SameSite=${options.sameSite}` : '; SameSite=Lax';
                    response.headers.set('Set-Cookie', `${name}=${value}; Path=${path}${maxAge}${httpOnly}${secure}${sameSite}`);
                    return name;
                }
            };
            await setCookieCache(ctx, {
                session: res.session,
                user: cookieCacheFields
            }, false);
            return response;
        }
    };
    return endpoint;
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3VzZXJzL2VuZHBvaW50cy9yZWZyZXNoLXRva2VuLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHNldENvb2tpZUNhY2hlIH0gZnJvbSAnYmV0dGVyLWF1dGgvY29va2llcydcbmltcG9ydCB7IHR5cGUgRW5kcG9pbnQsIGdldEZpZWxkc1RvU2lnbiwgcmVmcmVzaE9wZXJhdGlvbiwgVXNlciB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgeyBHZW5lcmljRW5kcG9pbnRDb250ZXh0IH0gZnJvbSAnYmV0dGVyLWF1dGgvdHlwZXMnXG5pbXBvcnQgeyBnZXRQYXlsb2FkQXV0aCB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL2xpYi9nZXQtcGF5bG9hZC1hdXRoJ1xuaW1wb3J0IHsgYWRtaW5FbmRwb2ludHMgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi9jb25zdGFudHMnXG5cbmV4cG9ydCBjb25zdCBnZXRSZWZyZXNoVG9rZW5FbmRwb2ludCA9ICh1c2VyU2x1Zzogc3RyaW5nKTogRW5kcG9pbnQgPT4ge1xuICBjb25zdCBlbmRwb2ludDogRW5kcG9pbnQgPSB7XG4gICAgcGF0aDogYWRtaW5FbmRwb2ludHMucmVmcmVzaFRva2VuLFxuICAgIG1ldGhvZDogJ3Bvc3QnLFxuICAgIGhhbmRsZXI6IGFzeW5jIChyZXEpID0+IHtcbiAgICAgIGNvbnN0IHBheWxvYWQgPSBhd2FpdCBnZXRQYXlsb2FkQXV0aChyZXEucGF5bG9hZC5jb25maWcpXG4gICAgICBjb25zdCBhdXRoQ29udGV4dCA9IGF3YWl0IHBheWxvYWQuYmV0dGVyQXV0aD8uJGNvbnRleHRcbiAgICAgIGNvbnN0IHVzZXJDb2xsZWN0aW9uID0gcGF5bG9hZC5jb2xsZWN0aW9uc1t1c2VyU2x1Z11cblxuICAgICAgaWYgKCF1c2VyQ29sbGVjdGlvbikge1xuICAgICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgbWVzc2FnZTogJ1VzZXIgY29sbGVjdGlvbiBub3QgZm91bmQnIH0pLCB7XG4gICAgICAgICAgc3RhdHVzOiA1MDBcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgaWYgKCFwYXlsb2FkLmJldHRlckF1dGggfHwgIWF1dGhDb250ZXh0KSB7XG4gICAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoeyBtZXNzYWdlOiAnQmV0dGVyQXV0aCBub3QgaW5pdGlhbGl6ZWQnIH0pLCB7XG4gICAgICAgICAgc3RhdHVzOiA1MDBcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc2Vzc2lvblRva2VuTmFtZSA9IGF1dGhDb250ZXh0LmF1dGhDb29raWVzLnNlc3Npb25Ub2tlbi5uYW1lXG4gICAgICBjb25zdCBjb29raWVIZWFkZXIgPSByZXEuaGVhZGVycy5nZXQoJ2Nvb2tpZScpIHx8ICcnXG4gICAgICBjb25zdCBoYXNTZXNzaW9uVG9rZW4gPSBjb29raWVIZWFkZXIuaW5jbHVkZXMoYCR7c2Vzc2lvblRva2VuTmFtZX09YClcblxuICAgICAgaWYgKCFoYXNTZXNzaW9uVG9rZW4pIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZWZyZXNoT3BlcmF0aW9uKHtcbiAgICAgICAgICAgIGNvbGxlY3Rpb246IHVzZXJDb2xsZWN0aW9uLFxuICAgICAgICAgICAgcmVxXG4gICAgICAgICAgfSlcbiAgICAgICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHJlc3VsdCksIHsgc3RhdHVzOiAyMDAgfSlcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdUb2tlbiByZWZyZXNoIGZhaWxlZDonLCBlcnJvcilcbiAgICAgICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgbWVzc2FnZTogJ1Rva2VuIHJlZnJlc2ggZmFpbGVkJyB9KSwgeyBzdGF0dXM6IDQwMSB9KVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IHBheWxvYWQuYmV0dGVyQXV0aC5hcGkuZ2V0U2Vzc2lvbih7XG4gICAgICAgIGhlYWRlcnM6IHJlcS5oZWFkZXJzLFxuICAgICAgICBxdWVyeTogeyBkaXNhYmxlQ29va2llQ2FjaGU6IHRydWUgfVxuICAgICAgfSlcblxuICAgICAgaWYgKCFyZXMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IG1lc3NhZ2U6ICdObyBjdXJyZW50IHNlc3Npb24nIH0pLCB7XG4gICAgICAgICAgc3RhdHVzOiA0MDFcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgY29uc3QgdXNlciA9IGF3YWl0IHBheWxvYWQuZmluZEJ5SUQoe1xuICAgICAgICBjb2xsZWN0aW9uOiB1c2VyU2x1ZyBhcyBzdHJpbmcsXG4gICAgICAgIGlkOiByZXMuc2Vzc2lvbi51c2VySWRcbiAgICAgIH0pXG5cbiAgICAgIGlmICghdXNlcikge1xuICAgICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgbWVzc2FnZTogJ05vIHVzZXIgZm91bmQnIH0pLCB7XG4gICAgICAgICAgc3RhdHVzOiA0MDFcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgY29uc3QgY29va2llQ2FjaGVGaWVsZHMgPSBnZXRGaWVsZHNUb1NpZ24oe1xuICAgICAgICBjb2xsZWN0aW9uQ29uZmlnOiB1c2VyQ29sbGVjdGlvbj8uY29uZmlnLFxuICAgICAgICBlbWFpbDogdXNlci5lbWFpbCxcbiAgICAgICAgdXNlcjogdXNlciBhcyBVc2VyXG4gICAgICB9KVxuXG4gICAgICBjb25zdCByZXNwb25zZURhdGEgPSB7XG4gICAgICAgIHJlZnJlc2hlZFRva2VuOiBudWxsLFxuICAgICAgICBzZXRDb29raWU6ICEhYXV0aENvbnRleHQub3B0aW9ucy5zZXNzaW9uPy5jb29raWVDYWNoZT8uZW5hYmxlZCxcbiAgICAgICAgc3RyYXRlZ3k6ICdiZXR0ZXItYXV0aCcsXG4gICAgICAgIHVzZXI6IHsgLi4udXNlciwgY29sbGVjdGlvbjogdXNlclNsdWcgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCByZXNwb25zZSA9IG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeShyZXNwb25zZURhdGEpLCB7XG4gICAgICAgIHN0YXR1czogMjAwXG4gICAgICB9KVxuXG4gICAgICBjb25zdCBjdHggPSB7XG4gICAgICAgIGNvbnRleHQ6IGF1dGhDb250ZXh0LFxuICAgICAgICBzZXRDb29raWUobmFtZSwgdmFsdWUsIG9wdGlvbnMpIHtcbiAgICAgICAgICBjb25zdCBwYXRoID0gb3B0aW9ucz8ucGF0aCB8fCAnLydcbiAgICAgICAgICBjb25zdCBtYXhBZ2UgPSBvcHRpb25zPy5tYXhBZ2UgPyBgOyBNYXgtQWdlPSR7b3B0aW9ucy5tYXhBZ2V9YCA6ICcnXG4gICAgICAgICAgY29uc3QgaHR0cE9ubHkgPSBvcHRpb25zPy5odHRwT25seSA/ICc7IEh0dHBPbmx5JyA6ICcnXG4gICAgICAgICAgY29uc3Qgc2VjdXJlID0gb3B0aW9ucz8uc2VjdXJlID8gJzsgU2VjdXJlJyA6ICcnXG4gICAgICAgICAgY29uc3Qgc2FtZVNpdGUgPSBvcHRpb25zPy5zYW1lU2l0ZSA/IGA7IFNhbWVTaXRlPSR7b3B0aW9ucy5zYW1lU2l0ZX1gIDogJzsgU2FtZVNpdGU9TGF4J1xuXG4gICAgICAgICAgcmVzcG9uc2UuaGVhZGVycy5zZXQoJ1NldC1Db29raWUnLCBgJHtuYW1lfT0ke3ZhbHVlfTsgUGF0aD0ke3BhdGh9JHttYXhBZ2V9JHtodHRwT25seX0ke3NlY3VyZX0ke3NhbWVTaXRlfWApXG4gICAgICAgICAgcmV0dXJuIG5hbWVcbiAgICAgICAgfVxuICAgICAgfSBhcyBHZW5lcmljRW5kcG9pbnRDb250ZXh0XG5cbiAgICAgIGF3YWl0IHNldENvb2tpZUNhY2hlKGN0eCwge1xuICAgICAgICBzZXNzaW9uOiByZXMuc2Vzc2lvbixcbiAgICAgICAgdXNlcjogY29va2llQ2FjaGVGaWVsZHMgYXMgYW55XG4gICAgICB9LCBmYWxzZSlcblxuICAgICAgcmV0dXJuIHJlc3BvbnNlXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGVuZHBvaW50XG59XG4iXSwibmFtZXMiOlsic2V0Q29va2llQ2FjaGUiLCJnZXRGaWVsZHNUb1NpZ24iLCJyZWZyZXNoT3BlcmF0aW9uIiwiZ2V0UGF5bG9hZEF1dGgiLCJhZG1pbkVuZHBvaW50cyIsImdldFJlZnJlc2hUb2tlbkVuZHBvaW50IiwidXNlclNsdWciLCJlbmRwb2ludCIsInBhdGgiLCJyZWZyZXNoVG9rZW4iLCJtZXRob2QiLCJoYW5kbGVyIiwicmVxIiwicGF5bG9hZCIsImNvbmZpZyIsImF1dGhDb250ZXh0IiwiYmV0dGVyQXV0aCIsIiRjb250ZXh0IiwidXNlckNvbGxlY3Rpb24iLCJjb2xsZWN0aW9ucyIsIlJlc3BvbnNlIiwiSlNPTiIsInN0cmluZ2lmeSIsIm1lc3NhZ2UiLCJzdGF0dXMiLCJzZXNzaW9uVG9rZW5OYW1lIiwiYXV0aENvb2tpZXMiLCJzZXNzaW9uVG9rZW4iLCJuYW1lIiwiY29va2llSGVhZGVyIiwiaGVhZGVycyIsImdldCIsImhhc1Nlc3Npb25Ub2tlbiIsImluY2x1ZGVzIiwicmVzdWx0IiwiY29sbGVjdGlvbiIsImVycm9yIiwiY29uc29sZSIsInJlcyIsImFwaSIsImdldFNlc3Npb24iLCJxdWVyeSIsImRpc2FibGVDb29raWVDYWNoZSIsInVzZXIiLCJmaW5kQnlJRCIsImlkIiwic2Vzc2lvbiIsInVzZXJJZCIsImNvb2tpZUNhY2hlRmllbGRzIiwiY29sbGVjdGlvbkNvbmZpZyIsImVtYWlsIiwicmVzcG9uc2VEYXRhIiwicmVmcmVzaGVkVG9rZW4iLCJzZXRDb29raWUiLCJvcHRpb25zIiwiY29va2llQ2FjaGUiLCJlbmFibGVkIiwic3RyYXRlZ3kiLCJyZXNwb25zZSIsImN0eCIsImNvbnRleHQiLCJ2YWx1ZSIsIm1heEFnZSIsImh0dHBPbmx5Iiwic2VjdXJlIiwic2FtZVNpdGUiLCJzZXQiXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLGNBQWMsUUFBUSxzQkFBcUI7QUFDcEQsU0FBd0JDLGVBQWUsRUFBRUMsZ0JBQWdCLFFBQWMsVUFBUztBQUVoRixTQUFTQyxjQUFjLFFBQVEsNEJBQTJDO0FBQzFFLFNBQVNDLGNBQWMsUUFBUSx3QkFBZ0M7QUFFL0QsT0FBTyxNQUFNQywwQkFBMEIsQ0FBQ0M7SUFDdEMsTUFBTUMsV0FBcUI7UUFDekJDLE1BQU1KLGVBQWVLLFlBQVk7UUFDakNDLFFBQVE7UUFDUkMsU0FBUyxPQUFPQztZQUNkLE1BQU1DLFVBQVUsTUFBTVYsZUFBZVMsSUFBSUMsT0FBTyxDQUFDQyxNQUFNO1lBQ3ZELE1BQU1DLGNBQWMsTUFBTUYsUUFBUUcsVUFBVSxFQUFFQztZQUM5QyxNQUFNQyxpQkFBaUJMLFFBQVFNLFdBQVcsQ0FBQ2IsU0FBUztZQUVwRCxJQUFJLENBQUNZLGdCQUFnQjtnQkFDbkIsT0FBTyxJQUFJRSxTQUFTQyxLQUFLQyxTQUFTLENBQUM7b0JBQUVDLFNBQVM7Z0JBQTRCLElBQUk7b0JBQzVFQyxRQUFRO2dCQUNWO1lBQ0Y7WUFFQSxJQUFJLENBQUNYLFFBQVFHLFVBQVUsSUFBSSxDQUFDRCxhQUFhO2dCQUN2QyxPQUFPLElBQUlLLFNBQVNDLEtBQUtDLFNBQVMsQ0FBQztvQkFBRUMsU0FBUztnQkFBNkIsSUFBSTtvQkFDN0VDLFFBQVE7Z0JBQ1Y7WUFDRjtZQUVBLE1BQU1DLG1CQUFtQlYsWUFBWVcsV0FBVyxDQUFDQyxZQUFZLENBQUNDLElBQUk7WUFDbEUsTUFBTUMsZUFBZWpCLElBQUlrQixPQUFPLENBQUNDLEdBQUcsQ0FBQyxhQUFhO1lBQ2xELE1BQU1DLGtCQUFrQkgsYUFBYUksUUFBUSxDQUFDLEdBQUdSLGlCQUFpQixDQUFDLENBQUM7WUFFcEUsSUFBSSxDQUFDTyxpQkFBaUI7Z0JBQ3BCLElBQUk7b0JBQ0YsTUFBTUUs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