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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3Nlc3Npb25zLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGJhTW9kZWxLZXksIGJhTW9kZWxLZXlUb1NsdWcsIGJhc2VTbHVncyB9IGZyb20gJy4uLy4uL2NvbnN0YW50cydcbmltcG9ydCB7IGdldEFkbWluQWNjZXNzIH0gZnJvbSAnLi4vLi4vaGVscGVycy9nZXQtYWRtaW4tYWNjZXNzJ1xuaW1wb3J0IHsgZ2V0Q29sbGVjdGlvbkZpZWxkcyB9IGZyb20gJy4vdXRpbHMvdHJhbnNmb3JtLXNjaGVtYS1maWVsZHMtdG8tcGF5bG9hZCdcbmltcG9ydCB7IGdldERlZmF1bHRDb2xsZWN0aW9uU2x1ZyB9IGZyb20gJy4uLy4uL2hlbHBlcnMvZ2V0LWNvbGxlY3Rpb24tc2x1ZydcbmltcG9ydCB7IGFzc2VydEFsbFNjaGVtYUZpZWxkcyB9IGZyb20gJy4vdXRpbHMvY29sbGVjdGlvbi1zY2hlbWEnXG5cbmltcG9ydCB0eXBlIHsgQ29sbGVjdGlvbkNvbmZpZyB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgdHlwZSB7IFNlc3Npb24gfSBmcm9tICdAL2JldHRlci1hdXRoL2dlbmVyYXRlZC10eXBlcydcbmltcG9ydCB0eXBlIHsgRmllbGRSdWxlIH0gZnJvbSAnLi91dGlscy9tb2RlbC1maWVsZC10cmFuc2Zvcm1hdGlvbnMnXG5pbXBvcnQgdHlwZSB7IEJ1aWxkQ29sbGVjdGlvblByb3BzLCBGaWVsZE92ZXJyaWRlcyB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL3R5cGVzJ1xuaW1wb3J0IHsgZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWcgfSBmcm9tICcuL3V0aWxzL2NvbGxlY3Rpb24tc2NoZW1hJ1xuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRTZXNzaW9uc0NvbGxlY3Rpb24oeyBpbmNvbWluZ0NvbGxlY3Rpb25zLCBwbHVnaW5PcHRpb25zLCByZXNvbHZlZFNjaGVtYXMgfTogQnVpbGRDb2xsZWN0aW9uUHJvcHMpOiBDb2xsZWN0aW9uQ29uZmlnIHtcbiAgY29uc3Qgc2Vzc2lvblNsdWcgPSBnZXRTY2hlbWFDb2xsZWN0aW9uU2x1ZyhyZXNvbHZlZFNjaGVtYXMsIGJhTW9kZWxLZXkuc2Vzc2lvbilcbiAgY29uc3Qgc2Vzc2lvblNjaGVtYSA9IHJlc29sdmVkU2NoZW1hc1tiYU1vZGVsS2V5LnNlc3Npb25dXG5cbiAgY29uc3QgZXhpc3RpbmdTZXNzaW9uQ29sbGVjdGlvbiA9IGluY29taW5nQ29sbGVjdGlvbnMuZmluZCgoY29sbGVjdGlvbikgPT4gY29sbGVjdGlvbi5zbHVnID09PSBzZXNzaW9uU2x1ZykgYXNcbiAgICB8IENvbGxlY3Rpb25Db25maWdcbiAgICB8IHVuZGVmaW5lZFxuXG4gIGNvbnN0IGZpZWxkT3ZlcnJpZGVzOiBGaWVsZE92ZXJyaWRlczxrZXlvZiBTZXNzaW9uPiA9IHtcbiAgICB1c2VySWQ6ICgpID0+ICh7XG4gICAgICBzYXZlVG9KV1Q6IHRydWUsXG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdUaGUgdXNlciB0aGF0IHRoZSBzZXNzaW9uIGJlbG9uZ3MgdG8nIH0sXG4gICAgICByZWxhdGlvblRvOiBnZXREZWZhdWx0Q29sbGVjdGlvblNsdWcoeyBtb2RlbEtleTogYmFNb2RlbEtleS51c2VyLCBwbHVnaW5PcHRpb25zIH0pXG4gICAgfSksXG4gICAgdG9rZW46ICgpID0+ICh7XG4gICAgICBpbmRleDogdHJ1ZSxcbiAgICAgIHNhdmVUb0pXVDogdHJ1ZSxcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSB1bmlxdWUgc2Vzc2lvbiB0b2tlbicgfVxuICAgIH0pLFxuICAgIGV4cGlyZXNBdDogKCkgPT4gKHtcbiAgICAgIHNhdmVUb0pXVDogdHJ1ZSxcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSBkYXRlIGFuZCB0aW1lIHdoZW4gdGhlIHNlc3Npb24gd2lsbCBleHBpcmUnIH1cbiAgICB9KSxcbiAgICBpcEFkZHJlc3M6ICgpID0+ICh7XG4gICAgICBzYXZlVG9KV1Q6IHRydWUsXG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdUaGUgSVAgYWRkcmVzcyBvZiB0aGUgZGV2aWNlJyB9XG4gICAgfSksXG4gICAgdXNlckFnZW50OiAoKSA9PiAoe1xuICAgICAgc2F2ZVRvSldUOiB0cnVlLFxuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnVGhlIHVzZXIgYWdlbnQgaW5mb3JtYXRpb24gb2YgdGhlIGRldmljZScgfVxuICAgIH0pLFxuICAgIGltcGVyc29uYXRlZEJ5OiAoKSA9PiAoe1xuICAgICAgdHlwZTogJ3JlbGF0aW9uc2hpcCcsXG4gICAgICByZWxhdGlvblRvOiBwbHVnaW5PcHRpb25zLnVzZXJzPy5zbHVnID8/IGJhc2VTbHVncy51c2VycyxcbiAgICAgIHJlcXVpcmVkOiBmYWxzZSxcbiAgICAgIHNhdmVUb0pXVDogdHJ1ZSxcbiAgICAgIGFkbWluOiB7XG4gICAgICAgIHJlYWRPbmx5OiB0cnVlLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBhZG1pbiB3aG8gaXMgaW1wZXJzb25hdGluZyB0aGlzIHNlc3Npb24nXG4gICAgICB9XG4gICAgfSksXG4gICAgYWN0aXZlT3JnYW5pemF0aW9uSWQ6ICgpID0+ICh7XG4gICAgICB0eXBlOiAncmVsYXRpb25zaGlwJyxcbiAgICAgIHNhdmVUb0pXVDogdHJ1ZSxcbiAgICAgIHJlbGF0aW9uVG86IGdldERlZmF1bHRDb2xsZWN0aW9uU2x1Zyh7IG1vZGVsS2V5OiBiYU1vZGVsS2V5Lm9yZ2FuaXphdGlvbiwgcGx1Z2luT3B0aW9ucyB9KSxcbiAgICAgIGFkbWluOiB7XG4gICAgICAgIHJlYWRPbmx5OiB0cnVlLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBjdXJyZW50bHkgYWN0aXZlIG9yZ2FuaXphdGlvbiBmb3IgdGhlIHNlc3Npb24nXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IHNlc3Npb25GaWVsZFJ1bGVzOiBGaWVsZFJ1bGVbXSA9IFtcbiAgICB7XG4gICAgICBjb25kaXRpb246IChmaWVsZCkgPT4gZmllbGQuZmllbGROYW1lID09PSAndXBkYXRlZEF0JyB8fCBmaWVsZC5maWVsZE5hbWUgPT09ICdjcmVhdGVkQXQnLFxuICAgICAgdHJhbnNmb3JtOiAoZmllbGQpID0+ICh7XG4gICAgICAgIC4uLmZpZWxkLFxuICAgICAgICBzYXZlVG9KV1Q6IGZhbHNlLFxuICAgICAgICBhZG1pbjoge1xuICAgICAgICAgIGRpc2FibGVCdWxrRWRpdDogdHJ1ZSxcbiAgICAgICAgICBoaWRkZW46IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgaW5kZXg6IHRydWUsXG4gICAgICAgIGxhYmVsOiAoeyB0IH06IGFueSkgPT4gdCgnZ2VuZXJhbDp1cGRhdGVkQXQnKVxuICAgICAgfSlcbiAgICB9XG4gIF1cblxuICBjb25zdCBjb2xsZWN0aW9uRmllbGRzID0gZ2V0Q29sbGVjdGlvbkZpZWxkcyh7XG4gICAgc2NoZW1hOiBzZXNzaW9uU2NoZW1hLFxuICAgIGZpZWxkUnVsZXM6IHNlc3Npb25GaWVsZFJ1bGVzLFxuICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmaWVsZE92ZXJyaWRlc1xuICB9KVxuXG4gIGxldCBzZXNzaW9uQ29sbGVjdGlvbjogQ29sbGVjdGlvbkNvbmZpZyA9IHtcbiAgICAuLi5leGlzdGluZ1Nlc3Npb25Db2xsZWN0aW9uLFxuICAgIHNsdWc6IHNlc3Npb25TbHVnLFxuICAgIGFkbWluOiB7XG4gICAgICBoaWRkZW46IHBsdWdpbk9wdGlvbnMuc2Vzc2lvbnM/LmhpZGRlbixcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2Vzc2lvbnMgYXJlIGFjdGl2ZSBzZXNzaW9ucyBmb3IgdXNlcnMuIFRoZXkgYXJlIHVzZWQgdG8gYXV0aGVudGljYXRlIHVzZXJzIHdpdGggYSBzZXNzaW9uIHRva2VuJyxcbiAgICAgIGdyb3VwOiBwbHVnaW5PcHRpb25zPy5jb2xsZWN0aW9uQWRtaW5Hcm91cCA/PyAnQXV0aCcsXG4gICAgICAuLi5leGlzdGluZ1Nlc3Npb25Db2xsZWN0aW9uPy5hZG1pblxuICAgIH0sXG4gICAgYWNjZXNzOiB7XG4gICAgICAuLi5nZXRBZG1pbkFjY2VzcyhwbHVnaW5PcHRpb25zKSxcbiAgICAgIC4uLihleGlzdGluZ1Nlc3Npb25Db2xsZWN0aW9uPy5hY2Nlc3MgPz8ge30pXG4gICAgfSxcbiAgICBjdXN0b206IHtcbiAgICAgIC4uLihleGlzdGluZ1Nlc3Npb25Db2xsZWN0aW9uPy5jdXN0b20gPz8ge30pLFxuICAgICAgYmV0dGVyQXV0aE1vZGVsS2V5OiBiYU1vZGVsS2V5LnNlc3Npb25cbiAgICB9LFxuICAgIGZpZWxkczogWy4uLihleGlzdGluZ1Nlc3Npb25Db2xsZWN0aW9uPy5maWVsZHMgPz8gW10pLCAuLi4oY29sbGVjdGlvbkZpZWxkcyA/PyBbXSldXG4gIH1cblxuICBpZiAodHlwZW9mIHBsdWdpbk9wdGlvbnMuc2Vzc2lvbnM/LmNvbGxlY3Rpb25PdmVycmlkZXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBzZXNzaW9uQ29sbGVjdGlvbiA9IHBsdWdpbk9wdGlvbnMuc2Vzc2lvbnMuY29sbGVjdGlvbk92ZXJyaWRlcyh7XG4gICAgICBjb2xsZWN0aW9uOiBzZXNzaW9uQ29sbGVjdGlvblxuICAgIH0pXG4gIH1cblxuICBhc3NlcnRBbGxTY2hlbWFGaWVsZHMoc2Vzc2lvbkNvbGxlY3Rpb24sIHNlc3Npb25TY2hlbWEpXG5cbiAgcmV0dXJuIHNlc3Npb25Db2xsZWN0aW9uXG59XG4iXSwibmFtZXMiOlsiYmFNb2RlbEtleSIsImJhc2VTbHVncyIsImdldEFkbWluQWNjZXNzIiwiZ2V0Q29sbGVjdGlvbkZpZWxkcyIsImdldERlZmF1bHRDb2xsZWN0aW9uU2x1ZyIsImFzc2VydEFsbFNjaGVtYUZpZWxkcyIsImdldFNjaGVtYUNvbGxlY3Rpb25TbHVnIiwiYnVpbGRTZXNzaW9uc0NvbGxlY3Rpb24iLCJpbmNvbWluZ0NvbGxlY3Rpb25zIiwicGx1Z2luT3B0aW9ucyIsInJlc29sdmVkU2NoZW1hcyIsInNlc3Npb25TbHVnIiwic2Vzc2lvbiIsInNlc3Npb25TY2hlbWEiLCJleGlzdGluZ1Nlc3Npb25Db2xsZWN0aW9uIiwiZmluZCIsImNvbGxlY3Rpb24iLCJzbHVnIiwiZmllbGRPdmVycmlkZXMiLCJ1c2VySWQiLCJzYXZlVG9KV1QiLCJhZG1pbiIsInJlYWRPbmx5IiwiZGVzY3JpcHRpb24iLCJyZWxhdGlvblRvIiwibW9kZWxLZXkiLCJ1c2VyIiwidG9rZW4iLCJpbmRleCIsImV4cGlyZXNBdCIsImlwQWRkcmVzcyIsInVzZXJBZ2VudCIsImltcGVyc29uYXRlZEJ5IiwidHlwZSIsInVzZXJzIiwicmVxdWlyZWQiLCJhY3RpdmVPcmdhbml6YXRpb25JZCIsIm9yZ2FuaXphdGlvbiIsInNlc3Npb25GaWVsZFJ1bGVzIiwiY29uZGl0aW9uIiwiZmllbGQiLCJmaWVsZE5hbWUiLCJ0cmFuc2Zvcm0iLCJkaXNhYmxlQnVsa0VkaXQiLCJoaWRkZW4iLCJsYWJlbCIsInQiLCJjb2xsZWN0aW9uRmllbGRzIiwic2NoZW1hIiwiZmllbGRSdWxlcyIsImFkZGl0aW9uYWxQcm9wZXJ0aWVzIiwic2Vzc2lvbkNvbGxlY3Rpb24iLCJzZXNzaW9ucyIsImdyb3VwIiwiY29sbGVjdGlvbkFkbWluR3JvdXAiLCJhY2Nlc3MiLCJjdXN0b20iLCJiZXR0ZXJBdXRoTW9kZWxLZXkiLCJmaWVsZHMiLCJjb2xsZWN0aW9uT3ZlcnJpZGVzIl0sIm1hcHBpbmdzIjoiQUFBQSxTQUFTQSxVQUFVLEVBQW9CQyxTQUFTLFFBQVEsa0JBQWlCO0FBQ3pFLFNBQVNDLGNBQWMsUUFBUSxpQ0FBZ0M7QUFDL0QsU0FBU0MsbUJBQW1CLFFBQVEsNkNBQTRDO0FBQ2hGLFNBQVNDLHdCQUF3QixRQUFRLG9DQUFtQztBQUM1RSxTQUFTQyxxQkFB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