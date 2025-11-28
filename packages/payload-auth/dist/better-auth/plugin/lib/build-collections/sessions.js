import { baModelKey, baseSlugs } from "../../constants";
import { getAdminAccess } from "../../helpers/get-admin-access";
import { getCollectionFields } from "./utils/transform-schema-fields-to-payload";
import { getDefaultCollectionSlug } from "../../helpers/get-collection-slug";
import { assertAllSchemaFields } from "./utils/collection-schema";
import { getSchemaCollectionSlug } from "./utils/collection-schema";
export function buildSessionsCollection({ incomingCollections, pluginOptions, resolvedSchemas }) {
    const sessionSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.session);
    const sessionSchema = resolvedSchemas[baModelKey.session];
    const existingSessionCollection = incomingCollections.find((collection)=>collection.slug === sessionSlug);
    const fieldOverrides = {
        userId: ()=>({
                index: true,
                saveToJWT: true,
                admin: {
                    readOnly: true,
                    description: 'The user that the session belongs to'
                },
                relationTo: getDefaultCollectionSlug({
                    modelKey: baModelKey.user,
                    pluginOptions
                })
            }),
        token: ()=>({
                index: true,
                saveToJWT: true,
                admin: {
                    readOnly: true,
                    description: 'The unique session token'
                }
            }),
        expiresAt: ()=>({
                saveToJWT: true,
                admin: {
                    readOnly: true,
                    description: 'The date and time when the session will expire'
                }
            }),
        ipAddress: ()=>({
                saveToJWT: true,
                admin: {
                    readOnly: true,
                    description: 'The IP address of the device'
                }
            }),
        userAgent: ()=>({
                saveToJWT: true,
                admin: {
                    readOnly: true,
                    description: 'The user agent information of the device'
                }
            }),
        impersonatedBy: ()=>({
                type: 'relationship',
                relationTo: pluginOptions.users?.slug ?? baseSlugs.users,
                required: false,
                saveToJWT: true,
                admin: {
                    readOnly: true,
                    description: 'The admin who is impersonating this session'
                }
            }),
        activeOrganizationId: ()=>({
                name: 'activeOrganization',
                type: 'relationship',
                saveToJWT: true,
                relationTo: getDefaultCollectionSlug({
                    modelKey: baModelKey.organization,
                    pluginOptions
                }),
                admin: {
                    readOnly: true,
                    description: 'The currently active organization for the session'
                }
            }),
        activeTeamId: ()=>({
                name: 'activeTeam',
                type: 'relationship',
                saveToJWT: true,
                relationTo: getDefaultCollectionSlug({
                    modelKey: baModelKey.team,
                    pluginOptions
                }),
                admin: {
                    readOnly: true,
                    description: 'The currently active team for the session'
                }
            })
    };
    const sessionFieldRules = [
        {
            condition: (field)=>field.fieldName === 'updatedAt' || field.fieldName === 'createdAt',
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
        schema: sessionSchema,
        fieldRules: sessionFieldRules,
        additionalProperties: fieldOverrides
    });
    let sessionCollection = {
        ...existingSessionCollection,
        slug: sessionSlug,
        admin: {
            hidden: pluginOptions.sessions?.hidden,
            description: 'Sessions are active sessions for users. They are used to authenticate users with a session token',
            group: pluginOptions?.collectionAdminGroup ?? 'Auth',
            ...existingSessionCollection?.admin
        },
        access: {
            ...getAdminAccess(pluginOptions),
            ...existingSessionCollection?.access ?? {}
        },
        custom: {
            ...existingSessionCollection?.custom ?? {},
            betterAuthModelKey: baModelKey.session
        },
        fields: [
            ...existingSessionCollection?.fields ?? [],
            ...collectionFields ?? []
        ]
    };
    if (typeof pluginOptions.sessions?.collectionOverrides === 'function') {
        sessionCollection = pluginOptions.sessions.collectionOverrides({
            collection: sessionCollection
        });
    }
    assertAllSchemaFields(sessionCollection, sessionSchema);
    return sessionCollection;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3Nlc3Npb25zLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGJhTW9kZWxLZXksIGJhc2VTbHVncyB9IGZyb20gJy4uLy4uL2NvbnN0YW50cydcbmltcG9ydCB7IGdldEFkbWluQWNjZXNzIH0gZnJvbSAnLi4vLi4vaGVscGVycy9nZXQtYWRtaW4tYWNjZXNzJ1xuaW1wb3J0IHsgZ2V0Q29sbGVjdGlvbkZpZWxkcyB9IGZyb20gJy4vdXRpbHMvdHJhbnNmb3JtLXNjaGVtYS1maWVsZHMtdG8tcGF5bG9hZCdcbmltcG9ydCB7IGdldERlZmF1bHRDb2xsZWN0aW9uU2x1ZyB9IGZyb20gJy4uLy4uL2hlbHBlcnMvZ2V0LWNvbGxlY3Rpb24tc2x1ZydcbmltcG9ydCB7IGFzc2VydEFsbFNjaGVtYUZpZWxkcyB9IGZyb20gJy4vdXRpbHMvY29sbGVjdGlvbi1zY2hlbWEnXG5pbXBvcnQgeyBnZXRTY2hlbWFDb2xsZWN0aW9uU2x1ZyB9IGZyb20gJy4vdXRpbHMvY29sbGVjdGlvbi1zY2hlbWEnXG5cbmltcG9ydCB0eXBlIHsgQ29sbGVjdGlvbkNvbmZpZyB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgdHlwZSB7IFNlc3Npb24gfSBmcm9tICdAL2JldHRlci1hdXRoL2dlbmVyYXRlZC10eXBlcydcbmltcG9ydCB0eXBlIHsgQnVpbGRDb2xsZWN0aW9uUHJvcHMsIEZpZWxkT3ZlcnJpZGVzLCBGaWVsZFJ1bGUgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi90eXBlcydcblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkU2Vzc2lvbnNDb2xsZWN0aW9uKHsgaW5jb21pbmdDb2xsZWN0aW9ucywgcGx1Z2luT3B0aW9ucywgcmVzb2x2ZWRTY2hlbWFzIH06IEJ1aWxkQ29sbGVjdGlvblByb3BzKTogQ29sbGVjdGlvbkNvbmZpZyB7XG4gIGNvbnN0IHNlc3Npb25TbHVnID0gZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWcocmVzb2x2ZWRTY2hlbWFzLCBiYU1vZGVsS2V5LnNlc3Npb24pXG4gIGNvbnN0IHNlc3Npb25TY2hlbWEgPSByZXNvbHZlZFNjaGVtYXNbYmFNb2RlbEtleS5zZXNzaW9uXVxuXG4gIGNvbnN0IGV4aXN0aW5nU2Vzc2lvbkNvbGxlY3Rpb24gPSBpbmNvbWluZ0NvbGxlY3Rpb25zLmZpbmQoKGNvbGxlY3Rpb24pID0+IGNvbGxlY3Rpb24uc2x1ZyA9PT0gc2Vzc2lvblNsdWcpIGFzXG4gICAgfCBDb2xsZWN0aW9uQ29uZmlnXG4gICAgfCB1bmRlZmluZWRcblxuICBjb25zdCBmaWVsZE92ZXJyaWRlczogRmllbGRPdmVycmlkZXM8a2V5b2YgU2Vzc2lvbj4gPSB7XG4gICAgdXNlcklkOiAoKSA9PiAoe1xuICAgICAgaW5kZXg6IHRydWUsXG4gICAgICBzYXZlVG9KV1Q6IHRydWUsXG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdUaGUgdXNlciB0aGF0IHRoZSBzZXNzaW9uIGJlbG9uZ3MgdG8nIH0sXG4gICAgICByZWxhdGlvblRvOiBnZXREZWZhdWx0Q29sbGVjdGlvblNsdWcoeyBtb2RlbEtleTogYmFNb2RlbEtleS51c2VyLCBwbHVnaW5PcHRpb25zIH0pXG4gICAgfSksXG4gICAgdG9rZW46ICgpID0+ICh7XG4gICAgICBpbmRleDogdHJ1ZSxcbiAgICAgIHNhdmVUb0pXVDogdHJ1ZSxcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSB1bmlxdWUgc2Vzc2lvbiB0b2tlbicgfVxuICAgIH0pLFxuICAgIGV4cGlyZXNBdDogKCkgPT4gKHtcbiAgICAgIHNhdmVUb0pXVDogdHJ1ZSxcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSBkYXRlIGFuZCB0aW1lIHdoZW4gdGhlIHNlc3Npb24gd2lsbCBleHBpcmUnIH1cbiAgICB9KSxcbiAgICBpcEFkZHJlc3M6ICgpID0+ICh7XG4gICAgICBzYXZlVG9KV1Q6IHRydWUsXG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdUaGUgSVAgYWRkcmVzcyBvZiB0aGUgZGV2aWNlJyB9XG4gICAgfSksXG4gICAgdXNlckFnZW50OiAoKSA9PiAoe1xuICAgICAgc2F2ZVRvSldUOiB0cnVlLFxuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnVGhlIHVzZXIgYWdlbnQgaW5mb3JtYXRpb24gb2YgdGhlIGRldmljZScgfVxuICAgIH0pLFxuICAgIGltcGVyc29uYXRlZEJ5OiAoKSA9PiAoe1xuICAgICAgdHlwZTogJ3JlbGF0aW9uc2hpcCcsXG4gICAgICByZWxhdGlvblRvOiBwbHVnaW5PcHRpb25zLnVzZXJzPy5zbHVnID8/IGJhc2VTbHVncy51c2VycyxcbiAgICAgIHJlcXVpcmVkOiBmYWxzZSxcbiAgICAgIHNhdmVUb0pXVDogdHJ1ZSxcbiAgICAgIGFkbWluOiB7XG4gICAgICAgIHJlYWRPbmx5OiB0cnVlLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBhZG1pbiB3aG8gaXMgaW1wZXJzb25hdGluZyB0aGlzIHNlc3Npb24nXG4gICAgICB9XG4gICAgfSksXG4gICAgYWN0aXZlT3JnYW5pemF0aW9uSWQ6ICgpID0+ICh7XG4gICAgICBuYW1lOiAnYWN0aXZlT3JnYW5pemF0aW9uJyxcbiAgICAgIHR5cGU6ICdyZWxhdGlvbnNoaXAnLFxuICAgICAgc2F2ZVRvSldUOiB0cnVlLFxuICAgICAgcmVsYXRpb25UbzogZ2V0RGVmYXVsdENvbGxlY3Rpb25TbHVnKHsgbW9kZWxLZXk6IGJhTW9kZWxLZXkub3JnYW5pemF0aW9uLCBwbHVnaW5PcHRpb25zIH0pLFxuICAgICAgYWRtaW46IHtcbiAgICAgICAgcmVhZE9ubHk6IHRydWUsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGN1cnJlbnRseSBhY3RpdmUgb3JnYW5pemF0aW9uIGZvciB0aGUgc2Vzc2lvbidcbiAgICAgIH1cbiAgICB9KSxcbiAgICBhY3RpdmVUZWFtSWQ6ICgpID0+ICh7XG4gICAgICBuYW1lOiAnYWN0aXZlVGVhbScsXG4gICAgICB0eXBlOiAncmVsYXRpb25zaGlwJyxcbiAgICAgIHNhdmVUb0pXVDogdHJ1ZSxcbiAgICAgIHJlbGF0aW9uVG86IGdldERlZmF1bHRDb2xsZWN0aW9uU2x1Zyh7IG1vZGVsS2V5OiBiYU1vZGVsS2V5LnRlYW0sIHBsdWdpbk9wdGlvbnMgfSksXG4gICAgICBhZG1pbjoge1xuICAgICAgICByZWFkT25seTogdHJ1ZSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgY3VycmVudGx5IGFjdGl2ZSB0ZWFtIGZvciB0aGUgc2Vzc2lvbidcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgY29uc3Qgc2Vzc2lvbkZpZWxkUnVsZXM6IEZpZWxkUnVsZVtdID0gW1xuICAgIHtcbiAgICAgIGNvbmRpdGlvbjogKGZpZWxkKSA9PiBmaWVsZC5maWVsZE5hbWUgPT09ICd1cGRhdGVkQXQnIHx8IGZpZWxkLmZpZWxkTmFtZSA9PT0gJ2NyZWF0ZWRBdCcsXG4gICAgICB0cmFuc2Zvcm06IChmaWVsZCkgPT4gKHtcbiAgICAgICAgLi4uZmllbGQsXG4gICAgICAgIHNhdmVUb0pXVDogZmFsc2UsXG4gICAgICAgIGFkbWluOiB7XG4gICAgICAgICAgZGlzYWJsZUJ1bGtFZGl0OiB0cnVlLFxuICAgICAgICAgIGhpZGRlbjogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBpbmRleDogdHJ1ZSxcbiAgICAgICAgbGFiZWw6ICh7IHQgfTogYW55KSA9PiB0KCdnZW5lcmFsOnVwZGF0ZWRBdCcpXG4gICAgICB9KVxuICAgIH1cbiAgXVxuXG4gIGNvbnN0IGNvbGxlY3Rpb25GaWVsZHMgPSBnZXRDb2xsZWN0aW9uRmllbGRzKHtcbiAgICBzY2hlbWE6IHNlc3Npb25TY2hlbWEsXG4gICAgZmllbGRSdWxlczogc2Vzc2lvbkZpZWxkUnVsZXMsXG4gICAgYWRkaXRpb25hbFByb3BlcnRpZXM6IGZpZWxkT3ZlcnJpZGVzXG4gIH0pXG5cbiAgbGV0IHNlc3Npb25Db2xsZWN0aW9uOiBDb2xsZWN0aW9uQ29uZmlnID0ge1xuICAgIC4uLmV4aXN0aW5nU2Vzc2lvbkNvbGxlY3Rpb24sXG4gICAgc2x1Zzogc2Vzc2lvblNsdWcsXG4gICAgYWRtaW46IHtcbiAgICAgIGhpZGRlbjogcGx1Z2luT3B0aW9ucy5zZXNzaW9ucz8uaGlkZGVuLFxuICAgICAgZGVzY3JpcHRpb246ICdTZXNzaW9ucyBhcmUgYWN0aXZlIHNlc3Npb25zIGZvciB1c2Vycy4gVGhleSBhcmUgdXNlZCB0byBhdXRoZW50aWNhdGUgdXNlcnMgd2l0aCBhIHNlc3Npb24gdG9rZW4nLFxuICAgICAgZ3JvdXA6IHBsdWdpbk9wdGlvbnM/LmNvbGxlY3Rpb25BZG1pbkdyb3VwID8/ICdBdXRoJyxcbiAgICAgIC4uLmV4aXN0aW5nU2Vzc2lvbkNvbGxlY3Rpb24/LmFkbWluXG4gICAgfSxcbiAgICBhY2Nlc3M6IHtcbiAgICAgIC4uLmdldEFkbWluQWNjZXNzKHBsdWdpbk9wdGlvbnMpLFxuICAgICAgLi4uKGV4aXN0aW5nU2Vzc2lvbkNvbGxlY3Rpb24/LmFjY2VzcyA/PyB7fSlcbiAgICB9LFxuICAgIGN1c3RvbToge1xuICAgICAgLi4uKGV4aXN0aW5nU2Vzc2lvbkNvbGxlY3Rpb24/LmN1c3RvbSA/PyB7fSksXG4gICAgICBiZXR0ZXJBdXRoTW9kZWxLZXk6IGJhTW9kZWxLZXkuc2Vzc2lvblxuICAgIH0sXG4gICAgZmllbGRzOiBbLi4uKGV4aXN0aW5nU2Vzc2lvbkNvbGxlY3Rpb24/LmZpZWxkcyA/PyBbXSksIC4uLihjb2xsZWN0aW9uRmllbGRzID8/IFtdKV1cbiAgfVxuXG4gIGlmICh0eXBlb2YgcGx1Z2luT3B0aW9ucy5zZXNzaW9ucz8uY29sbGVjdGlvbk92ZXJyaWRlcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHNlc3Npb25Db2xsZWN0aW9uID0gcGx1Z2luT3B0aW9ucy5zZXNzaW9ucy5jb2xsZWN0aW9uT3ZlcnJpZGVzKHtcbiAgICAgIGNvbGxlY3Rpb246IHNlc3Npb25Db2xsZWN0aW9uXG4gICAgfSlcbiAgfVxuXG4gIGFzc2VydEFsbFNjaGVtYUZpZWxkcyhzZXNzaW9uQ29sbGVjdGlvbiwgc2Vzc2lvblNjaGVtYSlcblxuICByZXR1cm4gc2Vzc2lvbkNvbGxlY3Rpb25cbn1cbiJdLCJuYW1lcyI6WyJiYU1vZGVsS2V5IiwiYmFzZVNsdWdzIiwiZ2V0QWRtaW5BY2Nlc3MiLCJnZXRDb2xsZWN0aW9uRmllbGRzIiwiZ2V0RGVmYXVsdENvbGxlY3Rpb25TbHVnIiwiYXNzZXJ0QWxsU2NoZW1hRmllbGRzIiwiZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWciLCJidWlsZFNlc3Npb25zQ29sbGVjdGlvbiIsImluY29taW5nQ29sbGVjdGlvbnMiLCJwbHVnaW5PcHRpb25zIiwicmVzb2x2ZWRTY2hlbWFzIiwic2Vzc2lvblNsdWciLCJzZXNzaW9uIiwic2Vzc2lvblNjaGVtYSIsImV4aXN0aW5nU2Vzc2lvbkNvbGxlY3Rpb24iLCJmaW5kIiwiY29sbGVjdGlvbiIsInNsdWciLCJmaWVsZE92ZXJyaWRlcyIsInVzZXJJZCIsImluZGV4Iiwic2F2ZVRvSldUIiwiYWRtaW4iLCJyZWFkT25seSIsImRlc2NyaXB0aW9uIiwicmVsYXRpb25UbyIsIm1vZGVsS2V5IiwidXNlciIsInRva2VuIiwiZXhwaXJlc0F0IiwiaXBBZGRyZXNzIiwidXNlckFnZW50IiwiaW1wZXJzb25hdGVkQnkiLCJ0eXBlIiwidXNlcnMiLCJyZXF1aXJlZCIsImFjdGl2ZU9yZ2FuaXphdGlvbklkIiwibmFtZSIsIm9yZ2FuaXphdGlvbiIsImFjdGl2ZVRlYW1JZCIsInRlYW0iLCJzZXNzaW9uRmllbGRSdWxlcyIsImNvbmRpdGlvbiIsImZpZWxkIiwiZmllbGROYW1lIiwidHJhbnNmb3JtIiwiZGlzYWJsZUJ1bGtFZGl0IiwiaGlkZGVuIiwibGFiZWwiLCJ0IiwiY29sbGVjdGlvbkZpZWxkcyIsInNjaGVtYSIsImZpZWxkUnVsZXMiLCJhZGRpdGlvbmFsUHJvcGVydGllcyIsInNlc3Npb25Db2xsZWN0aW9uIiwic2Vzc2lvbnMiLCJncm91cCIsImNvbGxlY3Rpb25BZG1pbkdyb3VwIiwiYWNjZXNzIiwiY3VzdG9tIiwiYmV0dGVyQXV0aE1vZGVsS2V5IiwiZmllbGRzIiwiY29sbGVjdGlvbk92ZXJyaWRlcyJdLCJtYXBwaW5ncyI6IkFBQUEsU0FBU0EsVUFBVSxFQUFFQyxTQUFTLFFBQVEsa0JBQWlCO0FBQ3ZELFNBQVNDLGNBQWMsUUFBUSxpQ0FBZ0M7QUFDL0QsU0FBU0MsbUJBQW1CLFFBQVEsNkNBQTRDO0FBQ2hGLFNBQVNDLHdCQUF3QixRQUFRLG9DQUFtQztBQUM1RSxTQUFTQyxxQkFBcUIsUUFBUSw0QkFBMkI7QUFDakUsU0FBU0MsdUJBQXVCLFFBQVEsNEJBQTJCO0FBTW5FLE9BQU8sU0FBU0Msd0JBQXdCLEVBQUVDLG1CQUFtQixFQUFFQyxhQUFhLEVBQUVDLGVBQWUsRUFBd0I7SUFDbkgsTUFBTUMsY0FBY0wsd0JBQXdCSSxpQkFBaUJWLFdBQVdZLE9BQU87SUFDL0UsTUFBTUMsZ0JBQWdCSCxlQUFlLENBQUNWLFdBQVdZLE9BQU8sQ0FBQztJQUV6RCxNQUFNRSw0QkFBNEJOLG9CQUFvQk8sSUFBSSxDQUFDLENBQUNDLGFBQWVBLFdBQVdDLElBQUksS0FBS047SUFJL0YsTUFBTU8saUJBQWdEO1FBQ3BEQyxRQUFRLElBQU8sQ0FBQTtnQkFDYkMsT0FBTztnQkFDUEMsV0FBVztnQkFDWEMsT0FBTztvQkFBRUMsVUFBVTtvQkFBTUMsYUFBYTtnQkFBdUM7Z0JBQzdFQyxZQUFZckIseUJBQXlCO29CQUFFc0IsVUFBVTFCLFdBQVcyQixJQUFJO29CQUFFbEI7Z0JBQWM7WUFDbEYsQ0FBQTtRQUNBbUIsT0FBTyxJQUFPLENBQUE7Z0JBQ1pSLE9BQU87Z0JBQ1BDLFdBQVc7Z0JBQ1hDLE9BQU87b0JBQUVDLFVBQVU7b0JBQU1DLGFBQWE7Z0JBQTJCO1lBQ25FLENBQUE7UUFDQUssV0FBVyxJQUFPLENB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