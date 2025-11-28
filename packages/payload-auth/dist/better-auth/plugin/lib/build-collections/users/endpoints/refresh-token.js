import { setCookieCache } from "better-auth/cookies";
import { getFieldsToSign, refreshOperation } from "payload";
import { getPayloadAuth } from "../../../get-payload-auth";
import { adminEndpoints } from "../../../../constants";
import { getSignedCookie } from "../../../../helpers/get-signed-cookie";
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
            const dontRememberTokenName = authContext.authCookies.dontRememberToken.name;
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
            const dontRememberMe = await getSignedCookie(cookieHeader, dontRememberTokenName, authContext.secret);
            await setCookieCache(ctx, {
                session: res.session,
                user: cookieCacheFields
            }, !!dontRememberMe);
            return response;
        }
    };
    return endpoint;
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3VzZXJzL2VuZHBvaW50cy9yZWZyZXNoLXRva2VuLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHNldENvb2tpZUNhY2hlIH0gZnJvbSAnYmV0dGVyLWF1dGgvY29va2llcydcbmltcG9ydCB7IHR5cGUgRW5kcG9pbnQsIGdldEZpZWxkc1RvU2lnbiwgcmVmcmVzaE9wZXJhdGlvbiwgVHlwZWRVc2VyIH0gZnJvbSAncGF5bG9hZCdcbmltcG9ydCB7IGdldFBheWxvYWRBdXRoIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2dldC1wYXlsb2FkLWF1dGgnXG5pbXBvcnQgeyBhZG1pbkVuZHBvaW50cyB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL2NvbnN0YW50cydcbmltcG9ydCB7IGdldFNpZ25lZENvb2tpZSB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL2hlbHBlcnMvZ2V0LXNpZ25lZC1jb29raWUnXG5pbXBvcnQgdHlwZSB7IEdlbmVyaWNFbmRwb2ludENvbnRleHQgfSBmcm9tICdiZXR0ZXItYXV0aCdcblxuZXhwb3J0IGNvbnN0IGdldFJlZnJlc2hUb2tlbkVuZHBvaW50ID0gKHVzZXJTbHVnOiBzdHJpbmcpOiBFbmRwb2ludCA9PiB7XG4gIGNvbnN0IGVuZHBvaW50OiBFbmRwb2ludCA9IHtcbiAgICBwYXRoOiBhZG1pbkVuZHBvaW50cy5yZWZyZXNoVG9rZW4sXG4gICAgbWV0aG9kOiAncG9zdCcsXG4gICAgaGFuZGxlcjogYXN5bmMgKHJlcSkgPT4ge1xuICAgICAgY29uc3QgcGF5bG9hZCA9IGF3YWl0IGdldFBheWxvYWRBdXRoKHJlcS5wYXlsb2FkLmNvbmZpZylcbiAgICAgIGNvbnN0IGF1dGhDb250ZXh0ID0gYXdhaXQgcGF5bG9hZC5iZXR0ZXJBdXRoPy4kY29udGV4dFxuICAgICAgY29uc3QgdXNlckNvbGxlY3Rpb24gPSBwYXlsb2FkLmNvbGxlY3Rpb25zW3VzZXJTbHVnXVxuXG4gICAgICBpZiAoIXVzZXJDb2xsZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoeyBtZXNzYWdlOiAnVXNlciBjb2xsZWN0aW9uIG5vdCBmb3VuZCcgfSksIHtcbiAgICAgICAgICBzdGF0dXM6IDUwMFxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICBpZiAoIXBheWxvYWQuYmV0dGVyQXV0aCB8fCAhYXV0aENvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IG1lc3NhZ2U6ICdCZXR0ZXJBdXRoIG5vdCBpbml0aWFsaXplZCcgfSksIHtcbiAgICAgICAgICBzdGF0dXM6IDUwMFxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICBjb25zdCBzZXNzaW9uVG9rZW5OYW1lID0gYXV0aENvbnRleHQuYXV0aENvb2tpZXMuc2Vzc2lvblRva2VuLm5hbWVcbiAgICAgIGNvbnN0IGNvb2tpZUhlYWRlciA9IHJlcS5oZWFkZXJzLmdldCgnY29va2llJykgfHwgJydcbiAgICAgIGNvbnN0IGhhc1Nlc3Npb25Ub2tlbiA9IGNvb2tpZUhlYWRlci5pbmNsdWRlcyhgJHtzZXNzaW9uVG9rZW5OYW1lfT1gKVxuICAgICAgY29uc3QgZG9udFJlbWVtYmVyVG9rZW5OYW1lID0gYXV0aENvbnRleHQuYXV0aENvb2tpZXMuZG9udFJlbWVtYmVyVG9rZW4ubmFtZVxuXG4gICAgICBpZiAoIWhhc1Nlc3Npb25Ub2tlbikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJlZnJlc2hPcGVyYXRpb24oe1xuICAgICAgICAgICAgY29sbGVjdGlvbjogdXNlckNvbGxlY3Rpb24sXG4gICAgICAgICAgICByZXFcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkocmVzdWx0KSwgeyBzdGF0dXM6IDIwMCB9KVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1Rva2VuIHJlZnJlc2ggZmFpbGVkOicsIGVycm9yKVxuICAgICAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoeyBtZXNzYWdlOiAnVG9rZW4gcmVmcmVzaCBmYWlsZWQnIH0pLCB7IHN0YXR1czogNDAxIH0pXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVzID0gYXdhaXQgcGF5bG9hZC5iZXR0ZXJBdXRoLmFwaS5nZXRTZXNzaW9uKHtcbiAgICAgICAgaGVhZGVyczogcmVxLmhlYWRlcnMsXG4gICAgICAgIHF1ZXJ5OiB7IGRpc2FibGVDb29raWVDYWNoZTogdHJ1ZSB9XG4gICAgICB9KVxuXG4gICAgICBpZiAoIXJlcykge1xuICAgICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgbWVzc2FnZTogJ05vIGN1cnJlbnQgc2Vzc2lvbicgfSksIHtcbiAgICAgICAgICBzdGF0dXM6IDQwMVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICBjb25zdCB1c2VyID0gYXdhaXQgcGF5bG9hZC5maW5kQnlJRCh7XG4gICAgICAgIGNvbGxlY3Rpb246IHVzZXJTbHVnIGFzIHN0cmluZyxcbiAgICAgICAgaWQ6IHJlcy5zZXNzaW9uLnVzZXJJZFxuICAgICAgfSlcblxuICAgICAgaWYgKCF1c2VyKSB7XG4gICAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkoeyBtZXNzYWdlOiAnTm8gdXNlciBmb3VuZCcgfSksIHtcbiAgICAgICAgICBzdGF0dXM6IDQwMVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICBjb25zdCBjb29raWVDYWNoZUZpZWxkcyA9IGdldEZpZWxkc1RvU2lnbih7XG4gICAgICAgIGNvbGxlY3Rpb25Db25maWc6IHVzZXJDb2xsZWN0aW9uPy5jb25maWcsXG4gICAgICAgIGVtYWlsOiB1c2VyLmVtYWlsLFxuICAgICAgICB1c2VyOiB1c2VyIGFzIFR5cGVkVXNlclxuICAgICAgfSlcblxuICAgICAgY29uc3QgcmVzcG9uc2VEYXRhID0ge1xuICAgICAgICByZWZyZXNoZWRUb2tlbjogbnVsbCxcbiAgICAgICAgc2V0Q29va2llOiAhIWF1dGhDb250ZXh0Lm9wdGlvbnMuc2Vzc2lvbj8uY29va2llQ2FjaGU/LmVuYWJsZWQsXG4gICAgICAgIHN0cmF0ZWd5OiAnYmV0dGVyLWF1dGgnLFxuICAgICAgICB1c2VyOiB7IC4uLnVzZXIsIGNvbGxlY3Rpb246IHVzZXJTbHVnIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBuZXcgUmVzcG9uc2UoSlNPTi5zdHJpbmdpZnkocmVzcG9uc2VEYXRhKSwge1xuICAgICAgICBzdGF0dXM6IDIwMFxuICAgICAgfSlcblxuICAgICAgY29uc3QgY3R4ID0ge1xuICAgICAgICBjb250ZXh0OiBhdXRoQ29udGV4dCxcbiAgICAgICAgc2V0Q29va2llKG5hbWUsIHZhbHVlLCBvcHRpb25zKSB7XG4gICAgICAgICAgY29uc3QgcGF0aCA9IG9wdGlvbnM/LnBhdGggfHwgJy8nXG4gICAgICAgICAgY29uc3QgbWF4QWdlID0gb3B0aW9ucz8ubWF4QWdlID8gYDsgTWF4LUFnZT0ke29wdGlvbnMubWF4QWdlfWAgOiAnJ1xuICAgICAgICAgIGNvbnN0IGh0dHBPbmx5ID0gb3B0aW9ucz8uaHR0cE9ubHkgPyAnOyBIdHRwT25seScgOiAnJ1xuICAgICAgICAgIGNvbnN0IHNlY3VyZSA9IG9wdGlvbnM/LnNlY3VyZSA/ICc7IFNlY3VyZScgOiAnJ1xuICAgICAgICAgIGNvbnN0IHNhbWVTaXRlID0gb3B0aW9ucz8uc2FtZVNpdGUgPyBgOyBTYW1lU2l0ZT0ke29wdGlvbnMuc2FtZVNpdGV9YCA6ICc7IFNhbWVTaXRlPUxheCdcblxuICAgICAgICAgIHJlc3BvbnNlLmhlYWRlcnMuc2V0KCdTZXQtQ29va2llJywgYCR7bmFtZX09JHt2YWx1ZX07IFBhdGg9JHtwYXRofSR7bWF4QWdlfSR7aHR0cE9ubHl9JHtzZWN1cmV9JHtzYW1lU2l0ZX1gKVxuICAgICAgICAgIHJldHVybiBuYW1lXG4gICAgICAgIH1cbiAgICAgIH0gYXMgR2VuZXJpY0VuZHBvaW50Q29udGV4dFxuXG4gICAgICBjb25zdCBkb250UmVtZW1iZXJNZSA9IGF3YWl0IGdldFNpZ25lZENvb2tpZShjb29raWVIZWFkZXIsIGRvbnRSZW1lbWJlclRva2VuTmFtZSwgYXV0aENvbnRleHQuc2VjcmV0KVxuXG4gICAgICBhd2FpdCBzZXRDb29raWVDYWNoZShcbiAgICAgICAgY3R4LFxuICAgICAgICB7XG4gICAgICAgICAgc2Vzc2lvbjogcmVzLnNlc3Npb24sXG4gICAgICAgICAgdXNlcjogY29va2llQ2FjaGVGaWVsZHMgYXMgYW55XG4gICAgICAgIH0sXG4gICAgICAgICEhZG9udFJlbWVtYmVyTWVcbiAgICAgIClcblxuICAgICAgcmV0dXJuIHJlc3BvbnNlXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGVuZHBvaW50XG59XG4iXSwibmFtZXMiOlsic2V0Q29va2llQ2FjaGUiLCJnZXRGaWVsZHNUb1NpZ24iLCJyZWZyZXNoT3BlcmF0aW9uIiwiZ2V0UGF5bG9hZEF1dGgiLCJhZG1pbkVuZHBvaW50cyIsImdldFNpZ25lZENvb2tpZSIsImdldFJlZnJlc2hUb2tlbkVuZHBvaW50IiwidXNlclNsdWciLCJlbmRwb2ludCIsInBhdGgiLCJyZWZyZXNoVG9rZW4iLCJtZXRob2QiLCJoYW5kbGVyIiwicmVxIiwicGF5bG9hZCIsImNvbmZpZyIsImF1dGhDb250ZXh0IiwiYmV0dGVyQXV0aCIsIiRjb250ZXh0IiwidXNlckNvbGxlY3Rpb24iLCJjb2xsZWN0aW9ucyIsIlJlc3BvbnNlIiwiSlNPTiIsInN0cmluZ2lmeSIsIm1lc3NhZ2UiLCJzdGF0dXMiLCJzZXNzaW9uVG9rZW5OYW1lIiwiYXV0aENvb2tpZXMiLCJzZXNzaW9uVG9rZW4iLCJuYW1lIiwiY29va2llSGVhZGVyIiwiaGVhZGVycyIsImdldCIsImhhc1Nlc3Npb25Ub2tlbiIsImluY2x1ZGVzIiwiZG9udFJlbWVtYmVyVG9rZW5OYW1lIiwiZG9udFJlbWVtYmVyVG9rZW4iLCJyZXN1bHQiLCJjb2xsZWN0aW9uIiwiZXJyb3IiLCJjb25zb2xlIiwicmVzIiwiYXBpIiwiZ2V0U2Vzc2lvbiIsInF1ZXJ5IiwiZGlzYWJsZUNvb2tpZUNhY2hlIiwidXNlciIsImZpbmRCeUlEIiwiaWQiLCJzZXNzaW9uIiwidXNlcklkIiwiY29va2llQ2FjaGVGaWVsZHMiLCJjb2xsZWN0aW9uQ29uZmlnIiwiZW1haWwiLCJyZXNwb25zZURhdGEiLCJyZWZyZXNoZWRUb2tlbiIsInNldENvb2tpZSIsIm9wdGlvbnMiLCJjb29raWVDYWNoZSIsImVuYWJsZWQiLCJzdHJhdGVneSIsInJlc3BvbnNlIiwiY3R4IiwiY29udGV4dCIsInZhbHVlIiwibWF4QWdlIiwiaHR0cE9ubHkiLCJzZWN1cmUiLCJzYW1lU2l0ZSIsInNldCIsImRvbnRSZW1lbWJlck1lIiwic2VjcmV0Il0sIm1hcHBpbmdzIjoiQUFBQSxTQUFTQSxjQUFjLFFBQVEsc0JBQXFCO0FBQ3BELFNBQXdCQyxlQUFlLEVBQUVDLGdCQUFnQixRQUFtQixVQUFTO0FBQ3JGLFNBQVNDLGNBQWMsUUFBUSw0QkFBMkM7QUFDMUUsU0FBU0MsY0FBYyxRQUFRLHdCQUFnQztBQUMvRCxTQUFTQyxlQUFlLFFBQVEsd0NBQWdEO0FBR2hGLE9BQU8sTUFBTUMsMEJBQTBCLENBQUNDO0lBQ3RDLE1BQU1DLFdBQXFCO1FBQ3pCQyxNQUFNTCxlQUFlTSxZQUFZO1FBQ2pDQyxRQUFRO1FBQ1JDLFNBQVMsT0FBT0M7WUFDZCxNQUFNQyxVQUFVLE1BQU1YLGVBQWVVLElBQUlDLE9BQU8sQ0FBQ0MsTUFBTTtZQUN2RCxNQUFNQyxjQUFjLE1BQU1GLFFBQVFHLFVBQVUsRUFBRUM7WUFDOUMsTUFBTUMsaUJBQWlCTCxRQUFRTSxXQUFXLENBQUNiLFNB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