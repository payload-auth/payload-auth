import { createAuthMiddleware } from "better-auth/api";
/**
 * Mofies options object and adds a middleware to check for admin invite for sign up
 */ export const useAdminInviteAfterEmailSignUpMiddleware = async ({ options, adminInvitationCollectionSlug, userCollectionSlug })=>{
    options.hooks = options.hooks || {};
    const originalAfter = options.hooks.after;
    options.hooks.after = createAuthMiddleware(async (ctx)=>{
        const adapter = ctx.context.adapter;
        const internalAdapter = ctx.context.internalAdapter;
        if (ctx.path !== '/sign-up/email') {
            if (typeof originalAfter === 'function') originalAfter(ctx);
            return;
        }
        const email = ctx.body.email;
        const adminInviteToken = ctx?.query?.adminInviteToken ?? ctx.body.adminInviteToken;
        const adminInvitation = await adapter.findOne({
            model: adminInvitationCollectionSlug,
            where: [
                {
                    field: 'token',
                    value: adminInviteToken,
                    operator: 'eq'
                }
            ]
        });
        if (!adminInvitation || !adminInvitation?.role || !email) {
            if (typeof originalAfter === 'function') originalAfter(ctx);
            return;
        }
        const newlyCreatedUser = await internalAdapter.findUserByEmail(email);
        if (!newlyCreatedUser) {
            if (typeof originalAfter === 'function') originalAfter(ctx);
            return;
        }
        await adapter.update({
            model: userCollectionSlug,
            where: [
                {
                    field: 'id',
                    value: newlyCreatedUser.user.id,
                    operator: 'eq'
                }
            ],
            update: {
                role: adminInvitation?.role
            }
        });
        await adapter.delete({
            model: adminInvitationCollectionSlug,
            where: [
                {
                    field: 'id',
                    value: adminInvitation.id,
                    operator: 'eq'
                }
            ]
        });
        if (typeof originalAfter === 'function') originalAfter(ctx);
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL3Nhbml0aXplLWJldHRlci1hdXRoLW9wdGlvbnMvdXRpbHMvdXNlLWFkbWluLWludml0ZS1hZnRlci1lbWFpbC1zaWduLXVwLW1pZGRsZXdhcmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBTYW5pdGl6ZWRCZXR0ZXJBdXRoT3B0aW9ucyB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL3R5cGVzJ1xuaW1wb3J0IHsgY3JlYXRlQXV0aE1pZGRsZXdhcmUgfSBmcm9tICdiZXR0ZXItYXV0aC9hcGknXG5cbi8qKlxuICogTW9maWVzIG9wdGlvbnMgb2JqZWN0IGFuZCBhZGRzIGEgbWlkZGxld2FyZSB0byBjaGVjayBmb3IgYWRtaW4gaW52aXRlIGZvciBzaWduIHVwXG4gKi9cbmV4cG9ydCBjb25zdCB1c2VBZG1pbkludml0ZUFmdGVyRW1haWxTaWduVXBNaWRkbGV3YXJlID0gYXN5bmMgKHtcbiAgb3B0aW9ucyxcbiAgYWRtaW5JbnZpdGF0aW9uQ29sbGVjdGlvblNsdWcsXG4gIHVzZXJDb2xsZWN0aW9uU2x1Z1xufToge1xuICBvcHRpb25zOiBTYW5pdGl6ZWRCZXR0ZXJBdXRoT3B0aW9uc1xuICBhZG1pbkludml0YXRpb25Db2xsZWN0aW9uU2x1Zzogc3RyaW5nXG4gIHVzZXJDb2xsZWN0aW9uU2x1Zzogc3RyaW5nXG59KSA9PiB7XG4gIG9wdGlvbnMuaG9va3MgPSBvcHRpb25zLmhvb2tzIHx8IHt9XG4gIGNvbnN0IG9yaWdpbmFsQWZ0ZXIgPSBvcHRpb25zLmhvb2tzLmFmdGVyXG4gIG9wdGlvbnMuaG9va3MuYWZ0ZXIgPSBjcmVhdGVBdXRoTWlkZGxld2FyZShhc3luYyAoY3R4KSA9PiB7XG4gICAgY29uc3QgYWRhcHRlciA9IGN0eC5jb250ZXh0LmFkYXB0ZXJcbiAgICBjb25zdCBpbnRlcm5hbEFkYXB0ZXIgPSBjdHguY29udGV4dC5pbnRlcm5hbEFkYXB0ZXJcblxuICAgIGlmIChjdHgucGF0aCAhPT0gJy9zaWduLXVwL2VtYWlsJykge1xuICAgICAgaWYgKHR5cGVvZiBvcmlnaW5hbEFmdGVyID09PSAnZnVuY3Rpb24nKSBvcmlnaW5hbEFmdGVyKGN0eClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCBlbWFpbCA9IGN0eC5ib2R5LmVtYWlsXG4gICAgY29uc3QgYWRtaW5JbnZpdGVUb2tlbiA9IGN0eD8ucXVlcnk/LmFkbWluSW52aXRlVG9rZW4gPz8gY3R4LmJvZHkuYWRtaW5JbnZpdGVUb2tlblxuICAgIGNvbnN0IGFkbWluSW52aXRhdGlvbiA9IGF3YWl0IGFkYXB0ZXIuZmluZE9uZSh7XG4gICAgICBtb2RlbDogYWRtaW5JbnZpdGF0aW9uQ29sbGVjdGlvblNsdWcsXG4gICAgICB3aGVyZTogW3tcbiAgICAgICAgZmllbGQ6ICd0b2tlbicsXG4gICAgICAgIHZhbHVlOiBhZG1pbkludml0ZVRva2VuLFxuICAgICAgICBvcGVyYXRvcjogJ2VxJ1xuICAgICAgfV1cbiAgICB9KSBhcyBhbnlcbiAgICBpZighYWRtaW5JbnZpdGF0aW9uIHx8ICFhZG1pbkludml0YXRpb24/LnJvbGUgfHwgIWVtYWlsKSB7XG4gICAgICBpZiAodHlwZW9mIG9yaWdpbmFsQWZ0ZXIgPT09ICdmdW5jdGlvbicpIG9yaWdpbmFsQWZ0ZXIoY3R4KVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgbmV3bHlDcmVhdGVkVXNlciA9IGF3YWl0IGludGVybmFsQWRhcHRlci5maW5kVXNlckJ5RW1haWwoZW1haWwpXG4gICAgaWYoIW5ld2x5Q3JlYXRlZFVzZXIpIHtcbiAgICAgIGlmICh0eXBlb2Ygb3JpZ2luYWxBZnRlciA9PT0gJ2Z1bmN0aW9uJykgb3JpZ2luYWxBZnRlcihjdHgpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBhd2FpdCBhZGFwdGVyLnVwZGF0ZSh7XG4gICAgICBtb2RlbDogdXNlckNvbGxlY3Rpb25TbHVnLFxuICAgICAgd2hlcmU6IFt7XG4gICAgICAgIGZpZWxkOiAnaWQnLFxuICAgICAgICB2YWx1ZTogbmV3bHlDcmVhdGVkVXNlci51c2VyLmlkLFxuICAgICAgICBvcGVyYXRvcjogJ2VxJ1xuICAgICAgfV0sXG4gICAgICB1cGRhdGU6IHtcbiAgICAgICAgcm9sZTogYWRtaW5JbnZpdGF0aW9uPy5yb2xlXG4gICAgICB9XG4gICAgfSlcblxuICAgIGF3YWl0IGFkYXB0ZXIuZGVsZXRlKHtcbiAgICAgIG1vZGVsOiBhZG1pbkludml0YXRpb25Db2xsZWN0aW9uU2x1ZyxcbiAgICAgIHdoZXJlOiBbe1xuICAgICAgICBmaWVsZDogJ2lkJyxcbiAgICAgICAgdmFsdWU6IGFkbWluSW52aXRhdGlvbi5pZCxcbiAgICAgICAgb3BlcmF0b3I6ICdlcSdcbiAgICAgIH1dXG4gICAgfSlcbiAgICBcbiAgICBpZiAodHlwZW9mIG9yaWdpbmFsQWZ0ZXIgPT09ICdmdW5jdGlvbicpIG9yaWdpbmFsQWZ0ZXIoY3R4KVxuICB9KVxufVxuIl0sIm5hbWVzIjpbImNyZWF0ZUF1dGhNaWRkbGV3YXJlIiwidXNlQWRtaW5JbnZpdGVBZnRlckVtYWlsU2lnblVwTWlkZGxld2FyZSIsIm9wdGlvbnMiLCJhZG1pbkludml0YXRpb25Db2xsZWN0aW9uU2x1ZyIsInVzZXJDb2xsZWN0aW9uU2x1ZyIsImhvb2tzIiwib3JpZ2luYWxBZnRlciIsImFmdGVyIiwiY3R4IiwiYWRhcHRlciIsImNvbnRleHQiLCJpbnRlcm5hbEFkYXB0ZXIiLCJwYXRoIiwiZW1haWwiLCJib2R5IiwiYWRtaW5JbnZpdGVUb2tlbiIsInF1ZXJ5IiwiYWRtaW5JbnZpdGF0aW9uIiwiZmluZE9uZSIsIm1vZGVsIiwid2hlcmUiLCJmaWVsZCIsInZhbHVlIiwib3BlcmF0b3IiLCJyb2xlIiwibmV3bHlDcmVhdGVkVXNlciIsImZpbmRVc2VyQnlFbWFpbCIsInVwZGF0ZSIsInVzZXIiLCJpZCIsImRlbGV0ZSJdLCJtYXBwaW5ncyI6IkFBQ0EsU0FBU0Esb0JBQW9CLFFBQVEsa0JBQWlCO0FBRXREOztDQUVDLEdBQ0QsT0FBTyxNQUFNQywyQ0FBMkMsT0FBTyxFQUM3REMsT0FBTyxFQUNQQyw2QkFBNkIsRUFDN0JDLGtCQUFrQixFQUtuQjtJQUNDRixRQUFRRyxLQUFLLEdBQUdILFFBQVFHLEtBQUssSUFBSSxDQUFDO0lBQ2xDLE1BQU1DLGdCQUFnQkosUUFBUUcsS0FBSyxDQUFDRSxLQUFLO0lBQ3pDTCxRQUFRRyxLQUFLLENBQUNFLEtBQUssR0FBR1AscUJBQXFCLE9BQU9RO1FBQ2hELE1BQU1DLFVBQVVELElBQUlFLE9BQU8sQ0FBQ0QsT0FBTztRQUNuQyxNQUFNRSxrQkFBa0JILElBQUlFLE9BQU8sQ0FBQ0MsZUFBZTtRQUVuRCxJQUFJSCxJQUFJSSxJQUFJLEtBQUssa0JBQWtCO1lBQ2pDLElBQUksT0FBT04sa0JBQWtCLFlBQVlBLGNBQWNFO1lBQ3ZEO1FBQ0Y7UUFDQSxNQUFNSyxRQUFRTCxJQUFJTSxJQUFJLENBQUNELEtBQUs7UUFDNUIsTUFBTUUsbUJBQW1CUCxLQUFLUSxPQUFPRCxvQkFBb0JQLElBQUlNLElBQUksQ0FBQ0MsZ0JBQWdCO1FBQ2xGLE1BQU1FLGtCQUFrQixNQUFNUixRQUFRUyxPQUFPLENBQUM7WUFDNUNDLE9BQU9oQjtZQUNQaUIsT0FBTztnQkFBQztvQkFDTkMsT0FBTztvQkFDUEMsT0FBT1A7b0JBQ1BRLFVBQVU7Z0JBQ1o7YUFBRTtRQUNKO1FBQ0EsSUFBRyxDQUFDTixtQkFBbUIsQ0FBQ0EsaUJBQWlCTyxRQUFRLENBQUNYLE9BQU87WUFDdkQsSUFBSSxPQUFPUCxrQkFBa0IsWUFBWUEsY0FBY0U7WUFDdkQ7UUFDRjtRQUVBLE1BQU1pQixtQkFBbUIsTUFBTWQsZ0JBQWdCZSxlQUFlLENBQUNiO1FBQy9ELElBQUcsQ0FBQ1ksa0JBQWtCO1lBQ3BCLElBQUksT0FBT25CLGtCQUFrQixZQUFZQSxjQUFjRTtZQUN2RDtRQUNGO1FBRUEsTUFBTUMsUUFBUWtCLE1BQU0sQ0FBQztZQUNuQlIsT0FBT2Y7WUFDUGdCLE9BQU87Z0JBQUM7b0JBQ05DLE9BQU87b0JBQ1BDLE9BQU9HLGlCQUFpQkcsSUFBSSxDQUFDQyxFQUFFO29CQUMvQk4sVUFBVTtnQkFDWjthQUFFO1lBQ0ZJLFFBQVE7Z0JBQ05ILE1BQU1QLGlCQUFpQk87WUFDekI7UUFDRjtRQUVBLE1BQU1mLFFBQVFxQixNQUFNLENBQUM7WUFDbkJYLE9BQU9oQjtZQUNQaUIsT0FBTztnQkFBQztvQkFDTkMsT0FBTztvQkFDUEMsT0FBT0wsZ0JBQWdCWSxFQUFFO29CQUN6Qk4sVUFBVTtnQkFDWjthQUFFO1FBQ0o7UUFFQSxJQUFJLE9BQU9qQixrQkFBa0IsWUFBWUEsY0FBY0U7SUFDekQ7QUFDRixFQUFDIn0=