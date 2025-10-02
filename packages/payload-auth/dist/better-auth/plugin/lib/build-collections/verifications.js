import { baModelKey } from "../../constants";
import { getAdminAccess } from "../../helpers/get-admin-access";
import { assertAllSchemaFields, getSchemaCollectionSlug, getSchemaFieldName } from "./utils/collection-schema";
import { getCollectionFields } from "./utils/transform-schema-fields-to-payload";
export function buildVerificationsCollection({ incomingCollections, pluginOptions, resolvedSchemas }) {
    const verificationSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.verification);
    const verificationSchema = resolvedSchemas[baModelKey.verification];
    const existingVerificationCollection = incomingCollections.find((collection)=>collection.slug === verificationSlug);
    const fieldOverrides = {
        identifier: ()=>({
                index: true,
                admin: {
                    readOnly: true,
                    description: 'The identifier of the verification request'
                }
            }),
        value: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The value to be verified'
                }
            }),
        expiresAt: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The date and time when the verification request will expire'
                }
            })
    };
    const verificationFieldRules = [
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
        schema: verificationSchema,
        fieldRules: verificationFieldRules,
        additionalProperties: fieldOverrides
    });
    let verificationCollection = {
        ...existingVerificationCollection,
        slug: verificationSlug,
        admin: {
            useAsTitle: getSchemaFieldName(resolvedSchemas, baModelKey.verification, 'identifier'),
            description: 'Verifications are used to verify authentication requests',
            group: pluginOptions?.collectionAdminGroup ?? 'Auth',
            ...existingVerificationCollection?.admin,
            hidden: pluginOptions.verifications?.hidden
        },
        access: {
            ...getAdminAccess(pluginOptions),
            ...existingVerificationCollection?.access ?? {}
        },
        custom: {
            ...existingVerificationCollection?.custom ?? {},
            betterAuthModelKey: baModelKey.verification
        },
        fields: [
            ...existingVerificationCollection?.fields ?? [],
            ...collectionFields ?? []
        ]
    };
    if (typeof pluginOptions.verifications?.collectionOverrides === 'function') {
        verificationCollection = pluginOptions.verifications.collectionOverrides({
            collection: verificationCollection
        });
    }
    assertAllSchemaFields(verificationCollection, verificationSchema);
    return verificationCollection;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3ZlcmlmaWNhdGlvbnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBWZXJpZmljYXRpb24gfSBmcm9tICdAL2JldHRlci1hdXRoL2dlbmVyYXRlZC10eXBlcydcbmltcG9ydCB0eXBlIHsgQ29sbGVjdGlvbkNvbmZpZyB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgdHlwZSB7IEJ1aWxkQ29sbGVjdGlvblByb3BzLCBGaWVsZE92ZXJyaWRlcyB9IGZyb20gJy4uLy4uL3R5cGVzJ1xuaW1wb3J0IHR5cGUgeyBGaWVsZFJ1bGUgfSBmcm9tICcuL3V0aWxzL21vZGVsLWZpZWxkLXRyYW5zZm9ybWF0aW9ucydcblxuaW1wb3J0IHsgYmFNb2RlbEtleSB9IGZyb20gJy4uLy4uL2NvbnN0YW50cydcbmltcG9ydCB7IGdldEFkbWluQWNjZXNzIH0gZnJvbSAnLi4vLi4vaGVscGVycy9nZXQtYWRtaW4tYWNjZXNzJ1xuaW1wb3J0IHsgYXNzZXJ0QWxsU2NoZW1hRmllbGRzLCBnZXRTY2hlbWFDb2xsZWN0aW9uU2x1ZywgZ2V0U2NoZW1hRmllbGROYW1lIH0gZnJvbSAnLi91dGlscy9jb2xsZWN0aW9uLXNjaGVtYSdcbmltcG9ydCB7IGdldENvbGxlY3Rpb25GaWVsZHMgfSBmcm9tICcuL3V0aWxzL3RyYW5zZm9ybS1zY2hlbWEtZmllbGRzLXRvLXBheWxvYWQnXG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFZlcmlmaWNhdGlvbnNDb2xsZWN0aW9uKHsgaW5jb21pbmdDb2xsZWN0aW9ucywgcGx1Z2luT3B0aW9ucywgcmVzb2x2ZWRTY2hlbWFzIH06IEJ1aWxkQ29sbGVjdGlvblByb3BzKTogQ29sbGVjdGlvbkNvbmZpZyB7XG4gIGNvbnN0IHZlcmlmaWNhdGlvblNsdWcgPSBnZXRTY2hlbWFDb2xsZWN0aW9uU2x1ZyhyZXNvbHZlZFNjaGVtYXMsIGJhTW9kZWxLZXkudmVyaWZpY2F0aW9uKVxuICBjb25zdCB2ZXJpZmljYXRpb25TY2hlbWEgPSByZXNvbHZlZFNjaGVtYXNbYmFNb2RlbEtleS52ZXJpZmljYXRpb25dXG5cbiAgY29uc3QgZXhpc3RpbmdWZXJpZmljYXRpb25Db2xsZWN0aW9uID0gaW5jb21pbmdDb2xsZWN0aW9ucy5maW5kKChjb2xsZWN0aW9uKSA9PiBjb2xsZWN0aW9uLnNsdWcgPT09IHZlcmlmaWNhdGlvblNsdWcpIGFzXG4gICAgfCBDb2xsZWN0aW9uQ29uZmlnXG4gICAgfCB1bmRlZmluZWRcblxuICBjb25zdCBmaWVsZE92ZXJyaWRlczogRmllbGRPdmVycmlkZXM8a2V5b2YgVmVyaWZpY2F0aW9uPiA9IHtcbiAgICBpZGVudGlmaWVyOiAoKSA9PiAoe1xuICAgICAgaW5kZXg6IHRydWUsXG4gICAgICBhZG1pbjoge1xuICAgICAgICByZWFkT25seTogdHJ1ZSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgaWRlbnRpZmllciBvZiB0aGUgdmVyaWZpY2F0aW9uIHJlcXVlc3QnXG4gICAgICB9XG4gICAgfSksXG4gICAgdmFsdWU6ICgpID0+ICh7XG4gICAgICBhZG1pbjoge1xuICAgICAgICByZWFkT25seTogdHJ1ZSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgdmFsdWUgdG8gYmUgdmVyaWZpZWQnXG4gICAgICB9XG4gICAgfSksXG4gICAgZXhwaXJlc0F0OiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHtcbiAgICAgICAgcmVhZE9ubHk6IHRydWUsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGRhdGUgYW5kIHRpbWUgd2hlbiB0aGUgdmVyaWZpY2F0aW9uIHJlcXVlc3Qgd2lsbCBleHBpcmUnXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IHZlcmlmaWNhdGlvbkZpZWxkUnVsZXM6IEZpZWxkUnVsZVtdID0gW1xuICAgIHtcbiAgICAgIGNvbmRpdGlvbjogKGZpZWxkKSA9PiBmaWVsZC50eXBlID09PSAnZGF0ZScsXG4gICAgICB0cmFuc2Zvcm06IChmaWVsZCkgPT4gKHtcbiAgICAgICAgLi4uZmllbGQsXG4gICAgICAgIHNhdmVUb0pXVDogZmFsc2UsXG4gICAgICAgIGFkbWluOiB7XG4gICAgICAgICAgZGlzYWJsZUJ1bGtFZGl0OiB0cnVlLFxuICAgICAgICAgIGhpZGRlbjogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBpbmRleDogdHJ1ZSxcbiAgICAgICAgbGFiZWw6ICh7IHQgfTogYW55KSA9PiB0KCdnZW5lcmFsOnVwZGF0ZWRBdCcpXG4gICAgICB9KVxuICAgIH1cbiAgXVxuXG4gIGNvbnN0IGNvbGxlY3Rpb25GaWVsZHMgPSBnZXRDb2xsZWN0aW9uRmllbGRzKHtcbiAgICBzY2hlbWE6IHZlcmlmaWNhdGlvblNjaGVtYSxcbiAgICBmaWVsZFJ1bGVzOiB2ZXJpZmljYXRpb25GaWVsZFJ1bGVzLFxuICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmaWVsZE92ZXJyaWRlc1xuICB9KVxuXG4gIGxldCB2ZXJpZmljYXRpb25Db2xsZWN0aW9uOiBDb2xsZWN0aW9uQ29uZmlnID0ge1xuICAgIC4uLmV4aXN0aW5nVmVyaWZpY2F0aW9uQ29sbGVjdGlvbixcbiAgICBzbHVnOiB2ZXJpZmljYXRpb25TbHVnLFxuICAgIGFkbWluOiB7XG4gICAgICB1c2VBc1RpdGxlOiBnZXRTY2hlbWFGaWVsZE5hbWUocmVzb2x2ZWRTY2hlbWFzLCBiYU1vZGVsS2V5LnZlcmlmaWNhdGlvbiwgJ2lkZW50aWZpZXInKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnVmVyaWZpY2F0aW9ucyBhcmUgdXNlZCB0byB2ZXJpZnkgYXV0aGVudGljYXRpb24gcmVxdWVzdHMnLFxuICAgICAgZ3JvdXA6IHBsdWdpbk9wdGlvbnM/LmNvbGxlY3Rpb25BZG1pbkdyb3VwID8/ICdBdXRoJyxcbiAgICAgIC4uLmV4aXN0aW5nVmVyaWZpY2F0aW9uQ29sbGVjdGlvbj8uYWRtaW4sXG4gICAgICBoaWRkZW46IHBsdWdpbk9wdGlvbnMudmVyaWZpY2F0aW9ucz8uaGlkZGVuXG4gICAgfSxcbiAgICBhY2Nlc3M6IHtcbiAgICAgIC4uLmdldEFkbWluQWNjZXNzKHBsdWdpbk9wdGlvbnMpLFxuICAgICAgLi4uKGV4aXN0aW5nVmVyaWZpY2F0aW9uQ29sbGVjdGlvbj8uYWNjZXNzID8/IHt9KVxuICAgIH0sXG4gICAgY3VzdG9tOiB7XG4gICAgICAuLi4oZXhpc3RpbmdWZXJpZmljYXRpb25Db2xsZWN0aW9uPy5jdXN0b20gPz8ge30pLFxuICAgICAgYmV0dGVyQXV0aE1vZGVsS2V5OiBiYU1vZGVsS2V5LnZlcmlmaWNhdGlvblxuICAgIH0sXG4gICAgZmllbGRzOiBbLi4uKGV4aXN0aW5nVmVyaWZpY2F0aW9uQ29sbGVjdGlvbj8uZmllbGRzID8/IFtdKSwgLi4uKGNvbGxlY3Rpb25GaWVsZHMgPz8gW10pXVxuICB9XG5cbiAgaWYgKHR5cGVvZiBwbHVnaW5PcHRpb25zLnZlcmlmaWNhdGlvbnM/LmNvbGxlY3Rpb25PdmVycmlkZXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICB2ZXJpZmljYXRpb25Db2xsZWN0aW9uID0gcGx1Z2luT3B0aW9ucy52ZXJpZmljYXRpb25zLmNvbGxlY3Rpb25PdmVycmlkZXMoe1xuICAgICAgY29sbGVjdGlvbjogdmVyaWZpY2F0aW9uQ29sbGVjdGlvblxuICAgIH0pXG4gIH1cblxuICBhc3NlcnRBbGxTY2hlbWFGaWVsZHModmVyaWZpY2F0aW9uQ29sbGVjdGlvbiwgdmVyaWZpY2F0aW9uU2NoZW1hKVxuXG4gIHJldHVybiB2ZXJpZmljYXRpb25Db2xsZWN0aW9uXG59XG4iXSwibmFtZXMiOlsiYmFNb2RlbEtleSIsImdldEFkbWluQWNjZXNzIiwiYXNzZXJ0QWxsU2NoZW1hRmllbGRzIiwiZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWciLCJnZXRTY2hlbWFGaWVsZE5hbWUiLCJnZXRDb2xsZWN0aW9uRmllbGRzIiwiYnVpbGRWZXJpZmljYXRpb25zQ29sbGVjdGlvbiIsImluY29taW5nQ29sbGVjdGlvbnMiLCJwbHVnaW5PcHRpb25zIiwicmVzb2x2ZWRTY2hlbWFzIiwidmVyaWZpY2F0aW9uU2x1ZyIsInZlcmlmaWNhdGlvbiIsInZlcmlmaWNhdGlvblNjaGVtYSIsImV4aXN0aW5nVmVyaWZpY2F0aW9uQ29sbGVjdGlvbiIsImZpbmQiLCJjb2xsZWN0aW9uIiwic2x1ZyIsImZpZWxkT3ZlcnJpZGVzIiwiaWRlbnRpZmllciIsImluZGV4IiwiYWRtaW4iLCJyZWFkT25seSIsImRlc2NyaXB0aW9uIiwidmFsdWUiLCJleHBpcmVzQXQiLCJ2ZXJpZmljYXRpb25GaWVsZFJ1bGVzIiwiY29uZGl0aW9uIiwiZmllbGQiLCJ0eXBlIiwidHJhbnNmb3JtIiwic2F2ZVRvSldUIiwiZGlzYWJsZUJ1bGtFZGl0IiwiaGlkZGVuIiwibGFiZWwiLCJ0IiwiY29sbGVjdGlvbkZpZWxkcyIsInNjaGVtYSIsImZpZWxkUnVsZXMiLCJhZGRpdGlvbmFsUHJvcGVydGllcyIsInZlcmlmaWNhdGlvbkNvbGxlY3Rpb24iLCJ1c2VBc1RpdGxlIiwiZ3JvdXAiLCJjb2xsZWN0aW9uQWRtaW5Hcm91cCIsInZlcmlmaWNhdGlvbnMiLCJhY2Nlc3MiLCJjdXN0b20iLCJiZXR0ZXJBdXRoTW9kZWxLZXkiLCJmaWVsZHMiLCJjb2xsZWN0aW9uT3ZlcnJpZGVzIl0sIm1hcHBpbmdzIjoiQUFLQSxTQUFTQSxVQUFVLFFBQVEsa0JBQWlCO0FBQzVDLFNBQVNDLGNBQWMsUUFBUSxpQ0FBZ0M7QUFDL0QsU0FBU0MscUJBQXFCLEVBQUVDLHVCQUF1QixFQUFFQyxrQkFBa0IsUUFBUSw0QkFBMkI7QUFDOUcsU0FBU0MsbUJBQW1CLFFBQVEsNkNBQTRDO0FBRWhGLE9BQU8sU0FBU0MsNkJBQTZCLEVBQUVDLG1CQUFtQixFQUFFQyxhQUFhLEVBQUVDLGVBQWUsRUFBd0I7SUFDeEgsTUFBTUMsbUJBQW1CUCx3QkFBd0JNLGlCQUFpQlQsV0FBV1csWUFBWTtJQUN6RixNQUFNQyxxQkFBcUJILGVBQWUsQ0FBQ1QsV0FBV1csWUFBWSxDQUFDO0lBRW5FLE1BQU1FLGlDQUFpQ04sb0JBQW9CTyxJQUFJLENBQUMsQ0FBQ0MsYUFBZUEsV0FBV0MsSUFBSSxLQUFLTjtJQUlwRyxNQUFNTyxpQkFBcUQ7UUFDekRDLFlBQVksSUFBTyxDQUFBO2dCQUNqQkMsT0FBTztnQkFDUEMsT0FBTztvQkFDTEMsVUFBVTtvQkFDVkMsYUFBYTtnQkFDZjtZQUNGLENBQUE7UUFDQUMsT0FBTyxJQUFPLENBQUE7Z0JBQ1pILE9BQU87b0JBQ0xDLFVBQVU7b0JBQ1ZDLGFBQWE7Z0JBQ2Y7WUFDRixDQUFBO1FBQ0FFLFdBQVcsSUFBTyxDQUFBO2dCQUNoQkosT0FBTztvQkFDTEMsVUFBVTtvQkFDVkMsYUFBYTtnQkFDZjtZQUNGLENBQUE7SUFDRjtJQUVBLE1BQU1HLHlCQUFzQztRQUMxQztZQUNFQyxXQUFXLENBQUNDLFFBQVVBLE1BQU1DLElBQUksS0FBSztZQUNyQ0MsV0FBVyxDQUFDRixRQUFXLENBQUE7b0JBQ3JCLEdBQUdBLEtBQUs7b0JBQ1JHLFdBQVc7b0JBQ1hWLE9BQU87d0JBQ0xXLGlCQUFpQjt3QkFDakJDLFFBQVE7b0JBQ1Y7b0JBQ0FiLE9BQU87b0JBQ1BjLE9BQU8sQ0FBQyxFQUFFQyxDQUFDLEVBQU8sR0FBS0EsRUFBRTtnQkFDM0IsQ0FBQTtRQUNGO0tBQ0Q7SUFFRCxNQUFNQyxtQkFBbUI5QixvQkFBb0I7UUFDM0MrQixRQUFReEI7UUFDUnlCLFlBQVlaO1FBQ1phLHNCQUFzQnJCO0lBQ3hCO0lBRUEsSUFBSXNCLHlCQUEyQztRQUM3QyxHQUFHMUIsOEJBQThCO1FBQ2pDRyxNQUFNTjtRQUNOVSxPQUFPO1lBQ0xvQixZQUFZcEMsbUJBQW1CSyxpQkFBaUJULFdBQVdXLFlBQVksRUFBRTtZQUN6RVcsYUFBYTtZQUNibUIsT0FBT2pDLGVBQWVrQyx3QkFBd0I7WUFDOUMsR0FBRzdCLGdDQUFnQ08sS0FBSztZQUN4Q1ksUUFBUXhCLGNBQWNtQyxhQUFhLEVBQUVYO1FBQ3ZDO1FBQ0FZLFFBQVE7WUFDTixHQUFHM0MsZUFBZU8sY0FBYztZQUNoQyxHQUFJSyxnQ0FBZ0MrQixVQUFVLENBQUMsQ0FBQztRQUNsRDtRQUNBQyxRQUFRO1lBQ04sR0FBSWhDLGdDQUFnQ2dDLFVBQVUsQ0FBQyxDQUFDO1lBQ2hEQyxvQkFBb0I5QyxXQUFXVyxZQUFZO1FBQzdDO1FBQ0FvQyxRQUFRO2VBQUtsQyxnQ0FBZ0NrQyxVQUFVLEVBQUU7ZUFBT1osb0JBQW9CLEVBQUU7U0FBRTtJQUMxRjtJQUVBLElBQUksT0FBTzNCLGNBQWNtQyxhQUFhLEVBQUVLLHdCQUF3QixZQUFZO1FBQzFFVCx5QkFBeUIvQixjQUFjbUMsYUFBYSxDQUFDSyxtQkFBbUIsQ0FBQztZQUN2RWpDLFlBQVl3QjtRQUNkO0lBQ0Y7SUFFQXJDLHNCQUFzQnFDLHdCQUF3QjNCO0lBRTlDLE9BQU8yQjtBQUNUIn0=