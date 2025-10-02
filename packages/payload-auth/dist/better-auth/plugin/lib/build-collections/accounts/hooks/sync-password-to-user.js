import { baModelKey } from "../../../../constants";
import { getSchemaCollectionSlug, getSchemaFieldName } from "../../utils/collection-schema";
export function getSyncPasswordToUserHook(resolvedSchemas) {
    const hook = async ({ doc, req, operation, context })=>{
        if (context?.syncAccountHook) return doc;
        if (operation !== 'create' && operation !== 'update') {
            return doc;
        }
        const userSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.user);
        const accountSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.account);
        const accountCollection = req.payload.collections[accountSlug]?.config;
        const userField = getSchemaFieldName(resolvedSchemas, baModelKey.account, 'userId');
        if (!doc[userField]) {
            return doc;
        }
        const account = await req.payload.findByID({
            collection: accountSlug,
            id: doc.id,
            depth: 0,
            req,
            showHiddenFields: true
        });
        if (!account || !account.password) {
            return doc;
        }
        const [salt, hash] = account.password.split(':');
        if (!salt || !hash) {
            return doc;
        }
        const userId = typeof doc[userField] === 'object' ? doc[userField]?.id : doc[userField];
        try {
            await req.payload.update({
                collection: userSlug,
                id: userId,
                data: {
                    salt,
                    hash
                },
                req,
                context: {
                    syncPasswordToUser: true
                }
            });
        } catch (error) {
            console.error('Failed to sync password to user:', error);
        }
        return doc;
    };
    return hook;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL2FjY291bnRzL2hvb2tzL3N5bmMtcGFzc3dvcmQtdG8tdXNlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBiYU1vZGVsS2V5IH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vY29uc3RhbnRzJ1xuaW1wb3J0IHR5cGUgeyBCZXR0ZXJBdXRoU2NoZW1hcyB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL3R5cGVzJ1xuaW1wb3J0IHR5cGUgeyBDb2xsZWN0aW9uQWZ0ZXJDaGFuZ2VIb29rIH0gZnJvbSAncGF5bG9hZCdcbmltcG9ydCB7IGdldFNjaGVtYUNvbGxlY3Rpb25TbHVnLCBnZXRTY2hlbWFGaWVsZE5hbWUgfSBmcm9tICcuLi8uLi91dGlscy9jb2xsZWN0aW9uLXNjaGVtYSdcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFN5bmNQYXNzd29yZFRvVXNlckhvb2socmVzb2x2ZWRTY2hlbWFzOiBCZXR0ZXJBdXRoU2NoZW1hcyk6IENvbGxlY3Rpb25BZnRlckNoYW5nZUhvb2sge1xuICBjb25zdCBob29rOiBDb2xsZWN0aW9uQWZ0ZXJDaGFuZ2VIb29rID0gYXN5bmMgKHsgZG9jLCByZXEsIG9wZXJhdGlvbiwgY29udGV4dCB9KSA9PiB7XG4gICAgaWYgKGNvbnRleHQ/LnN5bmNBY2NvdW50SG9vaykgcmV0dXJuIGRvY1xuXG4gICAgaWYgKG9wZXJhdGlvbiAhPT0gJ2NyZWF0ZScgJiYgb3BlcmF0aW9uICE9PSAndXBkYXRlJykge1xuICAgICAgcmV0dXJuIGRvY1xuICAgIH1cbiAgICBjb25zdCB1c2VyU2x1ZyA9IGdldFNjaGVtYUNvbGxlY3Rpb25TbHVnKHJlc29sdmVkU2NoZW1hcywgYmFNb2RlbEtleS51c2VyKVxuICAgIGNvbnN0IGFjY291bnRTbHVnID0gZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWcocmVzb2x2ZWRTY2hlbWFzLCBiYU1vZGVsS2V5LmFjY291bnQpXG4gICAgY29uc3QgYWNjb3VudENvbGxlY3Rpb24gPSByZXEucGF5bG9hZC5jb2xsZWN0aW9uc1thY2NvdW50U2x1Z10/LmNvbmZpZ1xuXG5cbiAgICBjb25zdCB1c2VyRmllbGQgPSBnZXRTY2hlbWFGaWVsZE5hbWUocmVzb2x2ZWRTY2hlbWFzLCBiYU1vZGVsS2V5LmFjY291bnQsICd1c2VySWQnKVxuXG4gICAgaWYgKCFkb2NbdXNlckZpZWxkXSkge1xuICAgICAgcmV0dXJuIGRvY1xuICAgIH1cblxuICAgIGNvbnN0IGFjY291bnQgPSBhd2FpdCByZXEucGF5bG9hZC5maW5kQnlJRCh7XG4gICAgICBjb2xsZWN0aW9uOiBhY2NvdW50U2x1ZyxcbiAgICAgIGlkOiBkb2MuaWQsXG4gICAgICBkZXB0aDogMCxcbiAgICAgIHJlcSxcbiAgICAgIHNob3dIaWRkZW5GaWVsZHM6IHRydWVcbiAgICB9KVxuXG4gICAgaWYgKCFhY2NvdW50IHx8ICFhY2NvdW50LnBhc3N3b3JkKSB7XG4gICAgICByZXR1cm4gZG9jXG4gICAgfVxuXG4gICAgY29uc3QgW3NhbHQsIGhhc2hdID0gYWNjb3VudC5wYXNzd29yZC5zcGxpdCgnOicpXG5cbiAgICBpZiAoIXNhbHQgfHwgIWhhc2gpIHtcbiAgICAgIHJldHVybiBkb2NcbiAgICB9XG5cbiAgICBjb25zdCB1c2VySWQgPSB0eXBlb2YgZG9jW3VzZXJGaWVsZF0gPT09ICdvYmplY3QnID8gZG9jW3VzZXJGaWVsZF0/LmlkIDogZG9jW3VzZXJGaWVsZF1cblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCByZXEucGF5bG9hZC51cGRhdGUoe1xuICAgICAgICBjb2xsZWN0aW9uOiB1c2VyU2x1ZyxcbiAgICAgICAgaWQ6IHVzZXJJZCxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIHNhbHQsXG4gICAgICAgICAgaGFzaFxuICAgICAgICB9LFxuICAgICAgICByZXEsXG4gICAgICAgIGNvbnRleHQ6IHsgc3luY1Bhc3N3b3JkVG9Vc2VyOiB0cnVlIH1cbiAgICAgIH0pXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBzeW5jIHBhc3N3b3JkIHRvIHVzZXI6JywgZXJyb3IpXG4gICAgfVxuXG4gICAgcmV0dXJuIGRvY1xuICB9XG5cbiAgcmV0dXJuIGhvb2sgYXMgQ29sbGVjdGlvbkFmdGVyQ2hhbmdlSG9va1xufVxuIl0sIm5hbWVzIjpbImJhTW9kZWxLZXkiLCJnZXRTY2hlbWFDb2xsZWN0aW9uU2x1ZyIsImdldFNjaGVtYUZpZWxkTmFtZSIsImdldFN5bmNQYXNzd29yZFRvVXNlckhvb2siLCJyZXNvbHZlZFNjaGVtYXMiLCJob29rIiwiZG9jIiwicmVxIiwib3BlcmF0aW9uIiwiY29udGV4dCIsInN5bmNBY2NvdW50SG9vayIsInVzZXJTbHVnIiwidXNlciIsImFjY291bnRTbHVnIiwiYWNjb3VudCIsImFjY291bnRDb2xsZWN0aW9uIiwicGF5bG9hZCIsImNvbGxlY3Rpb25zIiwiY29uZmlnIiwidXNlckZpZWxkIiwiZmluZEJ5SUQiLCJjb2xsZWN0aW9uIiwiaWQiLCJkZXB0aCIsInNob3dIaWRkZW5GaWVsZHMiLCJwYXNzd29yZCIsInNhbHQiLCJoYXNoIiwic3BsaXQiLCJ1c2VySWQiLCJ1cGRhdGUiLCJkYXRhIiwic3luY1Bhc3N3b3JkVG9Vc2VyIiwiZXJyb3IiLCJjb25zb2xlIl0sIm1hcHBpbmdzIjoiQUFBQSxTQUFTQSxVQUFVLFFBQVEsd0JBQWdDO0FBRzNELFNBQVNDLHVCQUF1QixFQUFFQyxrQkFBa0IsUUFBUSxnQ0FBK0I7QUFFM0YsT0FBTyxTQUFTQywwQkFBMEJDLGVBQWtDO0lBQzFFLE1BQU1DLE9BQWtDLE9BQU8sRUFBRUMsR0FBRyxFQUFFQyxHQUFHLEVBQUVDLFNBQVMsRUFBRUMsT0FBTyxFQUFFO1FBQzdFLElBQUlBLFNBQVNDLGlCQUFpQixPQUFPSjtRQUVyQyxJQUFJRSxjQUFjLFlBQVlBLGNBQWMsVUFBVTtZQUNwRCxPQUFPRjtRQUNUO1FBQ0EsTUFBTUssV0FBV1Ysd0JBQXdCRyxpQkFBaUJKLFdBQVdZLElBQUk7UUFDekUsTUFBTUMsY0FBY1osd0JBQXdCRyxpQkFBaUJKLFdBQVdjLE9BQU87UUFDL0UsTUFBTUMsb0JBQW9CUixJQUFJUyxPQUFPLENBQUNDLFdBQVcsQ0FBQ0osWUFBWSxFQUFFSztRQUdoRSxNQUFNQyxZQUFZakIsbUJBQW1CRSxpQkFBaUJKLFdBQVdjLE9BQU8sRUFBRTtRQUUxRSxJQUFJLENBQUNSLEdBQUcsQ0FBQ2EsVUFBVSxFQUFFO1lBQ25CLE9BQU9iO1FBQ1Q7UUFFQSxNQUFNUSxVQUFVLE1BQU1QLElBQUlTLE9BQU8sQ0FBQ0ksUUFBUSxDQUFDO1lBQ3pDQyxZQUFZUjtZQUNaUyxJQUFJaEIsSUFBSWdCLEVBQUU7WUFDVkMsT0FBTztZQUNQaEI7WUFDQWlCLGtCQUFrQjtRQUNwQjtRQUVBLElBQUksQ0FBQ1YsV0FBVyxDQUFDQSxRQUFRVyxRQUFRLEVBQUU7WUFDakMsT0FBT25CO1FBQ1Q7UUFFQSxNQUFNLENBQUNvQixNQUFNQyxLQUFLLEdBQUdiLFFBQVFXLFFBQVEsQ0FBQ0csS0FBSyxDQUFDO1FBRTVDLElBQUksQ0FBQ0YsUUFBUSxDQUFDQyxNQUFNO1lBQ2xCLE9BQU9yQjtRQUNUO1FBRUEsTUFBTXVCLFNBQVMsT0FBT3ZCLEdBQUcsQ0FBQ2EsVUFBVSxLQUFLLFdBQVdiLEdBQUcsQ0FBQ2EsVUFBVSxFQUFFRyxLQUFLaEIsR0FBRyxDQUFDYSxVQUFVO1FBRXZGLElBQUk7WUFDRixNQUFNWixJQUFJUyxPQUFPLENBQUNjLE1BQU0sQ0FBQztnQkFDdkJULFlBQVlWO2dCQUNaVyxJQUFJTztnQkFDSkUsTUFBTTtvQkFDSkw7b0JBQ0FDO2dCQUNGO2dCQUNBcEI7Z0JBQ0FFLFNBQVM7b0JBQUV1QixvQkFBb0I7Z0JBQUs7WUFDdEM7UUFDRixFQUFFLE9BQU9DLE9BQU87WUFDZEMsUUFBUUQsS0FBSyxDQUFDLG9DQUFvQ0E7UUFDcEQ7UUFFQSxPQUFPM0I7SUFDVDtJQUVBLE9BQU9EO0FBQ1QifQ==