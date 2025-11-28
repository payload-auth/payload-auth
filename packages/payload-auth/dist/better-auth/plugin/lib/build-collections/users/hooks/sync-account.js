import { BETTER_AUTH_CONTEXT_KEY } from "../../../../../adapter";
import { baModelKey } from "../../../../constants";
import { getCollectionByModelKey, getCollectionFieldNameByFieldKey } from "../../../../helpers/get-collection";
export function getSyncAccountHook() {
    const hook = async ({ doc, req, operation, context })=>{
        if (context?.syncPasswordToUser) return doc;
        if (operation !== 'create' && operation !== 'update') return doc;
        const collections = req.payload.collections;
        const userCollection = getCollectionByModelKey(collections, baModelKey.user);
        const accountCollection = getCollectionByModelKey(collections, baModelKey.account);
        const userIdFieldName = getCollectionFieldNameByFieldKey(accountCollection, baModelKey.account, 'userId');
        const accountIdFieldName = getCollectionFieldNameByFieldKey(accountCollection, baModelKey.account, 'accountId');
        const providerIdFieldName = getCollectionFieldNameByFieldKey(accountCollection, baModelKey.account, 'providerId');
        const passwordFieldName = getCollectionFieldNameByFieldKey(accountCollection, baModelKey.account, 'password');
        const user = await req.payload.findByID({
            collection: userCollection.slug,
            id: doc.id,
            depth: 0,
            req,
            showHiddenFields: true
        });
        if (!user || !user.hash || !user.salt) return doc;
        const passwordValue = `${user.salt}:${user.hash}`;
        if (operation === 'create' && !(BETTER_AUTH_CONTEXT_KEY in context)) {
            try {
                await req.payload.create({
                    collection: accountCollection.slug,
                    data: {
                        [userIdFieldName]: doc.id,
                        [accountIdFieldName]: doc.id.toString(),
                        [providerIdFieldName]: 'credential',
                        [passwordFieldName]: passwordValue,
                        context: {
                            syncAccountHook: true
                        }
                    },
                    req
                });
            } catch (error) {
                console.error('Failed to create account for user:', error);
            }
        }
        if (operation === 'update') {
            try {
                const accounts = await req.payload.find({
                    collection: accountCollection.slug,
                    where: {
                        and: [
                            {
                                [userIdFieldName]: {
                                    equals: doc.id
                                }
                            },
                            {
                                [providerIdFieldName]: {
                                    equals: 'credential'
                                }
                            }
                        ]
                    },
                    req,
                    depth: 0,
                    context: {
                        syncAccountHook: true
                    }
                });
                const account = accounts.docs.at(0);
                if (account) {
                    await req.payload.update({
                        collection: accountCollection.slug,
                        id: account.id,
                        data: {
                            [passwordFieldName]: passwordValue
                        },
                        req,
                        context: {
                            syncAccountHook: true
                        }
                    });
                }
            } catch (error) {
                console.error('Failed to sync hash/salt to account:', error);
            }
        }
        return doc;
    };
    return hook;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3VzZXJzL2hvb2tzL3N5bmMtYWNjb3VudC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCRVRURVJfQVVUSF9DT05URVhUX0tFWSB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvYWRhcHRlcidcbmltcG9ydCB7IGJhTW9kZWxLZXkgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi9jb25zdGFudHMnXG5pbXBvcnQgeyBnZXRDb2xsZWN0aW9uQnlNb2RlbEtleSwgZ2V0Q29sbGVjdGlvbkZpZWxkTmFtZUJ5RmllbGRLZXkgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi9oZWxwZXJzL2dldC1jb2xsZWN0aW9uJ1xuaW1wb3J0IHR5cGUgeyBDb2xsZWN0aW9uQWZ0ZXJDaGFuZ2VIb29rIH0gZnJvbSAncGF5bG9hZCdcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFN5bmNBY2NvdW50SG9vaygpOiBDb2xsZWN0aW9uQWZ0ZXJDaGFuZ2VIb29rIHtcbiAgY29uc3QgaG9vazogQ29sbGVjdGlvbkFmdGVyQ2hhbmdlSG9vayA9IGFzeW5jICh7IGRvYywgcmVxLCBvcGVyYXRpb24sIGNvbnRleHQgfSkgPT4ge1xuICAgIGlmIChjb250ZXh0Py5zeW5jUGFzc3dvcmRUb1VzZXIpIHJldHVybiBkb2NcblxuICAgIGlmIChvcGVyYXRpb24gIT09ICdjcmVhdGUnICYmIG9wZXJhdGlvbiAhPT0gJ3VwZGF0ZScpIHJldHVybiBkb2NcblxuICAgIGNvbnN0IGNvbGxlY3Rpb25zID0gcmVxLnBheWxvYWQuY29sbGVjdGlvbnNcbiAgICBjb25zdCB1c2VyQ29sbGVjdGlvbiA9IGdldENvbGxlY3Rpb25CeU1vZGVsS2V5KGNvbGxlY3Rpb25zLCBiYU1vZGVsS2V5LnVzZXIpXG4gICAgY29uc3QgYWNjb3VudENvbGxlY3Rpb24gPSBnZXRDb2xsZWN0aW9uQnlNb2RlbEtleShjb2xsZWN0aW9ucywgYmFNb2RlbEtleS5hY2NvdW50KVxuXG4gICAgY29uc3QgdXNlcklkRmllbGROYW1lID0gZ2V0Q29sbGVjdGlvbkZpZWxkTmFtZUJ5RmllbGRLZXkoYWNjb3VudENvbGxlY3Rpb24sIGJhTW9kZWxLZXkuYWNjb3VudCwgJ3VzZXJJZCcpXG4gICAgY29uc3QgYWNjb3VudElkRmllbGROYW1lID0gZ2V0Q29sbGVjdGlvbkZpZWxkTmFtZUJ5RmllbGRLZXkoYWNjb3VudENvbGxlY3Rpb24sIGJhTW9kZWxLZXkuYWNjb3VudCwgJ2FjY291bnRJZCcpXG4gICAgY29uc3QgcHJvdmlkZXJJZEZpZWxkTmFtZSA9IGdldENvbGxlY3Rpb25GaWVsZE5hbWVCeUZpZWxkS2V5KGFjY291bnRDb2xsZWN0aW9uLCBiYU1vZGVsS2V5LmFjY291bnQsICdwcm92aWRlcklkJylcbiAgICBjb25zdCBwYXNzd29yZEZpZWxkTmFtZSA9IGdldENvbGxlY3Rpb25GaWVsZE5hbWVCeUZpZWxkS2V5KGFjY291bnRDb2xsZWN0aW9uLCBiYU1vZGVsS2V5LmFjY291bnQsICdwYXNzd29yZCcpXG5cbiAgICBjb25zdCB1c2VyID0gYXdhaXQgcmVxLnBheWxvYWQuZmluZEJ5SUQoe1xuICAgICAgY29sbGVjdGlvbjogdXNlckNvbGxlY3Rpb24uc2x1ZyxcbiAgICAgIGlkOiBkb2MuaWQsXG4gICAgICBkZXB0aDogMCxcbiAgICAgIHJlcSxcbiAgICAgIHNob3dIaWRkZW5GaWVsZHM6IHRydWVcbiAgICB9KVxuXG4gICAgaWYgKCF1c2VyIHx8ICF1c2VyLmhhc2ggfHwgIXVzZXIuc2FsdCkgcmV0dXJuIGRvY1xuXG4gICAgY29uc3QgcGFzc3dvcmRWYWx1ZSA9IGAke3VzZXIuc2FsdH06JHt1c2VyLmhhc2h9YFxuXG4gICAgaWYgKG9wZXJhdGlvbiA9PT0gJ2NyZWF0ZScgJiYgIShCRVRURVJfQVVUSF9DT05URVhUX0tFWSBpbiBjb250ZXh0KSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgcmVxLnBheWxvYWQuY3JlYXRlKHtcbiAgICAgICAgICBjb2xsZWN0aW9uOiBhY2NvdW50Q29sbGVjdGlvbi5zbHVnLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIFt1c2VySWRGaWVsZE5hbWVdOiBkb2MuaWQsXG4gICAgICAgICAgICBbYWNjb3VudElkRmllbGROYW1lXTogZG9jLmlkLnRvU3RyaW5nKCksXG4gICAgICAgICAgICBbcHJvdmlkZXJJZEZpZWxkTmFtZV06ICdjcmVkZW50aWFsJyxcbiAgICAgICAgICAgIFtwYXNzd29yZEZpZWxkTmFtZV06IHBhc3N3b3JkVmFsdWUsXG4gICAgICAgICAgICBjb250ZXh0OiB7IHN5bmNBY2NvdW50SG9vazogdHJ1ZSB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICByZXFcbiAgICAgICAgfSlcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjcmVhdGUgYWNjb3VudCBmb3IgdXNlcjonLCBlcnJvcilcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAob3BlcmF0aW9uID09PSAndXBkYXRlJykge1xuXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBhY2NvdW50cyA9IGF3YWl0IHJlcS5wYXlsb2FkLmZpbmQoe1xuICAgICAgICAgIGNvbGxlY3Rpb246IGFjY291bnRDb2xsZWN0aW9uLnNsdWcsXG4gICAgICAgICAgd2hlcmU6IHtcbiAgICAgICAgICAgIGFuZDogW1xuICAgICAgICAgICAgICB7IFt1c2VySWRGaWVsZE5hbWVdOiB7IGVxdWFsczogZG9jLmlkIH0gfSwgXG4gICAgICAgICAgICAgIHsgW3Byb3ZpZGVySWRGaWVsZE5hbWVdOiB7IGVxdWFsczogJ2NyZWRlbnRpYWwnIH0gfVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcmVxLFxuICAgICAgICAgIGRlcHRoOiAwLFxuICAgICAgICAgIGNvbnRleHQ6IHsgc3luY0FjY291bnRIb29rOiB0cnVlIH1cbiAgICAgICAgfSlcblxuICAgICAgICBjb25zdCBhY2NvdW50ID0gYWNjb3VudHMuZG9jcy5hdCgwKVxuICAgICAgICBpZiAoYWNjb3VudCkge1xuICAgICAgICAgIGF3YWl0IHJlcS5wYXlsb2FkLnVwZGF0ZSh7XG4gICAgICAgICAgICBjb2xsZWN0aW9uOiBhY2NvdW50Q29sbGVjdGlvbi5zbHVnLFxuICAgICAgICAgICAgaWQ6IGFjY291bnQuaWQsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgIFtwYXNzd29yZEZpZWxkTmFtZV06IHBhc3N3b3JkVmFsdWVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXEsXG4gICAgICAgICAgICBjb250ZXh0OiB7IHN5bmNBY2NvdW50SG9vazogdHJ1ZSB9XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHN5bmMgaGFzaC9zYWx0IHRvIGFjY291bnQ6JywgZXJyb3IpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRvY1xuICB9XG5cbiAgcmV0dXJuIGhvb2sgYXMgQ29sbGVjdGlvbkFmdGVyQ2hhbmdlSG9va1xufVxuIl0sIm5hbWVzIjpbIkJFVFRFUl9BVVRIX0NPTlRFWFRfS0VZIiwiYmFNb2RlbEtleSIsImdldENvbGxlY3Rpb25CeU1vZGVsS2V5IiwiZ2V0Q29sbGVjdGlvbkZpZWxkTmFtZUJ5RmllbGRLZXkiLCJnZXRTeW5jQWNjb3VudEhvb2siLCJob29rIiwiZG9jIiwicmVxIiwib3BlcmF0aW9uIiwiY29udGV4dCIsInN5bmNQYXNzd29yZFRvVXNlciIsImNvbGxlY3Rpb25zIiwicGF5bG9hZCIsInVzZXJDb2xsZWN0aW9uIiwidXNlciIsImFjY291bnRDb2xsZWN0aW9uIiwiYWNjb3VudCIsInVzZXJJZEZpZWxkTmFtZSIsImFjY291bnRJZEZpZWxkTmFtZSIsInByb3ZpZGVySWRGaWVsZE5hbWUiLCJwYXNzd29yZEZpZWxkTmFtZSIsImZpbmRCeUlEIiwiY29sbGVjdGlvbiIsInNsdWciLCJpZCIsImRlcHRoIiwic2hvd0hpZGRlbkZpZWxkcyIsImhhc2giLCJzYWx0IiwicGFzc3dvcmRWYWx1ZSIsImNyZWF0ZSIsImRhdGEiLCJ0b1N0cmluZyIsInN5bmNBY2NvdW50SG9vayIsImVycm9yIiwiY29uc29sZSIsImFjY291bnRzIiwiZmluZCIsIndoZXJlIiwiYW5kIiwiZXF1YWxzIiwiZG9jcyIsImF0IiwidXBkYXRlIl0sIm1hcHBpbmdzIjoiQUFBQSxTQUFTQSx1QkFBdUIsUUFBUSx5QkFBdUI7QUFDL0QsU0FBU0MsVUFBVSxRQUFRLHdCQUFnQztBQUMzRCxTQUFTQyx1QkFBdUIsRUFBRUMsZ0NBQWdDLFFBQVEscUNBQTZDO0FBR3ZILE9BQU8sU0FBU0M7SUFDZCxNQUFNQyxPQUFrQyxPQUFPLEVBQUVDLEdBQUcsRUFBRUMsR0FBRyxFQUFFQyxTQUFTLEVBQUVDLE9BQU8sRUFBRTtRQUM3RSxJQUFJQSxTQUFTQyxvQkFBb0IsT0FBT0o7UUFFeEMsSUFBSUUsY0FBYyxZQUFZQSxjQUFjLFVBQVUsT0FBT0Y7UUFFN0QsTUFBTUssY0FBY0osSUFBSUssT0FBTyxDQUFDRCxXQUFXO1FBQzNDLE1BQU1FLGlCQUFpQlgsd0JBQXdCUyxhQUFhVixXQUFXYSxJQUFJO1FBQzNFLE1BQU1DLG9CQUFvQmIsd0JBQXdCUyxhQUFhVixXQUFXZSxPQUFPO1FBRWpGLE1BQU1DLGtCQUFrQmQsaUNBQWlDWSxtQkFBbUJkLFdBQVdlLE9BQU8sRUFBRTtRQUNoRyxNQUFNRSxxQkFBcUJmLGlDQUFpQ1ksbUJBQW1CZCxXQUFXZSxPQUFPLEVBQUU7UUFDbkcsTUFBTUcsc0JBQXNCaEIsaUNBQWlDWSxtQkFBbUJkLFdBQVdlLE9BQU8sRUFBRTtRQUNwRyxNQUFNSSxvQkFBb0JqQixpQ0FBaUNZLG1CQUFtQmQsV0FBV2UsT0FBTyxFQUFFO1FBRWxHLE1BQU1GLE9BQU8sTUFBTVAsSUFBSUssT0FBTyxDQUFDUyxRQUFRLENBQUM7WUFDdENDLFlBQVlULGVBQWVVLElBQUk7WUFDL0JDLElBQUlsQixJQUFJa0IsRUFBRTtZQUNWQyxPQUFPO1lBQ1BsQjtZQUNBbUIsa0JBQWtCO1FBQ3BCO1FBRUEsSUFBSSxDQUFDWixRQUFRLENBQUNBLEtBQUthLElBQUksSUFBSSxDQUFDYixLQUFLYyxJQUFJLEVBQUUsT0FBT3RCO1FBRTlDLE1BQU11QixnQkFBZ0IsR0FBR2YsS0FBS2MsSUFBSSxDQUFDLENBQUMsRUFBRWQsS0FBS2EsSUFBSSxFQUFFO1FBRWpELElBQUluQixjQUFjLFlBQVksQ0FBRVIsQ0FBQUEsMkJBQTJCUyxPQUFNLEdBQUk7WUFDbkUsSUFBSTtnQkFDRixNQUFNRixJQUFJSyxPQUFPLENBQUNrQixNQUFNLENBQUM7b0JBQ3ZCUixZQUFZUCxrQkFBa0JRLElBQUk7b0JBQ2xDUSxNQUFNO3dCQUNKLENBQUNkLGdCQUFnQixFQUFFWCxJQUFJa0IsRUFBRTt3QkFDekIsQ0FBQ04sbUJBQW1CLEVBQUVaLElBQUlrQixFQUFFLENBQUNRLFFBQVE7d0JBQ3JDLENBQUNiLG9CQUFvQixFQUFFO3dCQUN2QixDQUFDQyxrQkFBa0IsRUFBRVM7d0JBQ3JCcEIsU0FBUzs0QkFBRXdCLGlCQUFpQjt3QkFBSztvQkFDbkM7b0JBQ0ExQjtnQkFDRjtZQUNGLEVBQUUsT0FBTzJCLE9BQU87Z0JBQ2RDLFFBQVFELEtBQUssQ0FBQyxzQ0FBc0NBO1lBQ3REO1FBQ0Y7UUFFQSxJQUFJMUIsY0FBYyxVQUFVO1lBRTFCLElBQUk7Z0JBQ0YsTUFBTTRCLFdBQVcsTUFBTTdCLElBQUlLLE9BQU8sQ0FBQ3lCLElBQUksQ0FBQztvQkFDdENmLFlBQVlQLGtCQUFrQlEsSUFBSTtvQkFDbENlLE9BQU87d0JBQ0xDLEtBQUs7NEJBQ0g7Z0NBQUUsQ0FBQ3RCLGdCQUFnQixFQUFFO29DQUFFdUIsUUFBUWxDLElBQUlrQixFQUFFO2dDQUFDOzRCQUFFOzRCQUN4QztnQ0FBRSxDQUFDTCxvQkFBb0IsRUFBRTtvQ0FBRXFCLFFBQVE7Z0NBQWE7NEJBQUU7eUJBQ25EO29CQUNIO29CQUNBakM7b0JBQ0FrQixPQUFPO29CQUNQaEIsU0FBUzt3QkFBRXdCLGlCQUFpQjtvQkFBSztnQkFDbkM7Z0JBRUEsTUFBTWpCLFVBQVVvQixTQUFTSyxJQUFJLENBQUNDLEVBQUUsQ0FBQztnQkFDakMsSUFBSTFCLFNBQVM7b0JBQ1gsTUFBTVQsSUFBSUssT0FBTyxDQUFDK0IsTUFBTSxDQUFDO3dCQUN2QnJCLFlBQVlQLGtCQUFrQlEsSUFBSTt3QkFDbENDLElBQUlSLFFBQVFRLEVBQUU7d0JBQ2RPLE1BQU07NEJBQ0osQ0FBQ1gsa0JBQWtCLEVBQUVTO3dCQUN2Qjt3QkFDQXRCO3dCQUNBRSxTQUFTOzRCQUFFd0IsaUJBQWlCO3dCQUFLO29CQUNuQztnQkFDRjtZQUNGLEVBQUUsT0FBT0MsT0FBTztnQkFDZEMsUUFBUUQsS0FBSyxDQUFDLHdDQUF3Q0E7WUFDeEQ7UUFDRjtRQUVBLE9BQU81QjtJQUNUO0lBRUEsT0FBT0Q7QUFDVCJ9