import { baModelKey } from "../../constants";
import { getAdminAccess } from "../../helpers/get-admin-access";
import { getCollectionFields } from "./utils/transform-schema-fields-to-payload";
import { getSchemaCollectionSlug, assertAllSchemaFields, getSchemaFieldName } from "./utils/collection-schema";
export function buildTwoFactorsCollection({ incomingCollections, pluginOptions, resolvedSchemas }) {
    const twoFactorSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.twoFactor);
    const twoFactorSchema = resolvedSchemas[baModelKey.twoFactor];
    const existingTwoFactorCollection = incomingCollections.find((collection)=>collection.slug === twoFactorSlug);
    const fieldOverrides = {
        userId: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The user that the two factor authentication secret belongs to'
                }
            }),
        secret: ()=>({
                index: true,
                admin: {
                    readOnly: true,
                    description: 'The secret used to generate the TOTP code.'
                }
            }),
        backupCodes: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The backup codes used to recover access to the account if the user loses access to their phone or email'
                }
            })
    };
    const collectionFields = getCollectionFields({
        schema: twoFactorSchema,
        additionalProperties: fieldOverrides
    });
    let twoFactorCollection = {
        ...existingTwoFactorCollection,
        slug: twoFactorSlug,
        admin: {
            hidden: pluginOptions.hidePluginCollections ?? false,
            useAsTitle: getSchemaFieldName(resolvedSchemas, baModelKey.twoFactor, 'secret'),
            description: 'Two factor authentication secrets',
            group: pluginOptions?.collectionAdminGroup ?? 'Auth',
            ...existingTwoFactorCollection?.admin
        },
        access: {
            ...getAdminAccess(pluginOptions),
            ...existingTwoFactorCollection?.access ?? {}
        },
        custom: {
            ...existingTwoFactorCollection?.custom ?? {},
            betterAuthModelKey: baModelKey.twoFactor
        },
        fields: [
            ...existingTwoFactorCollection?.fields ?? [],
            ...collectionFields ?? []
        ]
    };
    if (typeof pluginOptions.pluginCollectionOverrides?.twoFactors === 'function') {
        twoFactorCollection = pluginOptions.pluginCollectionOverrides.twoFactors({
            collection: twoFactorCollection
        });
    }
    assertAllSchemaFields(twoFactorCollection, twoFactorSchema);
    return twoFactorCollection;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3R3by1mYWN0b3JzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGJhTW9kZWxLZXkgfSBmcm9tICcuLi8uLi9jb25zdGFudHMnXG5pbXBvcnQgeyBnZXRBZG1pbkFjY2VzcyB9IGZyb20gJy4uLy4uL2hlbHBlcnMvZ2V0LWFkbWluLWFjY2VzcydcbmltcG9ydCB7IGdldENvbGxlY3Rpb25GaWVsZHMgfSBmcm9tICcuL3V0aWxzL3RyYW5zZm9ybS1zY2hlbWEtZmllbGRzLXRvLXBheWxvYWQnXG5pbXBvcnQgeyBnZXRTY2hlbWFDb2xsZWN0aW9uU2x1ZywgYXNzZXJ0QWxsU2NoZW1hRmllbGRzLCBnZXRTY2hlbWFGaWVsZE5hbWUgfSBmcm9tICcuL3V0aWxzL2NvbGxlY3Rpb24tc2NoZW1hJ1xuXG5pbXBvcnQgdHlwZSB7IENvbGxlY3Rpb25Db25maWcgfSBmcm9tICdwYXlsb2FkJ1xuaW1wb3J0IHR5cGUgeyBUd29GYWN0b3IgfSBmcm9tICdAL2JldHRlci1hdXRoL2dlbmVyYXRlZC10eXBlcydcbmltcG9ydCB0eXBlIHsgQnVpbGRDb2xsZWN0aW9uUHJvcHMsIEZpZWxkT3ZlcnJpZGVzIH0gZnJvbSAnLi4vLi4vdHlwZXMnXG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFR3b0ZhY3RvcnNDb2xsZWN0aW9uKHsgaW5jb21pbmdDb2xsZWN0aW9ucywgcGx1Z2luT3B0aW9ucywgcmVzb2x2ZWRTY2hlbWFzIH06IEJ1aWxkQ29sbGVjdGlvblByb3BzKTogQ29sbGVjdGlvbkNvbmZpZyB7XG4gIGNvbnN0IHR3b0ZhY3RvclNsdWcgPSBnZXRTY2hlbWFDb2xsZWN0aW9uU2x1ZyhyZXNvbHZlZFNjaGVtYXMsIGJhTW9kZWxLZXkudHdvRmFjdG9yKVxuICBjb25zdCB0d29GYWN0b3JTY2hlbWEgPSByZXNvbHZlZFNjaGVtYXNbYmFNb2RlbEtleS50d29GYWN0b3JdXG5cbiAgY29uc3QgZXhpc3RpbmdUd29GYWN0b3JDb2xsZWN0aW9uID0gaW5jb21pbmdDb2xsZWN0aW9ucy5maW5kKChjb2xsZWN0aW9uKSA9PiBjb2xsZWN0aW9uLnNsdWcgPT09IHR3b0ZhY3RvclNsdWcpIGFzXG4gICAgfCBDb2xsZWN0aW9uQ29uZmlnXG4gICAgfCB1bmRlZmluZWRcblxuICBjb25zdCBmaWVsZE92ZXJyaWRlczogRmllbGRPdmVycmlkZXM8a2V5b2YgVHdvRmFjdG9yPiA9IHtcbiAgICB1c2VySWQ6ICgpID0+ICh7XG4gICAgICBhZG1pbjoge1xuICAgICAgICByZWFkT25seTogdHJ1ZSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgdXNlciB0aGF0IHRoZSB0d28gZmFjdG9yIGF1dGhlbnRpY2F0aW9uIHNlY3JldCBiZWxvbmdzIHRvJ1xuICAgICAgfVxuICAgIH0pLFxuICAgIHNlY3JldDogKCkgPT4gKHtcbiAgICAgIGluZGV4OiB0cnVlLFxuICAgICAgYWRtaW46IHtcbiAgICAgICAgcmVhZE9ubHk6IHRydWUsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIHNlY3JldCB1c2VkIHRvIGdlbmVyYXRlIHRoZSBUT1RQIGNvZGUuJ1xuICAgICAgfVxuICAgIH0pLFxuICAgIGJhY2t1cENvZGVzOiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHtcbiAgICAgICAgcmVhZE9ubHk6IHRydWUsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGJhY2t1cCBjb2RlcyB1c2VkIHRvIHJlY292ZXIgYWNjZXNzIHRvIHRoZSBhY2NvdW50IGlmIHRoZSB1c2VyIGxvc2VzIGFjY2VzcyB0byB0aGVpciBwaG9uZSBvciBlbWFpbCdcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgY29uc3QgY29sbGVjdGlvbkZpZWxkcyA9IGdldENvbGxlY3Rpb25GaWVsZHMoe1xuICAgIHNjaGVtYTogdHdvRmFjdG9yU2NoZW1hLFxuICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmaWVsZE92ZXJyaWRlc1xuICB9KVxuXG4gIGxldCB0d29GYWN0b3JDb2xsZWN0aW9uOiBDb2xsZWN0aW9uQ29uZmlnID0ge1xuICAgIC4uLmV4aXN0aW5nVHdvRmFjdG9yQ29sbGVjdGlvbixcbiAgICBzbHVnOiB0d29GYWN0b3JTbHVnLFxuICAgIGFkbWluOiB7XG4gICAgICBoaWRkZW46IHBsdWdpbk9wdGlvbnMuaGlkZVBsdWdpbkNvbGxlY3Rpb25zID8/IGZhbHNlLFxuICAgICAgdXNlQXNUaXRsZTogZ2V0U2NoZW1hRmllbGROYW1lKHJlc29sdmVkU2NoZW1hcywgYmFNb2RlbEtleS50d29GYWN0b3IsICdzZWNyZXQnKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnVHdvIGZhY3RvciBhdXRoZW50aWNhdGlvbiBzZWNyZXRzJyxcbiAgICAgIGdyb3VwOiBwbHVnaW5PcHRpb25zPy5jb2xsZWN0aW9uQWRtaW5Hcm91cCA/PyAnQXV0aCcsXG4gICAgICAuLi5leGlzdGluZ1R3b0ZhY3RvckNvbGxlY3Rpb24/LmFkbWluXG4gICAgfSxcbiAgICBhY2Nlc3M6IHtcbiAgICAgIC4uLmdldEFkbWluQWNjZXNzKHBsdWdpbk9wdGlvbnMpLFxuICAgICAgLi4uKGV4aXN0aW5nVHdvRmFjdG9yQ29sbGVjdGlvbj8uYWNjZXNzID8/IHt9KVxuICAgIH0sXG4gICAgY3VzdG9tOiB7XG4gICAgICAuLi4oZXhpc3RpbmdUd29GYWN0b3JDb2xsZWN0aW9uPy5jdXN0b20gPz8ge30pLFxuICAgICAgYmV0dGVyQXV0aE1vZGVsS2V5OiBiYU1vZGVsS2V5LnR3b0ZhY3RvclxuICAgIH0sXG4gICAgZmllbGRzOiBbLi4uKGV4aXN0aW5nVHdvRmFjdG9yQ29sbGVjdGlvbj8uZmllbGRzID8/IFtdKSwgLi4uKGNvbGxlY3Rpb25GaWVsZHMgPz8gW10pXVxuICB9XG5cbiAgaWYgKHR5cGVvZiBwbHVnaW5PcHRpb25zLnBsdWdpbkNvbGxlY3Rpb25PdmVycmlkZXM/LnR3b0ZhY3RvcnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICB0d29GYWN0b3JDb2xsZWN0aW9uID0gcGx1Z2luT3B0aW9ucy5wbHVnaW5Db2xsZWN0aW9uT3ZlcnJpZGVzLnR3b0ZhY3RvcnMoe1xuICAgICAgY29sbGVjdGlvbjogdHdvRmFjdG9yQ29sbGVjdGlvblxuICAgIH0pXG4gIH1cblxuICBhc3NlcnRBbGxTY2hlbWFGaWVsZHModHdvRmFjdG9yQ29sbGVjdGlvbiwgdHdvRmFjdG9yU2NoZW1hKVxuXG4gIHJldHVybiB0d29GYWN0b3JDb2xsZWN0aW9uXG59XG4iXSwibmFtZXMiOlsiYmFNb2RlbEtleSIsImdldEFkbWluQWNjZXNzIiwiZ2V0Q29sbGVjdGlvbkZpZWxkcyIsImdldFNjaGVtYUNvbGxlY3Rpb25TbHVnIiwiYXNzZXJ0QWxsU2NoZW1hRmllbGRzIiwiZ2V0U2NoZW1hRmllbGROYW1lIiwiYnVpbGRUd29GYWN0b3JzQ29sbGVjdGlvbiIsImluY29taW5nQ29sbGVjdGlvbnMiLCJwbHVnaW5PcHRpb25zIiwicmVzb2x2ZWRTY2hlbWFzIiwidHdvRmFjdG9yU2x1ZyIsInR3b0ZhY3RvciIsInR3b0ZhY3RvclNjaGVtYSIsImV4aXN0aW5nVHdvRmFjdG9yQ29sbGVjdGlvbiIsImZpbmQiLCJjb2xsZWN0aW9uIiwic2x1ZyIsImZpZWxkT3ZlcnJpZGVzIiwidXNlcklkIiwiYWRtaW4iLCJyZWFkT25seSIsImRlc2NyaXB0aW9uIiwic2VjcmV0IiwiaW5kZXgiLCJiYWNrdXBDb2RlcyIsImNvbGxlY3Rpb25GaWVsZHMiLCJzY2hlbWEiLCJhZGRpdGlvbmFsUHJvcGVydGllcyIsInR3b0ZhY3RvckNvbGxlY3Rpb24iLCJoaWRkZW4iLCJoaWRlUGx1Z2luQ29sbGVjdGlvbnMiLCJ1c2VBc1RpdGxlIiwiZ3JvdXAiLCJjb2xsZWN0aW9uQWRtaW5Hcm91cCIsImFjY2VzcyIsImN1c3RvbSIsImJldHRlckF1dGhNb2RlbEtleSIsImZpZWxkcyIsInBsdWdpbkNvbGxlY3Rpb25PdmVycmlkZXMiLCJ0d29GYWN0b3JzIl0sIm1hcHBpbmdzIjoiQUFBQSxTQUFTQSxVQUFVLFFBQVEsa0JBQWlCO0FBQzVDLFNBQVNDLGNBQWMsUUFBUSxpQ0FBZ0M7QUFDL0QsU0FBU0MsbUJBQW1CLFFBQVEsNkNBQTRDO0FBQ2hGLFNBQVNDLHVCQUF1QixFQUFFQyxxQkFBcUIsRUFBRUMsa0JBQWtCLFFBQVEsNEJBQTJCO0FBTTlHLE9BQU8sU0FBU0MsMEJBQTBCLEVBQUVDLG1CQUFtQixFQUFFQyxhQUFhLEVBQUVDLGVBQWUsRUFBd0I7SUFDckgsTUFBTUMsZ0JBQWdCUCx3QkFBd0JNLGlCQUFpQlQsV0FBV1csU0FBUztJQUNuRixNQUFNQyxrQkFBa0JILGVBQWUsQ0FBQ1QsV0FBV1csU0FBUyxDQUFDO0lBRTdELE1BQU1FLDhCQUE4Qk4sb0JBQW9CTyxJQUFJLENBQUMsQ0FBQ0MsYUFBZUEsV0FBV0MsSUFBSSxLQUFLTjtJQUlqRyxNQUFNTyxpQkFBa0Q7UUFDdERDLFFBQVEsSUFBTyxDQUFBO2dCQUNiQyxPQUFPO29CQUNMQyxVQUFVO29CQUNWQyxhQUFhO2dCQUNmO1lBQ0YsQ0FBQTtRQUNBQyxRQUFRLElBQU8sQ0FBQTtnQkFDYkMsT0FBTztnQkFDUEosT0FBTztvQkFDTEMsVUFBVTtvQkFDVkMsYUFBYTtnQkFDZjtZQUNGLENBQUE7UUFDQUcsYUFBYSxJQUFPLENBQUE7Z0JBQ2xCTCxPQUFPO29CQUNMQyxVQUFVO29CQUNWQyxhQUFhO2dCQUNmO1lBQ0YsQ0FBQTtJQUNGO0lBRUEsTUFBTUksbUJBQW1CdkIsb0JBQW9CO1FBQzNDd0IsUUFBUWQ7UUFDUmUsc0JBQXNCVjtJQUN4QjtJQUVBLElBQUlXLHNCQUF3QztRQUMxQyxHQUFHZiwyQkFBMkI7UUFDOUJHLE1BQU1OO1FBQ05TLE9BQU87WUFDTFUsUUFBUXJCLGNBQWNzQixxQkFBcUIsSUFBSTtZQUMvQ0MsWUFBWTFCLG1CQUFtQkksaUJBQWlCVCxXQUFXVyxTQUFTLEVBQUU7WUFDdEVVLGFBQWE7WUFDYlcsT0FBT3hCLGVBQWV5Qix3QkFBd0I7WUFDOUMsR0FBR3BCLDZCQUE2Qk0sS0FBSztRQUN2QztRQUNBZSxRQUFRO1lBQ04sR0FBR2pDLGVBQWVPLGNBQWM7WUFDaEMsR0FBSUssNkJBQTZCcUIsVUFBVSxDQUFDLENBQUM7UUFDL0M7UUFDQUMsUUFBUTtZQUNOLEdBQUl0Qiw2QkFBNkJzQixVQUFVLENBQUMsQ0FBQztZQUM3Q0Msb0JBQW9CcEMsV0FBV1csU0FBUztRQUMxQztRQUNBMEIsUUFBUTtlQUFLeEIsNkJBQTZCd0IsVUFBVSxFQUFFO2VBQU9aLG9CQUFvQixFQUFFO1NBQUU7SUFDdkY7SUFFQSxJQUFJLE9BQU9qQixjQUFjOEIseUJBQXlCLEVBQUVDLGVBQWUsWUFBWTtRQUM3RVgsc0JBQXNCcEIsY0FBYzhCLHlCQUF5QixDQUFDQyxVQUFVLENBQUM7WUFDdkV4QixZQUFZYTtRQUNkO0lBQ0Y7SUFFQXhCLHNCQUFzQndCLHFCQUFxQmhCO0lBRTNDLE9BQU9nQjtBQUNUIn0=