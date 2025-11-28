import { createAuthMiddleware } from "better-auth/api";
/**
 * Modifies options object and adds a middleware to check for admin invite for sign up
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL3Nhbml0aXplLWJldHRlci1hdXRoLW9wdGlvbnMvdXRpbHMvdXNlLWFkbWluLWludml0ZS1hZnRlci1lbWFpbC1zaWduLXVwLW1pZGRsZXdhcmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBTYW5pdGl6ZWRCZXR0ZXJBdXRoT3B0aW9ucyB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL3R5cGVzJ1xuaW1wb3J0IHsgY3JlYXRlQXV0aE1pZGRsZXdhcmUgfSBmcm9tICdiZXR0ZXItYXV0aC9hcGknXG5cbi8qKlxuICogTW9kaWZpZXMgb3B0aW9ucyBvYmplY3QgYW5kIGFkZHMgYSBtaWRkbGV3YXJlIHRvIGNoZWNrIGZvciBhZG1pbiBpbnZpdGUgZm9yIHNpZ24gdXBcbiAqL1xuZXhwb3J0IGNvbnN0IHVzZUFkbWluSW52aXRlQWZ0ZXJFbWFpbFNpZ25VcE1pZGRsZXdhcmUgPSBhc3luYyAoe1xuICBvcHRpb25zLFxuICBhZG1pbkludml0YXRpb25Db2xsZWN0aW9uU2x1ZyxcbiAgdXNlckNvbGxlY3Rpb25TbHVnXG59OiB7XG4gIG9wdGlvbnM6IFNhbml0aXplZEJldHRlckF1dGhPcHRpb25zXG4gIGFkbWluSW52aXRhdGlvbkNvbGxlY3Rpb25TbHVnOiBzdHJpbmdcbiAgdXNlckNvbGxlY3Rpb25TbHVnOiBzdHJpbmdcbn0pID0+IHtcbiAgb3B0aW9ucy5ob29rcyA9IG9wdGlvbnMuaG9va3MgfHwge31cbiAgY29uc3Qgb3JpZ2luYWxBZnRlciA9IG9wdGlvbnMuaG9va3MuYWZ0ZXJcbiAgb3B0aW9ucy5ob29rcy5hZnRlciA9IGNyZWF0ZUF1dGhNaWRkbGV3YXJlKGFzeW5jIChjdHgpID0+IHtcbiAgICBjb25zdCBhZGFwdGVyID0gY3R4LmNvbnRleHQuYWRhcHRlclxuICAgIGNvbnN0IGludGVybmFsQWRhcHRlciA9IGN0eC5jb250ZXh0LmludGVybmFsQWRhcHRlclxuXG4gICAgaWYgKGN0eC5wYXRoICE9PSAnL3NpZ24tdXAvZW1haWwnKSB7XG4gICAgICBpZiAodHlwZW9mIG9yaWdpbmFsQWZ0ZXIgPT09ICdmdW5jdGlvbicpIG9yaWdpbmFsQWZ0ZXIoY3R4KVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IGVtYWlsID0gY3R4LmJvZHkuZW1haWxcbiAgICBjb25zdCBhZG1pbkludml0ZVRva2VuID0gY3R4Py5xdWVyeT8uYWRtaW5JbnZpdGVUb2tlbiA/PyBjdHguYm9keS5hZG1pbkludml0ZVRva2VuXG4gICAgY29uc3QgYWRtaW5JbnZpdGF0aW9uID0gKGF3YWl0IGFkYXB0ZXIuZmluZE9uZSh7XG4gICAgICBtb2RlbDogYWRtaW5JbnZpdGF0aW9uQ29sbGVjdGlvblNsdWcsXG4gICAgICB3aGVyZTogW1xuICAgICAgICB7XG4gICAgICAgICAgZmllbGQ6ICd0b2tlbicsXG4gICAgICAgICAgdmFsdWU6IGFkbWluSW52aXRlVG9rZW4sXG4gICAgICAgICAgb3BlcmF0b3I6ICdlcSdcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0pKSBhcyBhbnlcbiAgICBpZiAoIWFkbWluSW52aXRhdGlvbiB8fCAhYWRtaW5JbnZpdGF0aW9uPy5yb2xlIHx8ICFlbWFpbCkge1xuICAgICAgaWYgKHR5cGVvZiBvcmlnaW5hbEFmdGVyID09PSAnZnVuY3Rpb24nKSBvcmlnaW5hbEFmdGVyKGN0eClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IG5ld2x5Q3JlYXRlZFVzZXIgPSBhd2FpdCBpbnRlcm5hbEFkYXB0ZXIuZmluZFVzZXJCeUVtYWlsKGVtYWlsKVxuICAgIGlmICghbmV3bHlDcmVhdGVkVXNlcikge1xuICAgICAgaWYgKHR5cGVvZiBvcmlnaW5hbEFmdGVyID09PSAnZnVuY3Rpb24nKSBvcmlnaW5hbEFmdGVyKGN0eClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGF3YWl0IGFkYXB0ZXIudXBkYXRlKHtcbiAgICAgIG1vZGVsOiB1c2VyQ29sbGVjdGlvblNsdWcsXG4gICAgICB3aGVyZTogW1xuICAgICAgICB7XG4gICAgICAgICAgZmllbGQ6ICdpZCcsXG4gICAgICAgICAgdmFsdWU6IG5ld2x5Q3JlYXRlZFVzZXIudXNlci5pZCxcbiAgICAgICAgICBvcGVyYXRvcjogJ2VxJ1xuICAgICAgICB9XG4gICAgICBdLFxuICAgICAgdXBkYXRlOiB7XG4gICAgICAgIHJvbGU6IGFkbWluSW52aXRhdGlvbj8ucm9sZVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBhd2FpdCBhZGFwdGVyLmRlbGV0ZSh7XG4gICAgICBtb2RlbDogYWRtaW5JbnZpdGF0aW9uQ29sbGVjdGlvblNsdWcsXG4gICAgICB3aGVyZTogW1xuICAgICAgICB7XG4gICAgICAgICAgZmllbGQ6ICdpZCcsXG4gICAgICAgICAgdmFsdWU6IGFkbWluSW52aXRhdGlvbi5pZCxcbiAgICAgICAgICBvcGVyYXRvcjogJ2VxJ1xuICAgICAgICB9XG4gICAgICBdXG4gICAgfSlcblxuICAgIGlmICh0eXBlb2Ygb3JpZ2luYWxBZnRlciA9PT0gJ2Z1bmN0aW9uJykgb3JpZ2luYWxBZnRlcihjdHgpXG4gIH0pXG59XG4iXSwibmFtZXMiOlsiY3JlYXRlQXV0aE1pZGRsZXdhcmUiLCJ1c2VBZG1pbkludml0ZUFmdGVyRW1haWxTaWduVXBNaWRkbGV3YXJlIiwib3B0aW9ucyIsImFkbWluSW52aXRhdGlvbkNvbGxlY3Rpb25TbHVnIiwidXNlckNvbGxlY3Rpb25TbHVnIiwiaG9va3MiLCJvcmlnaW5hbEFmdGVyIiwiYWZ0ZXIiLCJjdHgiLCJhZGFwdGVyIiwiY29udGV4dCIsImludGVybmFsQWRhcHRlciIsInBhdGgiLCJlbWFpbCIsImJvZHkiLCJhZG1pbkludml0ZVRva2VuIiwicXVlcnkiLCJhZG1pbkludml0YXRpb24iLCJmaW5kT25lIiwibW9kZWwiLCJ3aGVyZSIsImZpZWxkIiwidmFsdWUiLCJvcGVyYXRvciIsInJvbGUiLCJuZXdseUNyZWF0ZWRVc2VyIiwiZmluZFVzZXJCeUVtYWlsIiwidXBkYXRlIiwidXNlciIsImlkIiwiZGVsZXRlIl0sIm1hcHBpbmdzIjoiQUFDQSxTQUFTQSxvQkFBb0IsUUFBUSxrQkFBaUI7QUFFdEQ7O0NBRUMsR0FDRCxPQUFPLE1BQU1DLDJDQUEyQyxPQUFPLEVBQzdEQyxPQUFPLEVBQ1BDLDZCQUE2QixFQUM3QkMsa0JBQWtCLEVBS25CO0lBQ0NGLFFBQVFHLEtBQUssR0FBR0gsUUFBUUcsS0FBSyxJQUFJLENBQUM7SUFDbEMsTUFBTUMsZ0JBQWdCSixRQUFRRyxLQUFLLENBQUNFLEtBQUs7SUFDekNMLFFBQVFHLEtBQUssQ0FBQ0UsS0FBSyxHQUFHUCxxQkFBcUIsT0FBT1E7UUFDaEQsTUFBTUMsVUFBVUQsSUFBSUUsT0FBTyxDQUFDRCxPQUFPO1FBQ25DLE1BQU1FLGtCQUFrQkgsSUFBSUUsT0FBTyxDQUFDQyxlQUFlO1FBRW5ELElBQUlILElBQUlJLElBQUksS0FBSyxrQkFBa0I7WUFDakMsSUFBSSxPQUFPTixrQkFBa0IsWUFBWUEsY0FBY0U7WUFDdkQ7UUFDRjtRQUNBLE1BQU1LLFFBQVFMLElBQUlNLElBQUksQ0FBQ0QsS0FBSztRQUM1QixNQUFNRSxtQkFBbUJQLEtBQUtRLE9BQU9ELG9CQUFvQlAsSUFBSU0sSUFBSSxDQUFDQyxnQkFBZ0I7UUFDbEYsTUFBTUUsa0JBQW1CLE1BQU1SLFFBQVFTLE9BQU8sQ0FBQztZQUM3Q0MsT0FBT2hCO1lBQ1BpQixPQUFPO2dCQUNMO29CQUNFQyxPQUFPO29CQUNQQyxPQUFPUDtvQkFDUFEsVUFBVTtnQkFDWjthQUNEO1FBQ0g7UUFDQSxJQUFJLENBQUNOLG1CQUFtQixDQUFDQSxpQkFBaUJPLFFBQVEsQ0FBQ1gsT0FBTztZQUN4RCxJQUFJLE9BQU9QLGtCQUFrQixZQUFZQSxjQUFjRTtZQUN2RDtRQUNGO1FBRUEsTUFBTWlCLG1CQUFtQixNQUFNZCxnQkFBZ0JlLGVBQWUsQ0FBQ2I7UUFDL0QsSUFBSSxDQUFDWSxrQkFBa0I7WUFDckIsSUFBSSxPQUFPbkIsa0JBQWtCLFlBQVlBLGNBQWNFO1lBQ3ZEO1FBQ0Y7UUFFQSxNQUFNQyxRQUFRa0IsTUFBTSxDQUFDO1lBQ25CUixPQUFPZjtZQUNQZ0IsT0FBTztnQkFDTDtvQkFDRUMsT0FBTztvQkFDUEMsT0FBT0csaUJBQWlCRyxJQUFJLENBQUNDLEVBQUU7b0JBQy9CTixVQUFVO2dCQUNaO2FBQ0Q7WUFDREksUUFBUTtnQkFDTkgsTUFBTVAsaUJBQWlCTztZQUN6QjtRQUNGO1FBRUEsTUFBTWYsUUFBUXFCLE1BQU0sQ0FBQztZQUNuQlgsT0FBT2hCO1lBQ1BpQixPQUFPO2dCQUNMO29CQUNFQyxPQUFPO29CQUNQQyxPQUFPTCxnQkFBZ0JZLEVBQUU7b0JBQ3pCTixVQUFVO2dCQUNaO2FBQ0Q7UUFDSDtRQUVBLElBQUksT0FBT2pCLGtCQUFrQixZQUFZQSxjQUFjRTtJQUN6RDtBQUNGLEVBQUMifQ==