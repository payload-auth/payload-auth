import { baModelKey } from "../../../../constants";
import { getCollectionByModelKey } from "../../../../helpers/get-collection";
import { getIp } from "../../../../helpers/get-ip";
import { prepareSessionData } from "../../../../helpers/prepare-session-data";
import { getPayloadAuth } from "../../../get-payload-auth";
import { generateId } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import { parseSetCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
/**
 * This hook is used to sync the admin login token with better-auth session token
 * It also creates a new session in better-auth
 */ export function getAfterLoginHook() {
    const hook = async ({ req, user })=>{
        const config = req.payload.config;
        const payload = await getPayloadAuth(config);
        const collections = req.payload.collections;
        const userCollection = getCollectionByModelKey(collections, baModelKey.user);
        const sessionCollection = getCollectionByModelKey(collections, baModelKey.session);
        const cookieStore = await cookies();
        const authContext = await payload.betterAuth.$context;
        const sessionExpiration = payload.betterAuth.options.session?.expiresIn || 60 * 60 * 24 * 7 // 7 days
        ;
        // we can't use internal adapter as we can cause a race condition unless we pass req to the payload.create
        const session = await payload.create({
            collection: sessionCollection.slug,
            data: {
                ipAddress: getIp(req.headers, payload.betterAuth.options) || '',
                userAgent: req.headers?.get('user-agent') || '',
                user: user.id,
                token: generateId(32),
                expiresAt: new Date(Date.now() + sessionExpiration * 1000)
            },
            req
        });
        const betterAuthHandleRequest = createAuthMiddleware(async (ctx)=>{
            ctx.context = {
                ...authContext,
                user: user
            };
            await ctx.setSignedCookie(ctx.context.authCookies.sessionToken.name, session.token, ctx.context.secret, ctx.context.authCookies.sessionToken.options);
            const filteredSessionData = await prepareSessionData({
                sessionData: {
                    session,
                    user
                },
                usersCollection: userCollection,
                sessionsCollection: sessionCollection
            });
            if (filteredSessionData) {
                await setSessionCookie(ctx, filteredSessionData);
            }
            if ('responseHeaders' in ctx) {
                return ctx.responseHeaders;
            }
            return null;
        });
        // Create a modified request object that matches the expected MiddlewareInputContext type
        const modifiedReq = {
            ...req,
            body: undefined // Explicitly set body to undefined to satisfy type constraint
        };
        const responseHeaders = await betterAuthHandleRequest(modifiedReq);
        const responseCookies = responseHeaders?.getSetCookie().map((cookie)=>parseSetCookie(cookie)).filter(Boolean);
        if (responseCookies) {
            for (const cookieData of responseCookies){
                const { name, value, ...options } = cookieData;
                cookieStore.set({
                    ...options,
                    name,
                    value: decodeURIComponent(value)
                });
            }
        }
    };
    return hook;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3VzZXJzL2hvb2tzL2FmdGVyLWxvZ2luLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGJhTW9kZWxLZXkgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi9jb25zdGFudHMnXG5pbXBvcnQgeyBnZXRDb2xsZWN0aW9uQnlNb2RlbEtleSB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL2hlbHBlcnMvZ2V0LWNvbGxlY3Rpb24nXG5pbXBvcnQgeyBnZXRJcCB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL2hlbHBlcnMvZ2V0LWlwJ1xuaW1wb3J0IHsgcHJlcGFyZVNlc3Npb25EYXRhIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vaGVscGVycy9wcmVwYXJlLXNlc3Npb24tZGF0YSdcbmltcG9ydCB7IGdldFBheWxvYWRBdXRoIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2dldC1wYXlsb2FkLWF1dGgnXG5pbXBvcnQgeyBnZW5lcmF0ZUlkLCBTZXNzaW9uIH0gZnJvbSAnYmV0dGVyLWF1dGgnXG5pbXBvcnQgeyBjcmVhdGVBdXRoTWlkZGxld2FyZSB9IGZyb20gJ2JldHRlci1hdXRoL2FwaSdcbmltcG9ydCB7IHNldFNlc3Npb25Db29raWUgfSBmcm9tICdiZXR0ZXItYXV0aC9jb29raWVzJ1xuaW1wb3J0IHsgcGFyc2VTZXRDb29raWUsIHR5cGUgUmVzcG9uc2VDb29raWUgfSBmcm9tICduZXh0L2Rpc3QvY29tcGlsZWQvQGVkZ2UtcnVudGltZS9jb29raWVzJ1xuaW1wb3J0IHsgY29va2llcyB9IGZyb20gJ25leHQvaGVhZGVycydcbmltcG9ydCB7IENvbGxlY3Rpb25BZnRlckxvZ2luSG9vayB9IGZyb20gJ3BheWxvYWQnXG4vKipcbiAqIFRoaXMgaG9vayBpcyB1c2VkIHRvIHN5bmMgdGhlIGFkbWluIGxvZ2luIHRva2VuIHdpdGggYmV0dGVyLWF1dGggc2Vzc2lvbiB0b2tlblxuICogSXQgYWxzbyBjcmVhdGVzIGEgbmV3IHNlc3Npb24gaW4gYmV0dGVyLWF1dGhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFmdGVyTG9naW5Ib29rKCkge1xuICBjb25zdCBob29rOiBDb2xsZWN0aW9uQWZ0ZXJMb2dpbkhvb2sgPSBhc3luYyAoeyByZXEsIHVzZXIgfSkgPT4ge1xuICAgIGNvbnN0IGNvbmZpZyA9IHJlcS5wYXlsb2FkLmNvbmZpZ1xuICAgIGNvbnN0IHBheWxvYWQgPSBhd2FpdCBnZXRQYXlsb2FkQXV0aChjb25maWcpXG4gICAgY29uc3QgY29sbGVjdGlvbnMgPSByZXEucGF5bG9hZC5jb2xsZWN0aW9uc1xuICAgIGNvbnN0IHVzZXJDb2xsZWN0aW9uID0gZ2V0Q29sbGVjdGlvbkJ5TW9kZWxLZXkoY29sbGVjdGlvbnMsIGJhTW9kZWxLZXkudXNlcilcbiAgICBjb25zdCBzZXNzaW9uQ29sbGVjdGlvbiA9IGdldENvbGxlY3Rpb25CeU1vZGVsS2V5KGNvbGxlY3Rpb25zLCBiYU1vZGVsS2V5LnNlc3Npb24pXG4gICAgY29uc3QgY29va2llU3RvcmUgPSBhd2FpdCBjb29raWVzKClcbiAgICBjb25zdCBhdXRoQ29udGV4dCA9IGF3YWl0IHBheWxvYWQuYmV0dGVyQXV0aC4kY29udGV4dFxuICAgIGNvbnN0IHNlc3Npb25FeHBpcmF0aW9uID0gcGF5bG9hZC5iZXR0ZXJBdXRoLm9wdGlvbnMuc2Vzc2lvbj8uZXhwaXJlc0luIHx8IDYwICogNjAgKiAyNCAqIDcgLy8gNyBkYXlzXG4gICAgLy8gd2UgY2FuJ3QgdXNlIGludGVybmFsIGFkYXB0ZXIgYXMgd2UgY2FuIGNhdXNlIGEgcmFjZSBjb25kaXRpb24gdW5sZXNzIHdlIHBhc3MgcmVxIHRvIHRoZSBwYXlsb2FkLmNyZWF0ZVxuICAgIGNvbnN0IHNlc3Npb24gPSAoYXdhaXQgcGF5bG9hZC5jcmVhdGUoe1xuICAgICAgY29sbGVjdGlvbjogc2Vzc2lvbkNvbGxlY3Rpb24uc2x1ZyxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgaXBBZGRyZXNzOiBnZXRJcChyZXEuaGVhZGVycywgcGF5bG9hZC5iZXR0ZXJBdXRoLm9wdGlvbnMpIHx8ICcnLFxuICAgICAgICB1c2VyQWdlbnQ6IHJlcS5oZWFkZXJzPy5nZXQoJ3VzZXItYWdlbnQnKSB8fCAnJyxcbiAgICAgICAgdXNlcjogdXNlci5pZCxcbiAgICAgICAgdG9rZW46IGdlbmVyYXRlSWQoMzIpLFxuICAgICAgICBleHBpcmVzQXQ6IG5ldyBEYXRlKERhdGUubm93KCkgKyBzZXNzaW9uRXhwaXJhdGlvbiAqIDEwMDApXG4gICAgICB9LFxuICAgICAgcmVxXG4gICAgfSkpIGFzIFNlc3Npb25cblxuICAgIGNvbnN0IGJldHRlckF1dGhIYW5kbGVSZXF1ZXN0ID0gY3JlYXRlQXV0aE1pZGRsZXdhcmUoYXN5bmMgKGN0eCk6IFByb21pc2U8SGVhZGVycyB8IG51bGw+ID0+IHtcbiAgICAgIGN0eC5jb250ZXh0ID0geyAuLi5hdXRoQ29udGV4dCwgdXNlcjogdXNlciB9XG4gICAgICBhd2FpdCBjdHguc2V0U2lnbmVkQ29va2llKFxuICAgICAgICBjdHguY29udGV4dC5hdXRoQ29va2llcy5zZXNzaW9uVG9rZW4ubmFtZSxcbiAgICAgICAgc2Vzc2lvbi50b2tlbixcbiAgICAgICAgY3R4LmNvbnRleHQuc2VjcmV0LFxuICAgICAgICBjdHguY29udGV4dC5hdXRoQ29va2llcy5zZXNzaW9uVG9rZW4ub3B0aW9uc1xuICAgICAgKVxuICAgICAgY29uc3QgZmlsdGVyZWRTZXNzaW9uRGF0YSA9IGF3YWl0IHByZXBhcmVTZXNzaW9uRGF0YSh7XG4gICAgICAgIHNlc3Npb25EYXRhOiB7IHNlc3Npb24sIHVzZXIgfSxcbiAgICAgICAgdXNlcnNDb2xsZWN0aW9uOiB1c2VyQ29sbGVjdGlvbixcbiAgICAgICAgc2Vzc2lvbnNDb2xsZWN0aW9uOiBzZXNzaW9uQ29sbGVjdGlvblxuICAgICAgfSlcbiAgICAgIGlmIChmaWx0ZXJlZFNlc3Npb25EYXRhKSB7XG4gICAgICAgIGF3YWl0IHNldFNlc3Npb25Db29raWUoY3R4LCBmaWx0ZXJlZFNlc3Npb25EYXRhKVxuICAgICAgfVxuICAgICAgaWYgKCdyZXNwb25zZUhlYWRlcnMnIGluIGN0eCkge1xuICAgICAgICByZXR1cm4gY3R4LnJlc3BvbnNlSGVhZGVycyBhcyBIZWFkZXJzXG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH0pXG5cbiAgICAvLyBDcmVhdGUgYSBtb2RpZmllZCByZXF1ZXN0IG9iamVjdCB0aGF0IG1hdGNoZXMgdGhlIGV4cGVjdGVkIE1pZGRsZXdhcmVJbnB1dENvbnRleHQgdHlwZVxuICAgIGNvbnN0IG1vZGlmaWVkUmVxID0ge1xuICAgICAgLi4ucmVxLFxuICAgICAgYm9keTogdW5kZWZpbmVkIC8vIEV4cGxpY2l0bHkgc2V0IGJvZHkgdG8gdW5kZWZpbmVkIHRvIHNhdGlzZnkgdHlwZSBjb25zdHJhaW50XG4gICAgfVxuXG4gICAgY29uc3QgcmVzcG9uc2VIZWFkZXJzID0gYXdhaXQgYmV0dGVyQXV0aEhhbmRsZVJlcXVlc3QobW9kaWZpZWRSZXEpXG4gICAgY29uc3QgcmVzcG9uc2VDb29raWVzID0gcmVzcG9uc2VIZWFkZXJzXG4gICAgICA/LmdldFNldENvb2tpZSgpXG4gICAgICAubWFwKChjb29raWUpID0+IHBhcnNlU2V0Q29va2llKGNvb2tpZSkpXG4gICAgICAuZmlsdGVyKEJvb2xlYW4pIGFzIFJlc3BvbnNlQ29va2llW11cblxuICAgIGlmIChyZXNwb25zZUNvb2tpZXMpIHtcbiAgICAgIGZvciAoY29uc3QgY29va2llRGF0YSBvZiByZXNwb25zZUNvb2tpZXMpIHtcbiAgICAgICAgY29uc3QgeyBuYW1lLCB2YWx1ZSwgLi4ub3B0aW9ucyB9ID0gY29va2llRGF0YVxuICAgICAgICBjb29raWVTdG9yZS5zZXQoe1xuICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgbmFtZSxcbiAgICAgICAgICB2YWx1ZTogZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBob29rIGFzIENvbGxlY3Rpb25BZnRlckxvZ2luSG9va1xufVxuIl0sIm5hbWVzIjpbImJhTW9kZWxLZXkiLCJnZXRDb2xsZWN0aW9uQnlNb2RlbEtleSIsImdldElwIiwicHJlcGFyZVNlc3Npb25EYXRhIiwiZ2V0UGF5bG9hZEF1dGgiLCJnZW5lcmF0ZUlkIiwiY3JlYXRlQXV0aE1pZGRsZXdhcmUiLCJzZXRTZXNzaW9uQ29va2llIiwicGFyc2VTZXRDb29raWUiLCJjb29raWVzIiwiZ2V0QWZ0ZXJMb2dpbkhvb2siLCJob29rIiwicmVxIiwidXNlciIsImNvbmZpZyIsInBheWxvYWQiLCJjb2xsZWN0aW9ucyIsInVzZXJDb2xsZWN0aW9uIiwic2Vzc2lvbkNvbGxlY3Rpb24iLCJzZXNzaW9uIiwiY29va2llU3RvcmUiLCJhdXRoQ29udGV4dCIsImJldHRlckF1dGgiLCIkY29udGV4dCIsInNlc3Npb25FeHBpcmF0aW9uIiwib3B0aW9ucyIsImV4cGlyZXNJbiIsImNyZWF0ZSIsImNvbGxlY3Rpb24iLCJzbHVnIiwiZGF0YSIsImlwQWRkcmVzcyIsImhlYWRlcnMiLCJ1c2VyQWdlbnQiLCJnZXQiLCJpZCIsInRva2VuIiwiZXhwaXJlc0F0IiwiRGF0ZSIsIm5vdyIsImJldHRlckF1dGhIYW5kbGVSZXF1ZXN0IiwiY3R4IiwiY29udGV4dCIsInNldFNpZ25lZENvb2tpZSIsImF1dGhDb29raWVzIiwic2Vzc2lvblRva2VuIiwibmFtZSIsInNlY3JldCIsImZpbHRlcmVkU2Vzc2lvbkRhdGEiLCJzZXNzaW9uRGF0YSIsInVzZXJzQ29sbGVjdGlvbiIsInNlc3Npb25zQ29sbGVjdGlvbiIsInJlc3BvbnNlSGVhZGVycyIsIm1vZGlmaWVkUmVxIiwiYm9keSIsInVuZGVmaW5lZCIsInJlc3BvbnNlQ29va2llcyIsImdldFNldENvb2tpZSIsIm1hcCIsImNvb2tpZSIsImZpbHRlciIsIkJvb2xlYW4iLCJjb29raWVEYXRhIiwidmFsdWUiLCJzZXQiLCJkZWNvZGVVUklDb21wb25lbnQiXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLFVBQVUsUUFBUSx3QkFBZ0M7QUFDM0QsU0FBU0MsdUJBQXVCLFFBQVEscUNBQTZDO0FBQ3JGLFNBQVNDLEtBQUssUUFBUSw2QkFBcUM7QUFDM0QsU0FBU0Msa0JBQWtCLFFBQVEsMkNBQW1EO0FBQ3RGLFNBQVNDLGNBQWMsUUFBUSw0QkFBMkM7QUFDMUUsU0FBU0MsVUFBVSxRQUFpQixjQUFhO0FBQ2pELFNBQVNDLG9CQUFvQixRQUFRLGtCQUFpQjtBQUN0RCxTQUFTQyxnQkFBZ0IsUUFBUSxzQkFBcUI7QUFDdEQsU0FBU0MsY0FBYyxRQUE2QiwyQ0FBMEM7QUFDOUYsU0FBU0MsT0FBTyxRQUFRLGVBQWM7QUFFdEM7OztDQUdDLEdBQ0QsT0FBTyxTQUFTQztJQUNkLE1BQU1DLE9BQWlDLE9BQU8sRUFBRUMsR0FBRyxFQUFFQyxJQUFJLEVBQUU7UUFDekQsTUFBTUMsU0FBU0YsSUFBSUcsT0FBTyxDQUFDRCxNQUFNO1FBQ2pDLE1BQU1DLFVBQVUsTUFBTVgsZUFBZVU7UUFDckMsTUFBTUUsY0FBY0osSUFBSUcsT0FBTyxDQUFDQyxXQUFXO1FBQzNDLE1BQU1DLGlCQUFpQmhCLHdCQUF3QmUsYUFBYWhCLFdBQVdhLElBQUk7UUFDM0UsTUFBTUssb0JBQW9CakIsd0JBQXdCZSxhQUFhaEIsV0FBV21CLE9BQU87UUFDakYsTUFBTUMsY0FBYyxNQUFNWDtRQUMxQixNQUFNWSxjQUFjLE1BQU1OLFFBQVFPLFVBQVUsQ0FBQ0MsUUFBUTtRQUNyRCxNQUFNQyxvQkFBb0JULFFBQVFPLFVBQVUsQ0FBQ0csT0FBTyxDQUFDTixPQUFPLEVBQUVPLGFBQWEsS0FBSyxLQUFLLEtBQUssRUFBRSxTQUFTOztRQUNyRywwR0FBMEc7UUFDMUcsTUFBTVAsVUFBVyxNQUFNSixRQUFRWSxNQUFNLENBQUM7WUFDcENDLFlBQVlWLGtCQUFrQlcsSUFBSTtZQUNsQ0MsTUFBTTtnQkFDSkMsV0FBVzdCLE1BQU1VLElBQUlvQixPQUFPLEVBQUVqQixRQUFRTyxVQUFVLENBQUNHLE9BQU8sS0FBSztnQkFDN0RRLFdBQVdyQixJQUFJb0IsT0FBTyxFQUFFRSxJQUFJLGlCQUFpQjtnQkFDN0NyQixNQUFNQSxLQUFLc0IsRUFBRTtnQkFDYkMsT0FBTy9CLFdBQVc7Z0JBQ2xCZ0MsV0FBVyxJQUFJQyxLQUFLQSxLQUFLQyxHQUFHLEtBQUtmLG9CQUFvQjtZQUN2RDtZQUNBWjtRQUNGO1FBRUEsTUFBTTRCLDBCQUEwQmxDLHFCQUFxQixPQUFPbUM7WUFDMURBLElBQUlDLE9BQU8sR0FBRztnQkFBRSxHQUFHckIsV0FBVztnQkFBRVIsTUFBTUE7WUFBSztZQUMzQyxNQUFNNEIsSUFBSUUsZUFBZSxDQUN2QkYsSUFBSUMsT0FBTyxDQUFDRSxXQUFXLENBQUNDLFlBQVksQ0FBQ0MsSUFBSSxFQUN6QzNCLFFBQVFpQixLQUFLLEVBQ2JLLElBQUlDLE9BQU8sQ0FBQ0ssTUFBTSxFQUNsQk4sSUFBSUMsT0FBTyxDQUFDRSxXQUFXLENBQUNDLFlBQVksQ0FBQ3BCLE9BQU87WUFFOUMsTUFBTXVCLHNCQUFzQixNQUFNN0MsbUJBQW1CO2dCQUNuRDhDLGFBQWE7b0JBQUU5QjtvQkFBU047Z0JBQUs7Z0JBQzdCcUMsaUJBQWlCakM7Z0JBQ2pCa0Msb0JBQW9CakM7WUFDdEI7WUFDQSxJQUFJOEIscUJBQXFCO2dCQUN2QixNQUFNekMsaUJBQWlCa0MsS0FBS087WUFDOUI7WUFDQSxJQUFJLHFCQUFxQlAsS0FBSztnQkFDNUIsT0FBT0EsSUFBSVcsZUFBZTtZQUM1QjtZQUNBLE9BQU87UUFDVDtRQUVBLHlGQUF5RjtRQUN6RixNQUFNQyxjQUFjO1lBQ2xCLEdBQUd6QyxHQUFHO1lBQ04wQyxNQUFNQyxVQUFVLDhEQUE4RDtRQUNoRjtRQUVBLE1BQU1ILGtCQUFrQixNQUFNWix3QkFBd0JhO1FBQ3RELE1BQU1HLGtCQUFrQkosaUJBQ3BCSyxlQUNEQyxJQUFJLENBQUNDLFNBQVduRCxlQUFlbUQsU0FDL0JDLE9BQU9DO1FBRVYsSUFBSUwsaUJBQWlCO1lBQ25CLEtBQUssTUFBTU0sY0FBY04sZ0JBQWlCO2dCQUN4QyxNQUFNLEVBQUVWLElBQUksRUFBRWlCLEtBQUssRUFBRSxHQUFHdEMsU0FBUyxHQUFHcUM7Z0JBQ3BDMUMsWUFBWTRDLEdBQUcsQ0FBQztvQkFDZCxHQUFHdkMsT0FBTztvQkFDVnFCO29CQUNBaUIsT0FBT0UsbUJBQW1CRjtnQkFDNUI7WUFDRjtRQUNGO0lBQ0Y7SUFFQSxPQUFPcEQ7QUFDVCJ9