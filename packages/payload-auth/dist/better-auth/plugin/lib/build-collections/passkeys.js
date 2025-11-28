import { baModelFieldKeysToFieldNames, baModelKey, defaults } from "../../constants";
import { getAdminAccess } from "../../helpers/get-admin-access";
import { getSchemaCollectionSlug, getSchemaFieldName } from "./utils/collection-schema";
import { assertAllSchemaFields } from "./utils/collection-schema";
import { isAdminOrCurrentUserWithRoles } from "./utils/payload-access";
import { getCollectionFields } from "./utils/transform-schema-fields-to-payload";
export function buildPasskeysCollection({ incomingCollections, pluginOptions, resolvedSchemas }) {
    const passkeySlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.passkey);
    const passkeySchema = resolvedSchemas[baModelKey.passkey];
    const userIdFieldName = passkeySchema?.fields?.userId?.fieldName ?? baModelFieldKeysToFieldNames.passkey.userId;
    const adminRoles = pluginOptions.users?.adminRoles ?? [
        defaults.adminRole
    ];
    const existingPasskeyCollection = incomingCollections.find((collection)=>collection.slug === passkeySlug);
    const fieldOverrides = {
        name: ()=>({
                admin: {
                    readOnly: true,
                    description: 'The name of the passkey'
                }
            }),
        publicKey: ()=>({
                index: true,
                admin: {
                    readOnly: true,
                    description: 'The public key of the passkey'
                }
            }),
        userId: ()=>({
                index: true,
                admin: {
                    readOnly: true,
                    description: 'The user that the passkey belongs to'
                }
            }),
        credentialID: ()=>({
                name: 'credentialId',
                admin: {
                    readOnly: true,
                    description: 'The unique identifier of the registered credential'
                }
            }),
        counter: ()=>({
                required: true,
                admin: {
                    readOnly: true,
                    description: 'The counter of the passkey'
                }
            }),
        deviceType: ()=>({
                required: true,
                admin: {
                    readOnly: true,
                    description: 'The type of device used to register the passkey'
                }
            }),
        backedUp: ()=>({
                required: true,
                admin: {
                    readOnly: true,
                    description: 'Whether the passkey is backed up'
                }
            }),
        transports: ()=>({
                required: true,
                admin: {
                    readOnly: true,
                    description: 'The transports used to register the passkey'
                }
            })
    };
    const collectionFields = getCollectionFields({
        schema: passkeySchema,
        additionalProperties: fieldOverrides
    });
    let passkeyCollection = {
        ...existingPasskeyCollection,
        slug: passkeySlug,
        admin: {
            hidden: pluginOptions.hidePluginCollections ?? false,
            useAsTitle: getSchemaFieldName(resolvedSchemas, baModelKey.passkey, 'name'),
            description: 'Passkeys are used to authenticate users',
            group: pluginOptions?.collectionAdminGroup ?? 'Auth',
            ...existingPasskeyCollection?.admin
        },
        access: {
            ...getAdminAccess(pluginOptions),
            read: isAdminOrCurrentUserWithRoles({
                idField: userIdFieldName,
                adminRoles
            }),
            delete: isAdminOrCurrentUserWithRoles({
                idField: userIdFieldName,
                adminRoles
            }),
            ...existingPasskeyCollection?.access ?? {}
        },
        custom: {
            ...existingPasskeyCollection?.custom ?? {},
            betterAuthModelKey: baModelKey.passkey
        },
        fields: [
            ...existingPasskeyCollection?.fields ?? [],
            ...collectionFields ?? []
        ]
    };
    if (typeof pluginOptions.pluginCollectionOverrides?.passkeys === 'function') {
        passkeyCollection = pluginOptions.pluginCollectionOverrides.passkeys({
            collection: passkeyCollection
        });
    }
    assertAllSchemaFields(passkeyCollection, passkeySchema);
    return passkeyCollection;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3Bhc3NrZXlzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGJhTW9kZWxGaWVsZEtleXNUb0ZpZWxkTmFtZXMsIGJhTW9kZWxLZXksIGRlZmF1bHRzIH0gZnJvbSAnLi4vLi4vY29uc3RhbnRzJ1xuaW1wb3J0IHsgZ2V0QWRtaW5BY2Nlc3MgfSBmcm9tICcuLi8uLi9oZWxwZXJzL2dldC1hZG1pbi1hY2Nlc3MnXG5pbXBvcnQgeyBnZXRTY2hlbWFDb2xsZWN0aW9uU2x1ZywgZ2V0U2NoZW1hRmllbGROYW1lIH0gZnJvbSAnLi91dGlscy9jb2xsZWN0aW9uLXNjaGVtYSdcbmltcG9ydCB7IGFzc2VydEFsbFNjaGVtYUZpZWxkcyB9IGZyb20gJy4vdXRpbHMvY29sbGVjdGlvbi1zY2hlbWEnXG5pbXBvcnQgeyBpc0FkbWluT3JDdXJyZW50VXNlcldpdGhSb2xlcyB9IGZyb20gJy4vdXRpbHMvcGF5bG9hZC1hY2Nlc3MnXG5pbXBvcnQgeyBnZXRDb2xsZWN0aW9uRmllbGRzIH0gZnJvbSAnLi91dGlscy90cmFuc2Zvcm0tc2NoZW1hLWZpZWxkcy10by1wYXlsb2FkJ1xuaW1wb3J0IHR5cGUgeyBQYXNza2V5IH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9nZW5lcmF0ZWQtdHlwZXMnXG5pbXBvcnQgdHlwZSB7IEJ1aWxkQ29sbGVjdGlvblByb3BzLCBGaWVsZE92ZXJyaWRlcyB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL3R5cGVzJ1xuaW1wb3J0IHR5cGUgeyBDb2xsZWN0aW9uQ29uZmlnIH0gZnJvbSAncGF5bG9hZCdcblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUGFzc2tleXNDb2xsZWN0aW9uKHsgaW5jb21pbmdDb2xsZWN0aW9ucywgcGx1Z2luT3B0aW9ucywgcmVzb2x2ZWRTY2hlbWFzIH06IEJ1aWxkQ29sbGVjdGlvblByb3BzKTogQ29sbGVjdGlvbkNvbmZpZyB7XG4gIGNvbnN0IHBhc3NrZXlTbHVnID0gZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWcocmVzb2x2ZWRTY2hlbWFzLCBiYU1vZGVsS2V5LnBhc3NrZXkpXG4gIGNvbnN0IHBhc3NrZXlTY2hlbWEgPSByZXNvbHZlZFNjaGVtYXNbYmFNb2RlbEtleS5wYXNza2V5XVxuICBjb25zdCB1c2VySWRGaWVsZE5hbWUgPSBwYXNza2V5U2NoZW1hPy5maWVsZHM/LnVzZXJJZD8uZmllbGROYW1lID8/IGJhTW9kZWxGaWVsZEtleXNUb0ZpZWxkTmFtZXMucGFzc2tleS51c2VySWRcbiAgY29uc3QgYWRtaW5Sb2xlcyA9IHBsdWdpbk9wdGlvbnMudXNlcnM/LmFkbWluUm9sZXMgPz8gW2RlZmF1bHRzLmFkbWluUm9sZV1cblxuICBjb25zdCBleGlzdGluZ1Bhc3NrZXlDb2xsZWN0aW9uID0gaW5jb21pbmdDb2xsZWN0aW9ucy5maW5kKChjb2xsZWN0aW9uKSA9PiBjb2xsZWN0aW9uLnNsdWcgPT09IHBhc3NrZXlTbHVnKSBhc1xuICAgIHwgQ29sbGVjdGlvbkNvbmZpZ1xuICAgIHwgdW5kZWZpbmVkXG5cbiAgY29uc3QgZmllbGRPdmVycmlkZXM6IEZpZWxkT3ZlcnJpZGVzPGtleW9mIFBhc3NrZXk+ID0ge1xuICAgIG5hbWU6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdUaGUgbmFtZSBvZiB0aGUgcGFzc2tleScgfVxuICAgIH0pLFxuICAgIHB1YmxpY0tleTogKCkgPT4gKHtcbiAgICAgIGluZGV4OiB0cnVlLFxuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnVGhlIHB1YmxpYyBrZXkgb2YgdGhlIHBhc3NrZXknIH1cbiAgICB9KSxcbiAgICB1c2VySWQ6ICgpID0+ICh7XG4gICAgICBpbmRleDogdHJ1ZSxcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSB1c2VyIHRoYXQgdGhlIHBhc3NrZXkgYmVsb25ncyB0bycgfVxuICAgIH0pLFxuICAgIGNyZWRlbnRpYWxJRDogKCkgPT4gKHtcbiAgICAgIG5hbWU6ICdjcmVkZW50aWFsSWQnLFxuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnVGhlIHVuaXF1ZSBpZGVudGlmaWVyIG9mIHRoZSByZWdpc3RlcmVkIGNyZWRlbnRpYWwnIH1cbiAgICB9KSxcbiAgICBjb3VudGVyOiAoKSA9PiAoe1xuICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdUaGUgY291bnRlciBvZiB0aGUgcGFzc2tleScgfVxuICAgIH0pLFxuICAgIGRldmljZVR5cGU6ICgpID0+ICh7XG4gICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSB0eXBlIG9mIGRldmljZSB1c2VkIHRvIHJlZ2lzdGVyIHRoZSBwYXNza2V5JyB9XG4gICAgfSksXG4gICAgYmFja2VkVXA6ICgpID0+ICh7XG4gICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1doZXRoZXIgdGhlIHBhc3NrZXkgaXMgYmFja2VkIHVwJyB9XG4gICAgfSksXG4gICAgdHJhbnNwb3J0czogKCkgPT4gKHtcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnVGhlIHRyYW5zcG9ydHMgdXNlZCB0byByZWdpc3RlciB0aGUgcGFzc2tleScgfVxuICAgIH0pXG4gIH1cblxuICBjb25zdCBjb2xsZWN0aW9uRmllbGRzID0gZ2V0Q29sbGVjdGlvbkZpZWxkcyh7XG4gICAgc2NoZW1hOiBwYXNza2V5U2NoZW1hLFxuICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmaWVsZE92ZXJyaWRlc1xuICB9KVxuXG4gIGxldCBwYXNza2V5Q29sbGVjdGlvbjogQ29sbGVjdGlvbkNvbmZpZyA9IHtcbiAgICAuLi5leGlzdGluZ1Bhc3NrZXlDb2xsZWN0aW9uLFxuICAgIHNsdWc6IHBhc3NrZXlTbHVnLFxuICAgIGFkbWluOiB7XG4gICAgICBoaWRkZW46IHBsdWdpbk9wdGlvbnMuaGlkZVBsdWdpbkNvbGxlY3Rpb25zID8/IGZhbHNlLFxuICAgICAgdXNlQXNUaXRsZTogZ2V0U2NoZW1hRmllbGROYW1lKHJlc29sdmVkU2NoZW1hcywgYmFNb2RlbEtleS5wYXNza2V5LCAnbmFtZScpLFxuICAgICAgZGVzY3JpcHRpb246ICdQYXNza2V5cyBhcmUgdXNlZCB0byBhdXRoZW50aWNhdGUgdXNlcnMnLFxuICAgICAgZ3JvdXA6IHBsdWdpbk9wdGlvbnM/LmNvbGxlY3Rpb25BZG1pbkdyb3VwID8/ICdBdXRoJyxcbiAgICAgIC4uLmV4aXN0aW5nUGFzc2tleUNvbGxlY3Rpb24/LmFkbWluXG4gICAgfSxcbiAgICBhY2Nlc3M6IHtcbiAgICAgIC4uLmdldEFkbWluQWNjZXNzKHBsdWdpbk9wdGlvbnMpLFxuICAgICAgcmVhZDogaXNBZG1pbk9yQ3VycmVudFVzZXJXaXRoUm9sZXMoe1xuICAgICAgICBpZEZpZWxkOiB1c2VySWRGaWVsZE5hbWUsXG4gICAgICAgIGFkbWluUm9sZXNcbiAgICAgIH0pLFxuICAgICAgZGVsZXRlOiBpc0FkbWluT3JDdXJyZW50VXNlcldpdGhSb2xlcyh7XG4gICAgICAgIGlkRmllbGQ6IHVzZXJJZEZpZWxkTmFtZSxcbiAgICAgICAgYWRtaW5Sb2xlc1xuICAgICAgfSksXG4gICAgICAuLi4oZXhpc3RpbmdQYXNza2V5Q29sbGVjdGlvbj8uYWNjZXNzID8/IHt9KVxuICAgIH0sXG4gICAgY3VzdG9tOiB7XG4gICAgICAuLi4oZXhpc3RpbmdQYXNza2V5Q29sbGVjdGlvbj8uY3VzdG9tID8/IHt9KSxcbiAgICAgIGJldHRlckF1dGhNb2RlbEtleTogYmFNb2RlbEtleS5wYXNza2V5XG4gICAgfSxcbiAgICBmaWVsZHM6IFsuLi4oZXhpc3RpbmdQYXNza2V5Q29sbGVjdGlvbj8uZmllbGRzID8/IFtdKSwgLi4uKGNvbGxlY3Rpb25GaWVsZHMgPz8gW10pXVxuICB9XG5cbiAgaWYgKHR5cGVvZiBwbHVnaW5PcHRpb25zLnBsdWdpbkNvbGxlY3Rpb25PdmVycmlkZXM/LnBhc3NrZXlzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcGFzc2tleUNvbGxlY3Rpb24gPSBwbHVnaW5PcHRpb25zLnBsdWdpbkNvbGxlY3Rpb25PdmVycmlkZXMucGFzc2tleXMoe1xuICAgICAgY29sbGVjdGlvbjogcGFzc2tleUNvbGxlY3Rpb25cbiAgICB9KVxuICB9XG5cbiAgYXNzZXJ0QWxsU2NoZW1hRmllbGRzKHBhc3NrZXlDb2xsZWN0aW9uLCBwYXNza2V5U2NoZW1hKVxuXG4gIHJldHVybiBwYXNza2V5Q29sbGVjdGlvblxufVxuIl0sIm5hbWVzIjpbImJhTW9kZWxGaWVsZEtleXNUb0ZpZWxkTmFtZXMiLCJiYU1vZGVsS2V5IiwiZGVmYXVsdHMiLCJnZXRBZG1pbkFjY2VzcyIsImdldFNjaGVtYUNvbGxlY3Rpb25TbHVnIiwiZ2V0U2NoZW1hRmllbGROYW1lIiwiYXNzZXJ0QWxsU2NoZW1hRmllbGRzIiwiaXNBZG1pbk9yQ3VycmVudFVzZXJXaXRoUm9sZXMiLCJnZXRDb2xsZWN0aW9uRmllbGRzIiwiYnVpbGRQYXNza2V5c0NvbGxlY3Rpb24iLCJpbmNvbWluZ0NvbGxlY3Rpb25zIiwicGx1Z2luT3B0aW9ucyIsInJlc29sdmVkU2NoZW1hcyIsInBhc3NrZXlTbHVnIiwicGFzc2tleSIsInBhc3NrZXlTY2hlbWEiLCJ1c2VySWRGaWVsZE5hbWUiLCJmaWVsZHMiLCJ1c2VySWQiLCJmaWVsZE5hbWUiLCJhZG1pblJvbGVzIiwidXNlcnMiLCJhZG1pblJvbGUiLCJleGlzdGluZ1Bhc3NrZXlDb2xsZWN0aW9uIiwiZmluZCIsImNvbGxlY3Rpb24iLCJzbHVnIiwiZmllbGRPdmVycmlkZXMiLCJuYW1lIiwiYWRtaW4iLCJyZWFkT25seSIsImRlc2NyaXB0aW9uIiwicHVibGljS2V5IiwiaW5kZXgiLCJjcmVkZW50aWFsSUQiLCJjb3VudGVyIiwicmVxdWlyZWQiLCJkZXZpY2VUeXBlIiwiYmFja2VkVXAiLCJ0cmFuc3BvcnRzIiwiY29sbGVjdGlvbkZpZWxkcyIsInNjaGVtYSIsImFkZGl0aW9uYWxQcm9wZXJ0aWVzIiwicGFzc2tleUNvbGxlY3Rpb24iLCJoaWRkZW4iLCJoaWRlUGx1Z2luQ29sbGVjdGlvbnMiLCJ1c2VBc1RpdGxlIiwiZ3JvdXAiLCJjb2xsZWN0aW9uQWRtaW5Hcm91cCIsImFjY2VzcyIsInJlYWQiLCJpZEZpZWxkIiwiZGVsZXRlIiwiY3VzdG9tIiwiYmV0dGVyQXV0aE1vZGVsS2V5IiwicGx1Z2luQ29sbGVjdGlvbk92ZXJyaWRlcyIsInBhc3NrZXlzIl0sIm1hcHBpbmdzIjoiQUFBQSxTQUFTQSw0QkFBNEIsRUFBRUMsVUFBVSxFQUFFQyxRQUFRLFFBQVEsa0JBQWlCO0FBQ3BGLFNBQVNDLGNBQWMsUUFBUSxpQ0FBZ0M7QUFDL0QsU0FBU0MsdUJBQXVCLEVBQUVDLGtCQUFrQixRQUFRLDRCQUEyQjtBQUN2RixTQUFTQyxxQkFBcUIsUUFBUSw0QkFBMkI7QUFDakUsU0FBU0MsNkJBQTZCLFFBQVEseUJBQXdCO0FBQ3RFLFNBQVNDLG1CQUFtQixRQUFRLDZDQUE0QztBQUtoRixPQUFPLFNBQVNDLHdCQUF3QixFQUFFQyxtQkFBbUIsRUFBRUMsYUFBYSxFQUFFQyxlQUFlLEVBQXdCO0lBQ25ILE1BQU1DLGNBQWNULHdCQUF3QlEsaUJBQWlCWCxXQUFXYSxPQUFPO0lBQy9FLE1BQU1DLGdCQUFnQkgsZUFBZSxDQUFDWCxXQUFXYSxPQUFPLENBQUM7SUFDekQsTUFBTUUsa0JBQWtCRCxlQUFlRSxRQUFRQyxRQUFRQyxhQUFhbkIsNkJBQTZCYyxPQUFPLENBQUNJLE1BQU07SUFDL0csTUFBTUUsYUFBYVQsY0FBY1UsS0FBSyxFQUFFRCxjQUFjO1FBQUNsQixTQUFT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