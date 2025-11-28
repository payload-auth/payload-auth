import { baModelKey } from "../../constants";
import { getAdminAccess } from "../../helpers/get-admin-access";
import { getCollectionFields } from "./utils/transform-schema-fields-to-payload";
import { getSchemaCollectionSlug, getSchemaFieldName, assertAllSchemaFields } from "./utils/collection-schema";
export function buildDeviceCodeCollection({ incomingCollections, pluginOptions, resolvedSchemas }) {
    const deviceCodeSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.deviceCode);
    const deviceCodeSchema = resolvedSchemas[baModelKey.deviceCode];
    const existingDeviceCodeCollection = incomingCollections.find((collection)=>collection.slug === deviceCodeSlug);
    const fieldOverrides = {
        userId: ()=>({
                index: true,
                admin: {
                    readOnly: true,
                    description: 'The user that is a member of the team.'
                }
            })
    };
    const collectionFields = getCollectionFields({
        schema: deviceCodeSchema,
        additionalProperties: fieldOverrides
    });
    let deviceCodeCollection = {
        ...existingDeviceCodeCollection,
        slug: deviceCodeSlug,
        admin: {
            hidden: pluginOptions.hidePluginCollections ?? false,
            useAsTitle: getSchemaFieldName(resolvedSchemas, baModelKey.deviceCode, 'deviceCode'),
            description: 'Device codes of an organization team.',
            group: pluginOptions?.collectionAdminGroup ?? 'Auth',
            ...existingDeviceCodeCollection?.admin
        },
        access: {
            ...getAdminAccess(pluginOptions),
            ...existingDeviceCodeCollection?.access ?? {}
        },
        custom: {
            ...existingDeviceCodeCollection?.custom ?? {},
            betterAuthModelKey: baModelKey.deviceCode
        },
        fields: [
            ...existingDeviceCodeCollection?.fields ?? [],
            ...collectionFields ?? []
        ]
    };
    assertAllSchemaFields(deviceCodeCollection, deviceCodeSchema);
    return deviceCodeCollection;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL2RldmljZS1jb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGJhTW9kZWxLZXkgfSBmcm9tICcuLi8uLi9jb25zdGFudHMnXG5pbXBvcnQgeyBnZXRBZG1pbkFjY2VzcyB9IGZyb20gJy4uLy4uL2hlbHBlcnMvZ2V0LWFkbWluLWFjY2VzcydcbmltcG9ydCB7IGdldENvbGxlY3Rpb25GaWVsZHMgfSBmcm9tICcuL3V0aWxzL3RyYW5zZm9ybS1zY2hlbWEtZmllbGRzLXRvLXBheWxvYWQnXG5pbXBvcnQgeyBnZXRTY2hlbWFDb2xsZWN0aW9uU2x1ZywgZ2V0U2NoZW1hRmllbGROYW1lLCBhc3NlcnRBbGxTY2hlbWFGaWVsZHMgfSBmcm9tICcuL3V0aWxzL2NvbGxlY3Rpb24tc2NoZW1hJ1xuXG5pbXBvcnQgdHlwZSB7IENvbGxlY3Rpb25Db25maWcgfSBmcm9tICdwYXlsb2FkJ1xuaW1wb3J0IHR5cGUgeyBCdWlsZENvbGxlY3Rpb25Qcm9wcywgRmllbGRPdmVycmlkZXMgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi90eXBlcydcbmltcG9ydCB0eXBlIHsgRGV2aWNlQ29kZSB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvZ2VuZXJhdGVkLXR5cGVzJ1xuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGREZXZpY2VDb2RlQ29sbGVjdGlvbih7IGluY29taW5nQ29sbGVjdGlvbnMsIHBsdWdpbk9wdGlvbnMsIHJlc29sdmVkU2NoZW1hcyB9OiBCdWlsZENvbGxlY3Rpb25Qcm9wcyk6IENvbGxlY3Rpb25Db25maWcge1xuICBjb25zdCBkZXZpY2VDb2RlU2x1ZyA9IGdldFNjaGVtYUNvbGxlY3Rpb25TbHVnKHJlc29sdmVkU2NoZW1hcywgYmFNb2RlbEtleS5kZXZpY2VDb2RlKVxuICBjb25zdCBkZXZpY2VDb2RlU2NoZW1hID0gcmVzb2x2ZWRTY2hlbWFzW2JhTW9kZWxLZXkuZGV2aWNlQ29kZV1cblxuICBjb25zdCBleGlzdGluZ0RldmljZUNvZGVDb2xsZWN0aW9uID0gaW5jb21pbmdDb2xsZWN0aW9ucy5maW5kKChjb2xsZWN0aW9uKSA9PiBjb2xsZWN0aW9uLnNsdWcgPT09IGRldmljZUNvZGVTbHVnKSBhc1xuICAgIHwgQ29sbGVjdGlvbkNvbmZpZ1xuICAgIHwgdW5kZWZpbmVkXG5cbiAgY29uc3QgZmllbGRPdmVycmlkZXM6IEZpZWxkT3ZlcnJpZGVzPGtleW9mIERldmljZUNvZGU+ID0ge1xuICAgIHVzZXJJZDogKCkgPT4gKHtcbiAgICAgIGluZGV4OiB0cnVlLFxuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnVGhlIHVzZXIgdGhhdCBpcyBhIG1lbWJlciBvZiB0aGUgdGVhbS4nIH1cbiAgICB9KVxuICB9XG5cbiAgY29uc3QgY29sbGVjdGlvbkZpZWxkcyA9IGdldENvbGxlY3Rpb25GaWVsZHMoe1xuICAgIHNjaGVtYTogZGV2aWNlQ29kZVNjaGVtYSxcbiAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmllbGRPdmVycmlkZXNcbiAgfSlcblxuICBsZXQgZGV2aWNlQ29kZUNvbGxlY3Rpb246IENvbGxlY3Rpb25Db25maWcgPSB7XG4gICAgLi4uZXhpc3RpbmdEZXZpY2VDb2RlQ29sbGVjdGlvbixcbiAgICBzbHVnOiBkZXZpY2VDb2RlU2x1ZyxcbiAgICBhZG1pbjoge1xuICAgICAgaGlkZGVuOiBwbHVnaW5PcHRpb25zLmhpZGVQbHVnaW5Db2xsZWN0aW9ucyA/PyBmYWxzZSxcbiAgICAgIHVzZUFzVGl0bGU6IGdldFNjaGVtYUZpZWxkTmFtZShyZXNvbHZlZFNjaGVtYXMsIGJhTW9kZWxLZXkuZGV2aWNlQ29kZSwgJ2RldmljZUNvZGUnKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnRGV2aWNlIGNvZGVzIG9mIGFuIG9yZ2FuaXphdGlvbiB0ZWFtLicsXG4gICAgICBncm91cDogcGx1Z2luT3B0aW9ucz8uY29sbGVjdGlvbkFkbWluR3JvdXAgPz8gJ0F1dGgnLFxuICAgICAgLi4uZXhpc3RpbmdEZXZpY2VDb2RlQ29sbGVjdGlvbj8uYWRtaW5cbiAgICB9LFxuICAgIGFjY2Vzczoge1xuICAgICAgLi4uZ2V0QWRtaW5BY2Nlc3MocGx1Z2luT3B0aW9ucyksXG4gICAgICAuLi4oZXhpc3RpbmdEZXZpY2VDb2RlQ29sbGVjdGlvbj8uYWNjZXNzID8/IHt9KVxuICAgIH0sXG4gICAgY3VzdG9tOiB7XG4gICAgICAuLi4oZXhpc3RpbmdEZXZpY2VDb2RlQ29sbGVjdGlvbj8uY3VzdG9tID8/IHt9KSxcbiAgICAgIGJldHRlckF1dGhNb2RlbEtleTogYmFNb2RlbEtleS5kZXZpY2VDb2RlXG4gICAgfSxcbiAgICBmaWVsZHM6IFsuLi4oZXhpc3RpbmdEZXZpY2VDb2RlQ29sbGVjdGlvbj8uZmllbGRzID8/IFtdKSwgLi4uKGNvbGxlY3Rpb25GaWVsZHMgPz8gW10pXVxuICB9XG5cbiAgYXNzZXJ0QWxsU2NoZW1hRmllbGRzKGRldmljZUNvZGVDb2xsZWN0aW9uLCBkZXZpY2VDb2RlU2NoZW1hKVxuXG4gIHJldHVybiBkZXZpY2VDb2RlQ29sbGVjdGlvblxufVxuIl0sIm5hbWVzIjpbImJhTW9kZWxLZXkiLCJnZXRBZG1pbkFjY2VzcyIsImdldENvbGxlY3Rpb25GaWVsZHMiLCJnZXRTY2hlbWFDb2xsZWN0aW9uU2x1ZyIsImdldFNjaGVtYUZpZWxkTmFtZSIsImFzc2VydEFsbFNjaGVtYUZpZWxkcyIsImJ1aWxkRGV2aWNlQ29kZUNvbGxlY3Rpb24iLCJpbmNvbWluZ0NvbGxlY3Rpb25zIiwicGx1Z2luT3B0aW9ucyIsInJlc29sdmVkU2NoZW1hcyIsImRldmljZUNvZGVTbHVnIiwiZGV2aWNlQ29kZSIsImRldmljZUNvZGVTY2hlbWEiLCJleGlzdGluZ0RldmljZUNvZGVDb2xsZWN0aW9uIiwiZmluZCIsImNvbGxlY3Rpb24iLCJzbHVnIiwiZmllbGRPdmVycmlkZXMiLCJ1c2VySWQiLCJpbmRleCIsImFkbWluIiwicmVhZE9ubHkiLCJkZXNjcmlwdGlvbiIsImNvbGxlY3Rpb25GaWVsZHMiLCJzY2hlbWEiLCJhZGRpdGlvbmFsUHJvcGVydGllcyIsImRldmljZUNvZGVDb2xsZWN0aW9uIiwiaGlkZGVuIiwiaGlkZVBsdWdpbkNvbGxlY3Rpb25zIiwidXNlQXNUaXRsZSIsImdyb3VwIiwiY29sbGVjdGlvbkFkbWluR3JvdXAiLCJhY2Nlc3MiLCJjdXN0b20iLCJiZXR0ZXJBdXRoTW9kZWxLZXkiLCJmaWVsZHMiXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLFVBQVUsUUFBUSxrQkFBaUI7QUFDNUMsU0FBU0MsY0FBYyxRQUFRLGlDQUFnQztBQUMvRCxTQUFTQyxtQkFBbUIsUUFBUSw2Q0FBNEM7QUFDaEYsU0FBU0MsdUJBQXVCLEVBQUVDLGtCQUFrQixFQUFFQyxxQkFBcUIsUUFBUSw0QkFBMkI7QUFNOUcsT0FBTyxTQUFTQywwQkFBMEIsRUFBRUMsbUJBQW1CLEVBQUVDLGFBQWEsRUFBRUMsZUFBZSxFQUF3QjtJQUNySCxNQUFNQyxpQkFBaUJQLHdCQUF3Qk0saUJBQWlCVCxXQUFXVyxVQUFVO0lBQ3JGLE1BQU1DLG1CQUFtQkgsZUFBZSxDQUFDVCxXQUFXVyxVQUFVLENBQUM7SUFFL0QsTUFBTUUsK0JBQStCTixvQkFBb0JPLElBQUksQ0FBQyxDQUFDQyxhQUFlQSxXQUFXQyxJQUFJLEtBQUtOO0lBSWxHLE1BQU1PLGlCQUFtRDtRQUN2REMsUUFBUSxJQUFPLENBQUE7Z0JBQ2JDLE9BQU87Z0JBQ1BDLE9BQU87b0JBQUVDLFVBQVU7b0JBQU1DLGFBQWE7Z0JBQXlDO1lBQ2pGLENBQUE7SUFDRjtJQUVBLE1BQU1DLG1CQUFtQnJCLG9CQUFvQjtRQUMzQ3NCLFFBQVFaO1FBQ1JhLHNCQUFzQlI7SUFDeEI7SUFFQSxJQUFJUyx1QkFBeUM7UUFDM0MsR0FBR2IsNEJBQTRCO1FBQy9CRyxNQUFNTjtRQUNOVSxPQUFPO1lBQ0xPLFFBQVFuQixjQUFjb0IscUJBQXFCLElBQUk7WUFDL0NDLFlBQVl6QixtQkFBbUJLLGlCQUFpQlQsV0FBV1csVUFBVSxFQUFFO1lBQ3ZFVyxhQUFhO1lBQ2JRLE9BQU90QixlQUFldUIsd0JBQXdCO1lBQzlDLEdBQUdsQiw4QkFBOEJPLEtBQUs7UUFDeEM7UUFDQVksUUFBUTtZQUNOLEdBQUcvQixlQUFlTyxjQUFjO1lBQ2hDLEdBQUlLLDhCQUE4Qm1CLFVBQVUsQ0FBQyxDQUFDO1FBQ2hEO1FBQ0FDLFFBQVE7WUFDTixHQUFJcEIsOEJBQThCb0IsVUFBVSxDQUFDLENBQUM7WUFDOUNDLG9CQUFvQmxDLFdBQVdXLFVBQVU7UUFDM0M7UUFDQXdCLFFBQVE7ZUFBS3RCLDhCQUE4QnNCLFVBQVUsRUFBRTtlQUFPWixvQkFBb0IsRUFBRTtTQUFFO0lBQ3hGO0lBRUFsQixzQkFBc0JxQixzQkFBc0JkO0lBRTVDLE9BQU9jO0FBQ1QifQ==