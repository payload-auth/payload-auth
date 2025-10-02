import { baModelKey } from "../../constants";
import { getAdminAccess } from "../../helpers/get-admin-access";
import { getCollectionFields } from "./utils/transform-schema-fields-to-payload";
import { assertAllSchemaFields, getSchemaCollectionSlug } from "./utils/collection-schema";
export function buildOauthApplicationsCollection({ incomingCollections, pluginOptions, resolvedSchemas }) {
    const oauthApplicationSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.oauthApplication);
    const oauthApplicationSchema = resolvedSchemas[baModelKey.oauthApplication];
    const existingOauthApplicationCollection = incomingCollections.find((collection)=>collection.slug === oauthApplicationSlug);
    const fieldOverrides = {
        clientId: ()=>({
                unique: true,
                index: true,
                admin: {
                    readOnly: true,
                    description: 'Unique identifier for each OAuth client'
                }
            }),
        clientSecret: ()=>({
                admin: {
                    readOnly: true,
                    description: 'Secret key for the OAuth client'
                }
            }),
        name: ()=>({
                index: true,
                admin: {
                    description: 'Name of the OAuth application'
                }
            }),
        redirectURLs: ()=>({
                admin: {
                    description: 'Comma-separated list of redirect URLs'
                }
            }),
        metadata: ()=>({
                admin: {
                    readOnly: true,
                    description: 'Additional metadata for the OAuth application'
                }
            }),
        type: ()=>({
                admin: {
                    readOnly: true,
                    description: 'Type of OAuth client (e.g., web, mobile)'
                }
            }),
        disabled: ()=>({
                defaultValue: false,
                admin: {
                    description: 'Indicates if the client is disabled'
                }
            }),
        icon: ()=>({
                admin: {
                    description: 'Icon of the OAuth application'
                }
            }),
        userId: ()=>({
                admin: {
                    readOnly: true,
                    description: 'ID of the user who owns the client. (optional)'
                }
            })
    };
    const oauthApplicationFieldRules = [
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
        schema: oauthApplicationSchema,
        fieldRules: oauthApplicationFieldRules,
        additionalProperties: fieldOverrides
    });
    let oauthApplicationCollection = {
        ...existingOauthApplicationCollection,
        slug: oauthApplicationSlug,
        admin: {
            hidden: pluginOptions.hidePluginCollections ?? false,
            useAsTitle: oauthApplicationSchema?.fields?.name?.fieldName,
            description: 'OAuth applications are custom OAuth clients',
            group: pluginOptions?.collectionAdminGroup ?? 'Auth',
            ...existingOauthApplicationCollection?.admin
        },
        access: {
            ...getAdminAccess(pluginOptions),
            ...existingOauthApplicationCollection?.access ?? {}
        },
        custom: {
            ...existingOauthApplicationCollection?.custom ?? {},
            betterAuthModelKey: baModelKey.oauthApplication
        },
        fields: [
            ...existingOauthApplicationCollection?.fields ?? [],
            ...collectionFields ?? []
        ]
    };
    if (typeof pluginOptions.pluginCollectionOverrides?.oauthApplications === 'function') {
        oauthApplicationCollection = pluginOptions.pluginCollectionOverrides.oauthApplications({
            collection: oauthApplicationCollection
        });
    }
    assertAllSchemaFields(oauthApplicationCollection, oauthApplicationSchema);
    return oauthApplicationCollection;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL29hdXRoLWFwcGxpY2F0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBiYU1vZGVsS2V5IH0gZnJvbSAnLi4vLi4vY29uc3RhbnRzJ1xuaW1wb3J0IHsgZ2V0QWRtaW5BY2Nlc3MgfSBmcm9tICcuLi8uLi9oZWxwZXJzL2dldC1hZG1pbi1hY2Nlc3MnXG5pbXBvcnQgeyBnZXREZWZhdWx0Q29sbGVjdGlvblNsdWcgfSBmcm9tICcuLi8uLi9oZWxwZXJzL2dldC1jb2xsZWN0aW9uLXNsdWcnXG5pbXBvcnQgeyBnZXRDb2xsZWN0aW9uRmllbGRzIH0gZnJvbSAnLi91dGlscy90cmFuc2Zvcm0tc2NoZW1hLWZpZWxkcy10by1wYXlsb2FkJ1xuaW1wb3J0IHsgYXNzZXJ0QWxsU2NoZW1hRmllbGRzLCBnZXRTY2hlbWFDb2xsZWN0aW9uU2x1ZyB9IGZyb20gJy4vdXRpbHMvY29sbGVjdGlvbi1zY2hlbWEnXG5cbmltcG9ydCB0eXBlIHsgQ29sbGVjdGlvbkNvbmZpZyB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgdHlwZSB7IE9hdXRoQXBwbGljYXRpb24gfSBmcm9tICdAL2JldHRlci1hdXRoL2dlbmVyYXRlZC10eXBlcydcbmltcG9ydCB0eXBlIHsgRmllbGRSdWxlIH0gZnJvbSAnLi91dGlscy9tb2RlbC1maWVsZC10cmFuc2Zvcm1hdGlvbnMnXG5pbXBvcnQgdHlwZSB7IEJ1aWxkQ29sbGVjdGlvblByb3BzLCBGaWVsZE92ZXJyaWRlcyB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL3R5cGVzJ1xuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRPYXV0aEFwcGxpY2F0aW9uc0NvbGxlY3Rpb24oe1xuICBpbmNvbWluZ0NvbGxlY3Rpb25zLFxuICBwbHVnaW5PcHRpb25zLFxuICByZXNvbHZlZFNjaGVtYXNcbn06IEJ1aWxkQ29sbGVjdGlvblByb3BzKTogQ29sbGVjdGlvbkNvbmZpZyB7XG4gIGNvbnN0IG9hdXRoQXBwbGljYXRpb25TbHVnID0gZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWcocmVzb2x2ZWRTY2hlbWFzLCBiYU1vZGVsS2V5Lm9hdXRoQXBwbGljYXRpb24pXG5cbiAgY29uc3Qgb2F1dGhBcHBsaWNhdGlvblNjaGVtYSA9IHJlc29sdmVkU2NoZW1hc1tiYU1vZGVsS2V5Lm9hdXRoQXBwbGljYXRpb25dXG5cbiAgY29uc3QgZXhpc3RpbmdPYXV0aEFwcGxpY2F0aW9uQ29sbGVjdGlvbiA9IGluY29taW5nQ29sbGVjdGlvbnMuZmluZCgoY29sbGVjdGlvbikgPT4gY29sbGVjdGlvbi5zbHVnID09PSBvYXV0aEFwcGxpY2F0aW9uU2x1ZykgYXNcbiAgICB8IENvbGxlY3Rpb25Db25maWdcbiAgICB8IHVuZGVmaW5lZFxuXG4gIGNvbnN0IGZpZWxkT3ZlcnJpZGVzOiBGaWVsZE92ZXJyaWRlczxrZXlvZiBPYXV0aEFwcGxpY2F0aW9uPiA9IHtcbiAgICBjbGllbnRJZDogKCkgPT4gKHtcbiAgICAgIHVuaXF1ZTogdHJ1ZSxcbiAgICAgIGluZGV4OiB0cnVlLFxuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnVW5pcXVlIGlkZW50aWZpZXIgZm9yIGVhY2ggT0F1dGggY2xpZW50JyB9XG4gICAgfSksXG4gICAgY2xpZW50U2VjcmV0OiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnU2VjcmV0IGtleSBmb3IgdGhlIE9BdXRoIGNsaWVudCcgfVxuICAgIH0pLFxuICAgIG5hbWU6ICgpID0+ICh7XG4gICAgICBpbmRleDogdHJ1ZSxcbiAgICAgIGFkbWluOiB7IGRlc2NyaXB0aW9uOiAnTmFtZSBvZiB0aGUgT0F1dGggYXBwbGljYXRpb24nIH1cbiAgICB9KSxcbiAgICByZWRpcmVjdFVSTHM6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyBkZXNjcmlwdGlvbjogJ0NvbW1hLXNlcGFyYXRlZCBsaXN0IG9mIHJlZGlyZWN0IFVSTHMnIH1cbiAgICB9KSxcbiAgICBtZXRhZGF0YTogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ0FkZGl0aW9uYWwgbWV0YWRhdGEgZm9yIHRoZSBPQXV0aCBhcHBsaWNhdGlvbicgfVxuICAgIH0pLFxuICAgIHR5cGU6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdUeXBlIG9mIE9BdXRoIGNsaWVudCAoZS5nLiwgd2ViLCBtb2JpbGUpJyB9XG4gICAgfSksXG4gICAgZGlzYWJsZWQ6ICgpID0+ICh7XG4gICAgICBkZWZhdWx0VmFsdWU6IGZhbHNlLFxuICAgICAgYWRtaW46IHsgZGVzY3JpcHRpb246ICdJbmRpY2F0ZXMgaWYgdGhlIGNsaWVudCBpcyBkaXNhYmxlZCcgfVxuICAgIH0pLFxuICAgIGljb246ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyBkZXNjcmlwdGlvbjogJ0ljb24gb2YgdGhlIE9BdXRoIGFwcGxpY2F0aW9uJyB9XG4gICAgfSksXG4gICAgdXNlcklkOiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnSUQgb2YgdGhlIHVzZXIgd2hvIG93bnMgdGhlIGNsaWVudC4gKG9wdGlvbmFsKScgfVxuICAgIH0pXG4gIH1cblxuICBjb25zdCBvYXV0aEFwcGxpY2F0aW9uRmllbGRSdWxlczogRmllbGRSdWxlW10gPSBbXG4gICAge1xuICAgICAgY29uZGl0aW9uOiAoZmllbGQpID0+IGZpZWxkLnR5cGUgPT09ICdkYXRlJyxcbiAgICAgIHRyYW5zZm9ybTogKGZpZWxkKSA9PiAoe1xuICAgICAgICAuLi5maWVsZCxcbiAgICAgICAgc2F2ZVRvSldUOiBmYWxzZSxcbiAgICAgICAgYWRtaW46IHtcbiAgICAgICAgICBkaXNhYmxlQnVsa0VkaXQ6IHRydWUsXG4gICAgICAgICAgaGlkZGVuOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIGluZGV4OiB0cnVlLFxuICAgICAgICBsYWJlbDogKHsgdCB9OiBhbnkpID0+IHQoJ2dlbmVyYWw6dXBkYXRlZEF0JylcbiAgICAgIH0pXG4gICAgfVxuICBdXG5cbiAgY29uc3QgY29sbGVjdGlvbkZpZWxkcyA9IGdldENvbGxlY3Rpb25GaWVsZHMoe1xuICAgIHNjaGVtYTogb2F1dGhBcHBsaWNhdGlvblNjaGVtYSxcbiAgICBmaWVsZFJ1bGVzOiBvYXV0aEFwcGxpY2F0aW9uRmllbGRSdWxlcyxcbiAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmllbGRPdmVycmlkZXNcbiAgfSlcblxuICBsZXQgb2F1dGhBcHBsaWNhdGlvbkNvbGxlY3Rpb246IENvbGxlY3Rpb25Db25maWcgPSB7XG4gICAgLi4uZXhpc3RpbmdPYXV0aEFwcGxpY2F0aW9uQ29sbGVjdGlvbixcbiAgICBzbHVnOiBvYXV0aEFwcGxpY2F0aW9uU2x1ZyxcbiAgICBhZG1pbjoge1xuICAgICAgaGlkZGVuOiBwbHVnaW5PcHRpb25zLmhpZGVQbHVnaW5Db2xsZWN0aW9ucyA/PyBmYWxzZSxcbiAgICAgIHVzZUFzVGl0bGU6IG9hdXRoQXBwbGljYXRpb25TY2hlbWE/LmZpZWxkcz8ubmFtZT8uZmllbGROYW1lLFxuICAgICAgZGVzY3JpcHRpb246ICdPQXV0aCBhcHBsaWNhdGlvbnMgYXJlIGN1c3RvbSBPQXV0aCBjbGllbnRzJyxcbiAgICAgIGdyb3VwOiBwbHVnaW5PcHRpb25zPy5jb2xsZWN0aW9uQWRtaW5Hcm91cCA/PyAnQXV0aCcsXG4gICAgICAuLi5leGlzdGluZ09hdXRoQXBwbGljYXRpb25Db2xsZWN0aW9uPy5hZG1pblxuICAgIH0sXG4gICAgYWNjZXNzOiB7XG4gICAgICAuLi5nZXRBZG1pbkFjY2VzcyhwbHVnaW5PcHRpb25zKSxcbiAgICAgIC4uLihleGlzdGluZ09hdXRoQXBwbGljYXRpb25Db2xsZWN0aW9uPy5hY2Nlc3MgPz8ge30pXG4gICAgfSxcbiAgICBjdXN0b206IHtcbiAgICAgIC4uLihleGlzdGluZ09hdXRoQXBwbGljYXRpb25Db2xsZWN0aW9uPy5jdXN0b20gPz8ge30pLFxuICAgICAgYmV0dGVyQXV0aE1vZGVsS2V5OiBiYU1vZGVsS2V5Lm9hdXRoQXBwbGljYXRpb25cbiAgICB9LFxuICAgIGZpZWxkczogWy4uLihleGlzdGluZ09hdXRoQXBwbGljYXRpb25Db2xsZWN0aW9uPy5maWVsZHMgPz8gW10pLCAuLi4oY29sbGVjdGlvbkZpZWxkcyA/PyBbXSldXG4gIH1cblxuICBpZiAodHlwZW9mIHBsdWdpbk9wdGlvbnMucGx1Z2luQ29sbGVjdGlvbk92ZXJyaWRlcz8ub2F1dGhBcHBsaWNhdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBvYXV0aEFwcGxpY2F0aW9uQ29sbGVjdGlvbiA9IHBsdWdpbk9wdGlvbnMucGx1Z2luQ29sbGVjdGlvbk92ZXJyaWRlcy5vYXV0aEFwcGxpY2F0aW9ucyh7XG4gICAgICBjb2xsZWN0aW9uOiBvYXV0aEFwcGxpY2F0aW9uQ29sbGVjdGlvblxuICAgIH0pXG4gIH1cblxuICBhc3NlcnRBbGxTY2hlbWFGaWVsZHMob2F1dGhBcHBsaWNhdGlvbkNvbGxlY3Rpb24sIG9hdXRoQXBwbGljYXRpb25TY2hlbWEpXG5cbiAgcmV0dXJuIG9hdXRoQXBwbGljYXRpb25Db2xsZWN0aW9uXG59XG4iXSwibmFtZXMiOlsiYmFNb2RlbEtleSIsImdldEFkbWluQWNjZXNzIiwiZ2V0Q29sbGVjdGlvbkZpZWxkcyIsImFzc2VydEFsbFNjaGVtYUZpZWxkcyIsImdldFNjaGVtYUNvbGxlY3Rpb25TbHVnIiwiYnVpbGRPYXV0aEFwcGxpY2F0aW9uc0NvbGxlY3Rpb24iLCJpbmNvbWluZ0NvbGxlY3Rpb25zIiwicGx1Z2luT3B0aW9ucyIsInJlc29sdmVkU2NoZW1hcyIsIm9hdXRoQXBwbGljYXRpb25TbHVnIiwib2F1dGhBcHBsaWNhdGlvbiIsIm9hdXRoQXBwbGljYXRpb25TY2hlbWEiLCJleGlzdGluZ09hdXRoQXBwbGljYXRpb25Db2xsZWN0aW9uIiwiZmluZCIsImNvbGxlY3Rpb24iLCJzbHVnIiwiZmllbGRPdmVycmlkZXMiLCJjbGllbnRJZCIsInVuaXF1ZSIsImluZGV4IiwiYWRtaW4iLCJyZWFkT25seSIsImRlc2NyaXB0aW9uIiwiY2xpZW50U2VjcmV0IiwibmFtZSIsInJlZGlyZWN0VVJMcyIsIm1ldGFkYXRhIiwidHlwZSIsImRpc2FibGVkIiwiZGVmYXVsdFZhbHVlIiwiaWNvbiIsInVzZXJJZCIsIm9hdXRoQXBwbGljYXRpb25GaWVsZFJ1bGVzIiwiY29uZGl0aW9uIiwiZmllbGQiLCJ0cmFuc2Zvcm0iLCJzYXZlVG9KV1QiLCJkaXNhYmxlQnVsa0VkaXQiLCJoaWRkZW4iLCJsYWJlbCIsInQiLCJjb2xsZWN0aW9uRmllbGRzIiwic2NoZW1hIiwiZmllbGRSdWxlcyIsImFkZGl0aW9uYWxQcm9wZXJ0aWVzIiwib2F1dGhBcHBsaWNhdGlvbkNvbGxlY3Rpb24iLCJoaWRlUGx1Z2luQ29sbGVjdGlvbnMiLCJ1c2VBc1RpdGxlIiwiZmllbGRzIiwiZmllbGROYW1lIiwiZ3JvdXAiLCJjb2xsZWN0aW9uQWRtaW5Hcm91cCIsImFjY2VzcyIsImN1c3RvbSIsImJldHRlckF1dGhNb2RlbEtleSIsInBsdWdpbkNvbGxlY3Rpb25PdmVycmlkZXMiLCJvYXV0aEFwcGxpY2F0aW9ucyJdLCJtYXBwaW5ncyI6IkFBQUEsU0FBU0EsVUFBVSxRQUFRLGtCQUFpQjtBQUM1QyxTQUFTQyxjQUFjLFFBQVEsaUNBQWdDO0FBRS9ELFNBQVNDLG1CQUFtQixRQUFRLDZDQUE0QztBQUNoRixTQUFTQyxxQkFBcUIsRUFBRUMsdUJBQXVCLFFBQVEsNEJBQTJCO0FBTzFGLE9BQU8sU0FBU0MsaUNBQWlDLEVBQy9DQyxtQkFBbUIsRUFDbkJDLGFBQWEsRUFDYkMsZUFBZSxFQUNNO0lBQ3JCLE1BQU1DLHVCQUF1Qkwsd0JBQXdCSSxpQkFBaUJSLFdBQVdVLGdCQUFnQjtJQUVqRyxNQUFNQyx5QkFBeUJILGVBQWUs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