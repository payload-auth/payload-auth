import { baModelKey } from "../../constants";
import { getAdminAccess } from "../../helpers/get-admin-access";
import { getCollectionFields } from "./utils/transform-schema-fields-to-payload";
import { assertAllSchemaFields } from "./utils/collection-schema";
import { getSchemaCollectionSlug } from "./utils/collection-schema";
export function buildOauthConsentsCollection({ incomingCollections, pluginOptions, resolvedSchemas }) {
    const oauthConsentSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.oauthConsent);
    const oauthConsentSchema = resolvedSchemas[baModelKey.oauthConsent];
    const existingOauthConsentCollection = incomingCollections.find((collection)=>collection.slug === oauthConsentSlug);
    const fieldOverrides = {
        clientId: ()=>({
                admin: {
                    readOnly: true,
                    description: 'OAuth client associated with the consent'
                }
            }),
        userId: ()=>({
                admin: {
                    readOnly: true,
                    description: 'User associated with the consent'
                }
            }),
        scopes: ()=>({
                admin: {
                    readOnly: true,
                    description: 'Comma-separated list of scopes consented to'
                }
            }),
        consentGiven: ()=>({
                defaultValue: false,
                admin: {
                    readOnly: true,
                    description: 'Indicates if consent was given'
                }
            })
    };
    const oauthConsentFieldRules = [
        {
            condition: (field)=>field.type === 'date',
            transform: (field)=>({
                    ...field,
                    saveToJWT: false,
                    admin: {
                        disableBulkEdit: true,
                        hidden: true
                    },
                    index: true,
                    label: ({ t })=>t('general:updatedAt')
                })
        }
    ];
    const collectionFields = getCollectionFields({
        schema: oauthConsentSchema,
        fieldRules: oauthConsentFieldRules,
        additionalProperties: fieldOverrides
    });
    let oauthConsentCollection = {
        ...existingOauthConsentCollection,
        slug: oauthConsentSlug,
        admin: {
            hidden: pluginOptions.hidePluginCollections ?? false,
            description: 'OAuth consents are used to store user consents for OAuth clients',
            group: pluginOptions?.collectionAdminGroup ?? 'Auth',
            ...existingOauthConsentCollection?.admin
        },
        access: {
            ...getAdminAccess(pluginOptions),
            ...existingOauthConsentCollection?.access ?? {}
        },
        custom: {
            ...existingOauthConsentCollection?.custom ?? {},
            betterAuthModelKey: baModelKey.oauthConsent
        },
        fields: [
            ...existingOauthConsentCollection?.fields ?? [],
            ...collectionFields ?? []
        ]
    };
    if (typeof pluginOptions.pluginCollectionOverrides?.oauthConsents === 'function') {
        oauthConsentCollection = pluginOptions.pluginCollectionOverrides.oauthConsents({
            collection: oauthConsentCollection
        });
    }
    assertAllSchemaFields(oauthConsentCollection, oauthConsentSchema);
    return oauthConsentCollection;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL29hdXRoLWNvbnNlbnRzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGJhTW9kZWxLZXkgfSBmcm9tICcuLi8uLi9jb25zdGFudHMnXG5pbXBvcnQgeyBnZXRBZG1pbkFjY2VzcyB9IGZyb20gJy4uLy4uL2hlbHBlcnMvZ2V0LWFkbWluLWFjY2VzcydcbmltcG9ydCB7IGdldERlZmF1bHRDb2xsZWN0aW9uU2x1ZyB9IGZyb20gJy4uLy4uL2hlbHBlcnMvZ2V0LWNvbGxlY3Rpb24tc2x1ZydcbmltcG9ydCB7IGdldENvbGxlY3Rpb25GaWVsZHMgfSBmcm9tICcuL3V0aWxzL3RyYW5zZm9ybS1zY2hlbWEtZmllbGRzLXRvLXBheWxvYWQnXG5pbXBvcnQgeyBhc3NlcnRBbGxTY2hlbWFGaWVsZHMgfSBmcm9tICcuL3V0aWxzL2NvbGxlY3Rpb24tc2NoZW1hJ1xuXG5pbXBvcnQgdHlwZSB7IENvbGxlY3Rpb25Db25maWcgfSBmcm9tICdwYXlsb2FkJ1xuaW1wb3J0IHR5cGUgeyBPYXV0aENvbnNlbnQgfSBmcm9tICdAL2JldHRlci1hdXRoL2dlbmVyYXRlZC10eXBlcydcbmltcG9ydCB0eXBlIHsgRmllbGRSdWxlIH0gZnJvbSAnLi91dGlscy9tb2RlbC1maWVsZC10cmFuc2Zvcm1hdGlvbnMnXG5pbXBvcnQgdHlwZSB7IEJ1aWxkQ29sbGVjdGlvblByb3BzLCBGaWVsZE92ZXJyaWRlcyB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL3R5cGVzJ1xuaW1wb3J0IHsgZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWcgfSBmcm9tICcuL3V0aWxzL2NvbGxlY3Rpb24tc2NoZW1hJ1xuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRPYXV0aENvbnNlbnRzQ29sbGVjdGlvbih7XG4gIGluY29taW5nQ29sbGVjdGlvbnMsXG4gIHBsdWdpbk9wdGlvbnMsXG4gIHJlc29sdmVkU2NoZW1hc1xufTogQnVpbGRDb2xsZWN0aW9uUHJvcHMpOiBDb2xsZWN0aW9uQ29uZmlnIHtcbiAgY29uc3Qgb2F1dGhDb25zZW50U2x1ZyA9IGdldFNjaGVtYUNvbGxlY3Rpb25TbHVnKHJlc29sdmVkU2NoZW1hcywgYmFNb2RlbEtleS5vYXV0aENvbnNlbnQpXG4gIGNvbnN0IG9hdXRoQ29uc2VudFNjaGVtYSA9IHJlc29sdmVkU2NoZW1hc1tiYU1vZGVsS2V5Lm9hdXRoQ29uc2VudF1cblxuICBjb25zdCBleGlzdGluZ09hdXRoQ29uc2VudENvbGxlY3Rpb24gPSBpbmNvbWluZ0NvbGxlY3Rpb25zLmZpbmQoKGNvbGxlY3Rpb24pID0+IGNvbGxlY3Rpb24uc2x1ZyA9PT0gb2F1dGhDb25zZW50U2x1ZykgYXNcbiAgICB8IENvbGxlY3Rpb25Db25maWdcbiAgICB8IHVuZGVmaW5lZFxuXG4gIGNvbnN0IGZpZWxkT3ZlcnJpZGVzOiBGaWVsZE92ZXJyaWRlczxrZXlvZiBPYXV0aENvbnNlbnQ+ID0ge1xuICAgIGNsaWVudElkOiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnT0F1dGggY2xpZW50IGFzc29jaWF0ZWQgd2l0aCB0aGUgY29uc2VudCcgfVxuICAgIH0pLFxuICAgIHVzZXJJZDogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1VzZXIgYXNzb2NpYXRlZCB3aXRoIHRoZSBjb25zZW50JyB9XG4gICAgfSksXG4gICAgc2NvcGVzOiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnQ29tbWEtc2VwYXJhdGVkIGxpc3Qgb2Ygc2NvcGVzIGNvbnNlbnRlZCB0bycgfVxuICAgIH0pLFxuICAgIGNvbnNlbnRHaXZlbjogKCkgPT4gKHtcbiAgICAgIGRlZmF1bHRWYWx1ZTogZmFsc2UsXG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdJbmRpY2F0ZXMgaWYgY29uc2VudCB3YXMgZ2l2ZW4nIH1cbiAgICB9KVxuICB9XG5cbiAgY29uc3Qgb2F1dGhDb25zZW50RmllbGRSdWxlczogRmllbGRSdWxlW10gPSBbXG4gICAge1xuICAgICAgY29uZGl0aW9uOiAoZmllbGQpID0+IGZpZWxkLnR5cGUgPT09ICdkYXRlJyxcbiAgICAgIHRyYW5zZm9ybTogKGZpZWxkKSA9PiAoe1xuICAgICAgICAuLi5maWVsZCxcbiAgICAgICAgc2F2ZVRvSldUOiBmYWxzZSxcbiAgICAgICAgYWRtaW46IHtcbiAgICAgICAgICBkaXNhYmxlQnVsa0VkaXQ6IHRydWUsXG4gICAgICAgICAgaGlkZGVuOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIGluZGV4OiB0cnVlLFxuICAgICAgICBsYWJlbDogKHsgdCB9OiBhbnkpID0+IHQoJ2dlbmVyYWw6dXBkYXRlZEF0JylcbiAgICAgIH0pXG4gICAgfVxuICBdXG5cbiAgY29uc3QgY29sbGVjdGlvbkZpZWxkcyA9IGdldENvbGxlY3Rpb25GaWVsZHMoe1xuICAgIHNjaGVtYTogb2F1dGhDb25zZW50U2NoZW1hLFxuICAgIGZpZWxkUnVsZXM6IG9hdXRoQ29uc2VudEZpZWxkUnVsZXMsXG4gICAgYWRkaXRpb25hbFByb3BlcnRpZXM6IGZpZWxkT3ZlcnJpZGVzXG4gIH0pXG5cbiAgbGV0IG9hdXRoQ29uc2VudENvbGxlY3Rpb246IENvbGxlY3Rpb25Db25maWcgPSB7XG4gICAgLi4uZXhpc3RpbmdPYXV0aENvbnNlbnRDb2xsZWN0aW9uLFxuICAgIHNsdWc6IG9hdXRoQ29uc2VudFNsdWcsXG4gICAgYWRtaW46IHtcbiAgICAgIGhpZGRlbjogcGx1Z2luT3B0aW9ucy5oaWRlUGx1Z2luQ29sbGVjdGlvbnMgPz8gZmFsc2UsXG4gICAgICBkZXNjcmlwdGlvbjogJ09BdXRoIGNvbnNlbnRzIGFyZSB1c2VkIHRvIHN0b3JlIHVzZXIgY29uc2VudHMgZm9yIE9BdXRoIGNsaWVudHMnLFxuICAgICAgZ3JvdXA6IHBsdWdpbk9wdGlvbnM/LmNvbGxlY3Rpb25BZG1pbkdyb3VwID8/ICdBdXRoJyxcbiAgICAgIC4uLmV4aXN0aW5nT2F1dGhDb25zZW50Q29sbGVjdGlvbj8uYWRtaW5cbiAgICB9LFxuICAgIGFjY2Vzczoge1xuICAgICAgLi4uZ2V0QWRtaW5BY2Nlc3MocGx1Z2luT3B0aW9ucyksXG4gICAgICAuLi4oZXhpc3RpbmdPYXV0aENvbnNlbnRDb2xsZWN0aW9uPy5hY2Nlc3MgPz8ge30pXG4gICAgfSxcbiAgICBjdXN0b206IHtcbiAgICAgIC4uLihleGlzdGluZ09hdXRoQ29uc2VudENvbGxlY3Rpb24/LmN1c3RvbSA/PyB7fSksXG4gICAgICBiZXR0ZXJBdXRoTW9kZWxLZXk6IGJhTW9kZWxLZXkub2F1dGhDb25zZW50XG4gICAgfSxcbiAgICBmaWVsZHM6IFsuLi4oZXhpc3RpbmdPYXV0aENvbnNlbnRDb2xsZWN0aW9uPy5maWVsZHMgPz8gW10pLCAuLi4oY29sbGVjdGlvbkZpZWxkcyA/PyBbXSldXG4gIH1cblxuICBpZiAodHlwZW9mIHBsdWdpbk9wdGlvbnMucGx1Z2luQ29sbGVjdGlvbk92ZXJyaWRlcz8ub2F1dGhDb25zZW50cyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIG9hdXRoQ29uc2VudENvbGxlY3Rpb24gPSBwbHVnaW5PcHRpb25zLnBsdWdpbkNvbGxlY3Rpb25PdmVycmlkZXMub2F1dGhDb25zZW50cyh7XG4gICAgICBjb2xsZWN0aW9uOiBvYXV0aENvbnNlbnRDb2xsZWN0aW9uXG4gICAgfSlcbiAgfVxuXG4gIGFzc2VydEFsbFNjaGVtYUZpZWxkcyhvYXV0aENvbnNlbnRDb2xsZWN0aW9uLCBvYXV0aENvbnNlbnRTY2hlbWEpXG5cbiAgcmV0dXJuIG9hdXRoQ29uc2VudENvbGxlY3Rpb25cbn1cbiJdLCJuYW1lcyI6WyJiYU1vZGVsS2V5IiwiZ2V0QWRtaW5BY2Nlc3MiLCJnZXRDb2xsZWN0aW9uRmllbGRzIiwiYXNzZXJ0QWxsU2NoZW1hRmllbGRzIiwiZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWciLCJidWlsZE9hdXRoQ29uc2VudHNDb2xsZWN0aW9uIiwiaW5jb21pbmdDb2xsZWN0aW9ucyIsInBsdWdpbk9wdGlvbnMiLCJyZXNvbHZlZFNjaGVtYXMiLCJvYXV0aENvbnNlbnRTbHVnIiwib2F1dGhDb25zZW50Iiwib2F1dGhDb25zZW50U2NoZW1hIiwiZXhpc3RpbmdPYXV0aENvbnNlbnRDb2xsZWN0aW9uIiwiZmluZCIsImNvbGxlY3Rpb24iLCJzbHVnIiwiZmllbGRPdmVycmlkZXMiLCJjbGllbnRJZCIsImFkbWluIiwicmVhZE9ubHkiLCJkZXNjcmlwdGlvbiIsInVzZXJJZCIsInNjb3BlcyIsImNvbnNlbnRHaXZlbiIsImRlZmF1bHRWYWx1ZSIsIm9hdXRoQ29uc2VudEZpZWxkUnVsZXMiLCJjb25kaXRpb24iLCJmaWVsZCIsInR5cGUiLCJ0cmFuc2Zvcm0iLCJzYXZlVG9KV1QiLCJkaXNhYmxlQnVsa0VkaXQiLCJoaWRkZW4iLCJpbmRleCIsImxhYmVsIiwidCIsImNvbGxlY3Rpb25GaWVsZHMiLCJzY2hlbWEiLCJmaWVsZFJ1bGVzIiwiYWRkaXRpb25hbFByb3BlcnRpZXMiLCJvYXV0aENvbnNlbnRDb2xsZWN0aW9uIiwiaGlkZVBsdWdpbkNvbGxlY3Rpb25zIiwiZ3JvdXAiLCJjb2xsZWN0aW9uQWRtaW5Hcm91cCIsImFjY2VzcyIsImN1c3RvbSIsImJldHRlckF1dGhNb2RlbEtleSIsImZpZWxkcyIsInBsdWdpbkNvbGxlY3Rpb25PdmVycmlkZXMiLCJvYXV0aENvbnNlbnRzIl0sIm1hcHBpbmdzIjoiQUFBQSxTQUFTQSxVQUFVLFFBQVEsa0JBQWlCO0FBQzVDLFNBQVNDLGNBQWMsUUFBUSxpQ0FBZ0M7QUFFL0QsU0FBU0MsbUJBQW1CLFFBQVEsNkNBQTRDO0FBQ2hGLFNBQVNDLHFCQUFxQixRQUFRLDRCQUEyQjtBQU1qRSxTQUFTQyx1QkFBdUIsUUFBUSw0QkFBMkI7QUFFbkUsT0FBTyxTQUFTQyw2QkFBNkIsRUFDM0NDLG1CQUFtQixFQUNuQkMsYUFBYSxFQUNiQyxlQUFlLEVBQ007SUFDckIsTUFBTUMsbUJBQW1CTCx3QkFBd0JJLGlCQUFpQlIsV0FBV1UsWUFBWTtJQUN6RixNQUFNQyxxQkFBcUJILGVBQWUsQ0FBQ1IsV0FBV1UsWUFBWSxDQUFDO0lBRW5FLE1BQU1FLGlDQUFpQ04sb0JBQW9CTyxJQUFJLENBQUMsQ0FBQ0MsYUFBZUEsV0FBV0MsSUFBSSxLQUFLTjtJQUlwRyxNQUFNTyxpQkFBcUQ7UUFDekRDLFVBQVUsSUFBTyxDQUFBO2dCQUNmQyxPQUFPO29CQUFFQyxVQUFVO29CQUFNQyxhQUFhO2dCQUEyQztZQUNuRixDQUFBO1FBQ0FDLFFBQVEsSUFBTyxDQUFBO2dCQUNiSCxPQUFPO29CQUFFQyxVQUFVO29CQUFNQyxhQUFhO2dCQUFtQztZQUMzRSxDQUFBO1FBQ0FFLFFBQVEsSUFBTyxDQUFBO2dCQUNiSixPQUFPO29CQUFFQyxVQUFVO29CQUFNQyxhQUFhO2dCQUE4QztZQUN0RixDQUFBO1FBQ0FHLGNBQWMsSUFBTyxDQUFBO2dCQUNuQkMsY0FBYztnQkFDZE4sT0FBTztvQkFBRUMsVUFBVTtvQkFBTUMsYUFBYTtnQkFBaUM7WUFDekUsQ0FBQTtJQUNGO0lBRUEsTUFBTUsseUJBQXNDO1FBQzFDO1lBQ0VDLFdBQVcsQ0FBQ0MsUUFBVUEsTUFBTUMsSUFBSSxLQUFLO1lBQ3JDQyxXQUFXLENBQUNGLFFBQVcsQ0FBQTtvQkFDckIsR0FBR0EsS0FBSztvQkFDUkcsV0FBVztvQkFDWFosT0FBTzt3QkFDTGEsaUJBQWlCO3dCQUNqQkMsUUFBUTtvQkFDVjtvQkFDQUMsT0FBTztvQkFDUEMsT0FBTyxDQUFDLEVBQUVDLENBQUMsRUFBTyxHQUFLQSxFQUFFO2dCQUMzQixDQUFBO1FBQ0Y7S0FDRDtJQUVELE1BQU1DLG1CQUFtQmxDLG9CQUFvQjtRQUMzQ21DLFFBQVExQjtRQUNSMkIsWUFBWWI7UUFDWmMsc0JBQXNCdkI7SUFDeEI7SUFFQSxJQUFJd0IseUJBQTJDO1FBQzdDLEdBQUc1Qiw4QkFBOEI7UUFDakNHLE1BQU1OO1FBQ05TLE9BQU87WUFDTGMsUUFBUXpCLGNBQWNrQyxxQkFBcUIsSUFBSTtZQUMvQ3JCLGFBQWE7WUFDYnNCLE9BQU9uQyxlQUFlb0Msd0JBQXdCO1lBQzlDLEdBQUcvQixnQ0FBZ0NNLEtBQUs7UUFDMUM7UUFDQTBCLFFBQVE7WUFDTixHQUFHM0MsZUFBZU0sY0FBYztZQUNoQyxHQUFJSyxnQ0FBZ0NnQyxVQUFVLENBQUMsQ0FBQztRQUNsRDtRQUNBQyxRQUFRO1lBQ04sR0FBSWpDLGdDQUFnQ2lDLFVBQVUsQ0FBQyxDQUFDO1lBQ2hEQyxvQkFBb0I5QyxXQUFXVSxZQUFZO1FBQzdDO1FBQ0FxQyxRQUFRO2VBQUtuQyxnQ0FBZ0NtQyxVQUFVLEVBQUU7ZUFBT1gsb0JBQW9CLEVBQUU7U0FBRTtJQUMxRjtJQUVBLElBQUksT0FBTzdCLGNBQWN5Qyx5QkFBeUIsRUFBRUMsa0JBQWtCLFlBQVk7UUFDaEZULHlCQUF5QmpDLGNBQWN5Qyx5QkFBeUIsQ0FBQ0MsYUFBYSxDQUFDO1lBQzdFbkMsWUFBWTBCO1FBQ2Q7SUFDRjtJQUVBckMsc0JBQXNCcUMsd0JBQXdCN0I7SUFFOUMsT0FBTzZCO0FBQ1QifQ==