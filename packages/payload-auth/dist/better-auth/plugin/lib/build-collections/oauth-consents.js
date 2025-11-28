import { baModelKey } from "../../constants";
import { getAdminAccess } from "../../helpers/get-admin-access";
import { getSchemaCollectionSlug } from "./utils/collection-schema";
import { getCollectionFields } from "./utils/transform-schema-fields-to-payload";
import { assertAllSchemaFields } from "./utils/collection-schema";
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL29hdXRoLWNvbnNlbnRzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGJhTW9kZWxLZXkgfSBmcm9tICcuLi8uLi9jb25zdGFudHMnXG5pbXBvcnQgeyBnZXRBZG1pbkFjY2VzcyB9IGZyb20gJy4uLy4uL2hlbHBlcnMvZ2V0LWFkbWluLWFjY2VzcydcbmltcG9ydCB7IGdldFNjaGVtYUNvbGxlY3Rpb25TbHVnIH0gZnJvbSAnLi91dGlscy9jb2xsZWN0aW9uLXNjaGVtYSdcbmltcG9ydCB7IGdldENvbGxlY3Rpb25GaWVsZHMgfSBmcm9tICcuL3V0aWxzL3RyYW5zZm9ybS1zY2hlbWEtZmllbGRzLXRvLXBheWxvYWQnXG5pbXBvcnQgeyBhc3NlcnRBbGxTY2hlbWFGaWVsZHMgfSBmcm9tICcuL3V0aWxzL2NvbGxlY3Rpb24tc2NoZW1hJ1xuaW1wb3J0IHR5cGUgeyBDb2xsZWN0aW9uQ29uZmlnIH0gZnJvbSAncGF5bG9hZCdcbmltcG9ydCB0eXBlIHsgT2F1dGhDb25zZW50IH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9nZW5lcmF0ZWQtdHlwZXMnXG5pbXBvcnQgdHlwZSB7IEJ1aWxkQ29sbGVjdGlvblByb3BzLCBGaWVsZE92ZXJyaWRlcywgRmllbGRSdWxlIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vdHlwZXMnXG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZE9hdXRoQ29uc2VudHNDb2xsZWN0aW9uKHtcbiAgaW5jb21pbmdDb2xsZWN0aW9ucyxcbiAgcGx1Z2luT3B0aW9ucyxcbiAgcmVzb2x2ZWRTY2hlbWFzXG59OiBCdWlsZENvbGxlY3Rpb25Qcm9wcyk6IENvbGxlY3Rpb25Db25maWcge1xuICBjb25zdCBvYXV0aENvbnNlbnRTbHVnID0gZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWcocmVzb2x2ZWRTY2hlbWFzLCBiYU1vZGVsS2V5Lm9hdXRoQ29uc2VudClcbiAgY29uc3Qgb2F1dGhDb25zZW50U2NoZW1hID0gcmVzb2x2ZWRTY2hlbWFzW2JhTW9kZWxLZXkub2F1dGhDb25zZW50XVxuXG4gIGNvbnN0IGV4aXN0aW5nT2F1dGhDb25zZW50Q29sbGVjdGlvbiA9IGluY29taW5nQ29sbGVjdGlvbnMuZmluZCgoY29sbGVjdGlvbikgPT4gY29sbGVjdGlvbi5zbHVnID09PSBvYXV0aENvbnNlbnRTbHVnKSBhc1xuICAgIHwgQ29sbGVjdGlvbkNvbmZpZ1xuICAgIHwgdW5kZWZpbmVkXG5cbiAgY29uc3QgZmllbGRPdmVycmlkZXM6IEZpZWxkT3ZlcnJpZGVzPGtleW9mIE9hdXRoQ29uc2VudD4gPSB7XG4gICAgY2xpZW50SWQ6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdPQXV0aCBjbGllbnQgYXNzb2NpYXRlZCB3aXRoIHRoZSBjb25zZW50JyB9XG4gICAgfSksXG4gICAgdXNlcklkOiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnVXNlciBhc3NvY2lhdGVkIHdpdGggdGhlIGNvbnNlbnQnIH1cbiAgICB9KSxcbiAgICBzY29wZXM6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdDb21tYS1zZXBhcmF0ZWQgbGlzdCBvZiBzY29wZXMgY29uc2VudGVkIHRvJyB9XG4gICAgfSksXG4gICAgY29uc2VudEdpdmVuOiAoKSA9PiAoe1xuICAgICAgZGVmYXVsdFZhbHVlOiBmYWxzZSxcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ0luZGljYXRlcyBpZiBjb25zZW50IHdhcyBnaXZlbicgfVxuICAgIH0pXG4gIH1cblxuICBjb25zdCBvYXV0aENvbnNlbnRGaWVsZFJ1bGVzOiBGaWVsZFJ1bGVbXSA9IFtcbiAgICB7XG4gICAgICBjb25kaXRpb246IChmaWVsZCkgPT4gZmllbGQudHlwZSA9PT0gJ2RhdGUnLFxuICAgICAgdHJhbnNmb3JtOiAoZmllbGQpID0+ICh7XG4gICAgICAgIC4uLmZpZWxkLFxuICAgICAgICBzYXZlVG9KV1Q6IGZhbHNlLFxuICAgICAgICBhZG1pbjoge1xuICAgICAgICAgIGRpc2FibGVCdWxrRWRpdDogdHJ1ZSxcbiAgICAgICAgICBoaWRkZW46IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgaW5kZXg6IHRydWUsXG4gICAgICAgIGxhYmVsOiAoeyB0IH06IGFueSkgPT4gdCgnZ2VuZXJhbDp1cGRhdGVkQXQnKVxuICAgICAgfSlcbiAgICB9XG4gIF1cblxuICBjb25zdCBjb2xsZWN0aW9uRmllbGRzID0gZ2V0Q29sbGVjdGlvbkZpZWxkcyh7XG4gICAgc2NoZW1hOiBvYXV0aENvbnNlbnRTY2hlbWEsXG4gICAgZmllbGRSdWxlczogb2F1dGhDb25zZW50RmllbGRSdWxlcyxcbiAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmllbGRPdmVycmlkZXNcbiAgfSlcblxuICBsZXQgb2F1dGhDb25zZW50Q29sbGVjdGlvbjogQ29sbGVjdGlvbkNvbmZpZyA9IHtcbiAgICAuLi5leGlzdGluZ09hdXRoQ29uc2VudENvbGxlY3Rpb24sXG4gICAgc2x1Zzogb2F1dGhDb25zZW50U2x1ZyxcbiAgICBhZG1pbjoge1xuICAgICAgaGlkZGVuOiBwbHVnaW5PcHRpb25zLmhpZGVQbHVnaW5Db2xsZWN0aW9ucyA/PyBmYWxzZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnT0F1dGggY29uc2VudHMgYXJlIHVzZWQgdG8gc3RvcmUgdXNlciBjb25zZW50cyBmb3IgT0F1dGggY2xpZW50cycsXG4gICAgICBncm91cDogcGx1Z2luT3B0aW9ucz8uY29sbGVjdGlvbkFkbWluR3JvdXAgPz8gJ0F1dGgnLFxuICAgICAgLi4uZXhpc3RpbmdPYXV0aENvbnNlbnRDb2xsZWN0aW9uPy5hZG1pblxuICAgIH0sXG4gICAgYWNjZXNzOiB7XG4gICAgICAuLi5nZXRBZG1pbkFjY2VzcyhwbHVnaW5PcHRpb25zKSxcbiAgICAgIC4uLihleGlzdGluZ09hdXRoQ29uc2VudENvbGxlY3Rpb24/LmFjY2VzcyA/PyB7fSlcbiAgICB9LFxuICAgIGN1c3RvbToge1xuICAgICAgLi4uKGV4aXN0aW5nT2F1dGhDb25zZW50Q29sbGVjdGlvbj8uY3VzdG9tID8/IHt9KSxcbiAgICAgIGJldHRlckF1dGhNb2RlbEtleTogYmFNb2RlbEtleS5vYXV0aENvbnNlbnRcbiAgICB9LFxuICAgIGZpZWxkczogWy4uLihleGlzdGluZ09hdXRoQ29uc2VudENvbGxlY3Rpb24/LmZpZWxkcyA/PyBbXSksIC4uLihjb2xsZWN0aW9uRmllbGRzID8/IFtdKV1cbiAgfVxuXG4gIGlmICh0eXBlb2YgcGx1Z2luT3B0aW9ucy5wbHVnaW5Db2xsZWN0aW9uT3ZlcnJpZGVzPy5vYXV0aENvbnNlbnRzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgb2F1dGhDb25zZW50Q29sbGVjdGlvbiA9IHBsdWdpbk9wdGlvbnMucGx1Z2luQ29sbGVjdGlvbk92ZXJyaWRlcy5vYXV0aENvbnNlbnRzKHtcbiAgICAgIGNvbGxlY3Rpb246IG9hdXRoQ29uc2VudENvbGxlY3Rpb25cbiAgICB9KVxuICB9XG5cbiAgYXNzZXJ0QWxsU2NoZW1hRmllbGRzKG9hdXRoQ29uc2VudENvbGxlY3Rpb24sIG9hdXRoQ29uc2VudFNjaGVtYSlcblxuICByZXR1cm4gb2F1dGhDb25zZW50Q29sbGVjdGlvblxufVxuIl0sIm5hbWVzIjpbImJhTW9kZWxLZXkiLCJnZXRBZG1pbkFjY2VzcyIsImdldFNjaGVtYUNvbGxlY3Rpb25TbHVnIiwiZ2V0Q29sbGVjdGlvbkZpZWxkcyIsImFzc2VydEFsbFNjaGVtYUZpZWxkcyIsImJ1aWxkT2F1dGhDb25zZW50c0NvbGxlY3Rpb24iLCJpbmNvbWluZ0NvbGxlY3Rpb25zIiwicGx1Z2luT3B0aW9ucyIsInJlc29sdmVkU2NoZW1hcyIsIm9hdXRoQ29uc2VudFNsdWciLCJvYXV0aENvbnNlbnQiLCJvYXV0aENvbnNlbnRTY2hlbWEiLCJleGlzdGluZ09hdXRoQ29uc2VudENvbGxlY3Rpb24iLCJmaW5kIiwiY29sbGVjdGlvbiIsInNsdWciLCJmaWVsZE92ZXJyaWRlcyIsImNsaWVudElkIiwiYWRtaW4iLCJyZWFkT25seSIsImRlc2NyaXB0aW9uIiwidXNlcklkIiwic2NvcGVzIiwiY29uc2VudEdpdmVuIiwiZGVmYXVsdFZhbHVlIiwib2F1dGhDb25zZW50RmllbGRSdWxlcyIsImNvbmRpdGlvbiIsImZpZWxkIiwidHlwZSIsInRyYW5zZm9ybSIsInNhdmVUb0pXVCIsImRpc2FibGVCdWxrRWRpdCIsImhpZGRlbiIsImluZGV4IiwibGFiZWwiLCJ0IiwiY29sbGVjdGlvbkZpZWxkcyIsInNjaGVtYSIsImZpZWxkUnVsZXMiLCJhZGRpdGlvbmFsUHJvcGVydGllcyIsIm9hdXRoQ29uc2VudENvbGxlY3Rpb24iLCJoaWRlUGx1Z2luQ29sbGVjdGlvbnMiLCJncm91cCIsImNvbGxlY3Rpb25BZG1pbkdyb3VwIiwiYWNjZXNzIiwiY3VzdG9tIiwiYmV0dGVyQXV0aE1vZGVsS2V5IiwiZmllbGRzIiwicGx1Z2luQ29sbGVjdGlvbk92ZXJyaWRlcyIsIm9hdXRoQ29uc2VudHMiXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLFVBQVUsUUFBUSxrQkFBaUI7QUFDNUMsU0FBU0MsY0FBYyxRQUFRLGlDQUFnQztBQUMvRCxTQUFTQyx1QkFBdUIsUUFBUSw0QkFBMkI7QUFDbkUsU0FBU0MsbUJBQW1CLFFBQVEsNkNBQTRDO0FBQ2hGLFNBQVNDLHFCQUFxQixRQUFRLDRCQUEyQjtBQUtqRSxPQUFPLFNBQVNDLDZCQUE2QixFQUMzQ0MsbUJBQW1CLEVBQ25CQyxhQUFhLEVBQ2JDLGVBQWUsRUFDTTtJQUNyQixNQUFNQyxtQkFBbUJQLHdCQUF3Qk0saUJBQWlCUixXQUFXVSxZQUFZO0lBQ3pGLE1BQU1DLHFCQUFxQkgsZUFBZSxDQUFDUixXQUFXVSxZQUFZLENBQUM7SUFFbkUsTUFBTUUsaUNBQWlDTixvQkFBb0JPLElBQUksQ0FBQyxDQUFDQyxhQUFlQSxXQUFXQyxJQUFJLEtBQUtOO0lBSXBHLE1BQU1PLGlCQUFxRDtRQUN6REMsVUFBVSxJQUFPLENBQUE7Z0JBQ2ZDLE9BQU87b0JBQUVDLFVBQVU7b0JBQU1DLGFBQWE7Z0JBQTJDO1lBQ25GLENBQUE7UUFDQUMsUUFBUSxJQUFPLENBQUE7Z0JBQ2JILE9BQU87b0JBQUVDLFVBQVU7b0JBQU1DLGFBQWE7Z0JBQW1DO1lBQzNFLENBQUE7UUFDQUUsUUFBUSxJQUFPLENBQUE7Z0JBQ2JKLE9BQU87b0JBQUVDLFVBQVU7b0JBQU1DLGFBQWE7Z0JBQThDO1lBQ3RGLENBQUE7UUFDQUcsY0FBYyxJQUFPLENBQUE7Z0JBQ25CQyxjQUFjO2dCQUNkTixPQUFPO29CQUFFQyxVQUFVO29CQUFNQyxhQUFhO2dCQUFpQztZQUN6RSxDQUFBO0lBQ0Y7SUFFQSxNQUFNSyx5QkFBc0M7UUFDMUM7WUFDRUMsV0FBVyxDQUFDQyxRQUFVQSxNQUFNQyxJQUFJLEtBQUs7WUFDckNDLFdBQVcsQ0FBQ0YsUUFBVyxDQUFBO29CQUNyQixHQUFHQSxLQUFLO29CQUNSRyxXQUFXO29CQUNYWixPQUFPO3dCQUNMYSxpQkFBaUI7d0JBQ2pCQyxRQUFRO29CQUNWO29CQUNBQyxPQUFPO29CQUNQQyxPQUFPLENBQUMsRUFBRUMsQ0FBQyxFQUFPLEdBQUtBLEVBQUU7Z0JBQzNCLENBQUE7UUFDRjtLQUNEO0lBRUQsTUFBTUMsbUJBQW1CakMsb0JBQW9CO1FBQzNDa0MsUUFBUTFCO1FBQ1IyQixZQUFZYjtRQUNaYyxzQkFBc0J2QjtJQUN4QjtJQUVBLElBQUl3Qix5QkFBMkM7UUFDN0MsR0FBRzVCLDhCQUE4QjtRQUNqQ0csTUFBTU47UUFDTlMsT0FBTztZQUNMYyxRQUFRekIsY0FBY2tDLHFCQUFxQixJQUFJO1lBQy9DckIsYUFBYTtZQUNic0IsT0FBT25DLGVBQWVvQyx3QkFBd0I7WUFDOUMsR0FBRy9CLGdDQUFnQ00sS0FBSztRQUMxQztRQUNBMEIsUUFBUTtZQUNOLEdBQUczQyxlQUFlTSxjQUFjO1lBQ2hDLEdBQUlLLGdDQUFnQ2dDLFVBQVUsQ0FBQyxDQUFDO1FBQ2xEO1FBQ0FDLFFBQVE7WUFDTixHQUFJakMsZ0NBQWdDaUMsVUFBVSxDQUFDLENBQUM7WUFDaERDLG9CQUFvQjlDLFdBQVdVLFlBQVk7UUFDN0M7UUFDQXFDLFFBQVE7ZUFBS25DLGdDQUFnQ21DLFVBQVUsRUFBRTtlQUFPWCxvQkFBb0IsRUFBRTtTQUFFO0lBQzFGO0lBRUEsSUFBSSxPQUFPN0IsY0FBY3lDLHlCQUF5QixFQUFFQyxrQkFBa0IsWUFBWTtRQUNoRlQseUJBQXlCakMsY0FBY3lDLHlCQUF5QixDQUFDQyxhQUFhLENBQUM7WUFDN0VuQyxZQUFZMEI7UUFDZDtJQUNGO0lBRUFwQyxzQkFBc0JvQyx3QkFBd0I3QjtJQUU5QyxPQUFPNkI7QUFDVCJ9