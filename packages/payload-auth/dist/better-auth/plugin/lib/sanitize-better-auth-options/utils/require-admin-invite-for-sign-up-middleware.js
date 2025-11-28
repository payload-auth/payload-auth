import { baseSlugs } from "../../../constants";
import { createAuthMiddleware } from "better-auth/api";
import { APIError } from "better-auth/api";
import { z } from "zod";
const throwUnauthorizedError = ()=>{
    throw new APIError('UNAUTHORIZED', {
        message: 'signup disabled' // mimic: https://github.com/better-auth/better-auth/blob/171fab5273cf38f46cf207b0d99c8ccdda64c2fb/packages/better-auth/src/oauth2/link-account.ts#L108
    });
};
/**
 * Mofies options object and adds a middleware to check for admin invite for sign up
 */ export const requireAdminInviteForSignUpMiddleware = async ({ options, pluginOptions })=>{
    options.hooks = options.hooks || {};
    const originalBefore = options.hooks.before;
    options.hooks.before = createAuthMiddleware(async (ctx)=>{
        if (ctx.path !== '/sign-up/email' && // not an email sign-up request
        !(ctx.path === '/sign-in/social' && ctx.body?.requestSignUp // not a social sign-in request with sign-up intent
        )) return;
        const adminInviteToken = ctx?.query?.adminInviteToken ?? ctx.body.adminInviteToken;
        if (!!pluginOptions.requireAdminInviteForSignUp && !z.string().uuid().safeParse(adminInviteToken).success) {
            throwUnauthorizedError();
            return;
        }
        const query = {
            field: 'token',
            value: adminInviteToken,
            operator: 'eq'
        };
        const isValidAdminInvitation = await ctx.context.adapter.count({
            model: pluginOptions.adminInvitations?.slug ?? baseSlugs.adminInvitations,
            where: [
                query
            ]
        });
        if (isValidAdminInvitation) {
            if (originalBefore) return originalBefore(ctx);
            return ctx;
        }
        throwUnauthorizedError();
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL3Nhbml0aXplLWJldHRlci1hdXRoLW9wdGlvbnMvdXRpbHMvcmVxdWlyZS1hZG1pbi1pbnZpdGUtZm9yLXNpZ24tdXAtbWlkZGxld2FyZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBiYXNlU2x1Z3MgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi9jb25zdGFudHMnXG5pbXBvcnQgeyBCZXR0ZXJBdXRoUGx1Z2luT3B0aW9ucyB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvdHlwZXMnXG5pbXBvcnQgeyBjcmVhdGVBdXRoTWlkZGxld2FyZSB9IGZyb20gJ2JldHRlci1hdXRoL2FwaSdcbmltcG9ydCB0eXBlIHsgV2hlcmUgfSBmcm9tICdiZXR0ZXItYXV0aCdcbmltcG9ydCB0eXBlIHsgU2FuaXRpemVkQmV0dGVyQXV0aE9wdGlvbnMgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi90eXBlcydcbmltcG9ydCB7IEFQSUVycm9yIH0gZnJvbSAnYmV0dGVyLWF1dGgvYXBpJ1xuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCdcblxuY29uc3QgdGhyb3dVbmF1dGhvcml6ZWRFcnJvciA9ICgpID0+IHtcbiAgdGhyb3cgbmV3IEFQSUVycm9yKCdVTkFVVEhPUklaRUQnLCB7XG4gICAgbWVzc2FnZTogJ3NpZ251cCBkaXNhYmxlZCcgLy8gbWltaWM6IGh0dHBzOi8vZ2l0aHViLmNvbS9iZXR0ZXItYXV0aC9iZXR0ZXItYXV0aC9ibG9iLzE3MWZhYjUyNzNjZjM4ZjQ2Y2YyMDdiMGQ5OWM4Y2NkZGE2NGMyZmIvcGFja2FnZXMvYmV0dGVyLWF1dGgvc3JjL29hdXRoMi9saW5rLWFjY291bnQudHMjTDEwOFxuICB9KVxufVxuXG4vKipcbiAqIE1vZmllcyBvcHRpb25zIG9iamVjdCBhbmQgYWRkcyBhIG1pZGRsZXdhcmUgdG8gY2hlY2sgZm9yIGFkbWluIGludml0ZSBmb3Igc2lnbiB1cFxuICovXG5leHBvcnQgY29uc3QgcmVxdWlyZUFkbWluSW52aXRlRm9yU2lnblVwTWlkZGxld2FyZSA9IGFzeW5jICh7XG4gIG9wdGlvbnMsXG4gIHBsdWdpbk9wdGlvbnNcbn06IHtcbiAgb3B0aW9uczogU2FuaXRpemVkQmV0dGVyQXV0aE9wdGlvbnNcbiAgcGx1Z2luT3B0aW9uczogQmV0dGVyQXV0aFBsdWdpbk9wdGlvbnNcbn0pID0+IHtcbiAgb3B0aW9ucy5ob29rcyA9IG9wdGlvbnMuaG9va3MgfHwge31cbiAgY29uc3Qgb3JpZ2luYWxCZWZvcmUgPSBvcHRpb25zLmhvb2tzLmJlZm9yZVxuICBvcHRpb25zLmhvb2tzLmJlZm9yZSA9IGNyZWF0ZUF1dGhNaWRkbGV3YXJlKGFzeW5jIChjdHgpID0+IHtcbiAgICBpZiAoXG4gICAgICBjdHgucGF0aCAhPT0gJy9zaWduLXVwL2VtYWlsJyAmJiAvLyBub3QgYW4gZW1haWwgc2lnbi11cCByZXF1ZXN0XG4gICAgICAhKGN0eC5wYXRoID09PSAnL3NpZ24taW4vc29jaWFsJyAmJiBjdHguYm9keT8ucmVxdWVzdFNpZ25VcCkgLy8gbm90IGEgc29jaWFsIHNpZ24taW4gcmVxdWVzdCB3aXRoIHNpZ24tdXAgaW50ZW50XG4gICAgKVxuICAgICAgcmV0dXJuXG4gICAgY29uc3QgYWRtaW5JbnZpdGVUb2tlbiA9IGN0eD8ucXVlcnk/LmFkbWluSW52aXRlVG9rZW4gPz8gY3R4LmJvZHkuYWRtaW5JbnZpdGVUb2tlblxuICAgIGlmICghIXBsdWdpbk9wdGlvbnMucmVxdWlyZUFkbWluSW52aXRlRm9yU2lnblVwICYmICF6LnN0cmluZygpLnV1aWQoKS5zYWZlUGFyc2UoYWRtaW5JbnZpdGVUb2tlbikuc3VjY2Vzcykge1xuICAgICAgdGhyb3dVbmF1dGhvcml6ZWRFcnJvcigpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgcXVlcnk6IFdoZXJlID0ge1xuICAgICAgZmllbGQ6ICd0b2tlbicsXG4gICAgICB2YWx1ZTogYWRtaW5JbnZpdGVUb2tlbixcbiAgICAgIG9wZXJhdG9yOiAnZXEnXG4gICAgfVxuICAgIGNvbnN0IGlzVmFsaWRBZG1pbkludml0YXRpb24gPSBhd2FpdCBjdHguY29udGV4dC5hZGFwdGVyLmNvdW50KHtcbiAgICAgIG1vZGVsOiBwbHVnaW5PcHRpb25zLmFkbWluSW52aXRhdGlvbnM/LnNsdWcgPz8gYmFzZVNsdWdzLmFkbWluSW52aXRhdGlvbnMsXG4gICAgICB3aGVyZTogW3F1ZXJ5XVxuICAgIH0pXG4gICAgaWYgKGlzVmFsaWRBZG1pbkludml0YXRpb24pIHtcbiAgICAgIGlmIChvcmlnaW5hbEJlZm9yZSkgcmV0dXJuIG9yaWdpbmFsQmVmb3JlKGN0eClcbiAgICAgIHJldHVybiBjdHhcbiAgICB9XG4gICAgdGhyb3dVbmF1dGhvcml6ZWRFcnJvcigpXG4gIH0pXG59XG4iXSwibmFtZXMiOlsiYmFzZVNsdWdzIiwiY3JlYXRlQXV0aE1pZGRsZXdhcmUiLCJBUElFcnJvciIsInoiLCJ0aHJvd1VuYXV0aG9yaXplZEVycm9yIiwibWVzc2FnZSIsInJlcXVpcmVBZG1pbkludml0ZUZvclNpZ25VcE1pZGRsZXdhcmUiLCJvcHRpb25zIiwicGx1Z2luT3B0aW9ucyIsImhvb2tzIiwib3JpZ2luYWxCZWZvcmUiLCJiZWZvcmUiLCJjdHgiLCJwYXRoIiwiYm9keSIsInJlcXVlc3RTaWduVXAiLCJhZG1pbkludml0ZVRva2VuIiwicXVlcnkiLCJyZXF1aXJlQWRtaW5JbnZpdGVGb3JTaWduVXAiLCJzdHJpbmciLCJ1dWlkIiwic2FmZVBhcnNlIiwic3VjY2VzcyIsImZpZWxkIiwidmFsdWUiLCJvcGVyYXRvciIsImlzVmFsaWRBZG1pbkludml0YXRpb24iLCJjb250ZXh0IiwiYWRhcHRlciIsImNvdW50IiwibW9kZWwiLCJhZG1pbkludml0YXRpb25zIiwic2x1ZyIsIndoZXJlIl0sIm1hcHBpbmdzIjoiQUFBQSxTQUFTQSxTQUFTLFFBQVEscUJBQWdDO0FBRTFELFNBQVNDLG9CQUFvQixRQUFRLGtCQUFpQjtBQUd0RCxTQUFTQyxRQUFRLFFBQVEsa0JBQWlCO0FBQzFDLFNBQVNDLENBQUMsUUFBUSxNQUFLO0FBRXZCLE1BQU1DLHlCQUF5QjtJQUM3QixNQUFNLElBQUlGLFNBQVMsZ0JBQWdCO1FBQ2pDRyxTQUFTLGtCQUFrQix1SkFBdUo7SUFDcEw7QUFDRjtBQUVBOztDQUVDLEdBQ0QsT0FBTyxNQUFNQyx3Q0FBd0MsT0FBTyxFQUMxREMsT0FBTyxFQUNQQyxhQUFhLEVBSWQ7SUFDQ0QsUUFBUUUsS0FBSyxHQUFHRixRQUFRRSxLQUFLLElBQUksQ0FBQztJQUNsQyxNQUFNQyxpQkFBaUJILFFBQVFFLEtBQUssQ0FBQ0UsTUFBTTtJQUMzQ0osUUFBUUUsS0FBSyxDQUFDRSxNQUFNLEdBQUdWLHFCQUFxQixPQUFPVztRQUNqRCxJQUNFQSxJQUFJQyxJQUFJLEtBQUssb0JBQW9CLCtCQUErQjtRQUNoRSxDQUFFRCxDQUFBQSxJQUFJQyxJQUFJLEtBQUsscUJBQXFCRCxJQUFJRSxJQUFJLEVBQUVDLGNBQWUsbURBQW1EO1FBQXRELEdBRTFEO1FBQ0YsTUFBTUMsbUJBQW1CSixLQUFLSyxPQUFPRCxvQkFBb0JKLElBQUlFLElBQUksQ0FBQ0UsZ0JBQWdCO1FBQ2xGLElBQUksQ0FBQyxDQUFDUixjQUFjVSwyQkFBMkIsSUFBSSxDQUFDZixFQUFFZ0IsTUFBTSxHQUFHQyxJQUFJLEdBQUdDLFNBQVMsQ0FBQ0wsa0JBQWtCTSxPQUFPLEVBQUU7WUFDekdsQjtZQUNBO1FBQ0Y7UUFDQSxNQUFNYSxRQUFlO1lBQ25CTSxPQUFPO1lBQ1BDLE9BQU9SO1lBQ1BTLFVBQVU7UUFDWjtRQUNBLE1BQU1DLHlCQUF5QixNQUFNZCxJQUFJZSxPQUFPLENBQUNDLE9BQU8sQ0FBQ0MsS0FBSyxDQUFDO1lBQzdEQyxPQUFPdEIsY0FBY3VCLGdCQUFnQixFQUFFQyxRQUFRaEMsVUFBVStCLGdCQUFnQjtZQUN6RUUsT0FBTztnQkFBQ2hCO2FBQU07UUFDaEI7UUFDQSxJQUFJUyx3QkFBd0I7WUFDMUIsSUFBSWhCLGdCQUFnQixPQUFPQSxlQUFlRTtZQUMxQyxPQUFPQTtRQUNUO1FBQ0FSO0lBQ0Y7QUFDRixFQUFDIn0=