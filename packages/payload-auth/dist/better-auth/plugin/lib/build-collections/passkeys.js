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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3Bhc3NrZXlzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgUGFzc2tleSB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvZ2VuZXJhdGVkLXR5cGVzJ1xuaW1wb3J0IHR5cGUgeyBCdWlsZENvbGxlY3Rpb25Qcm9wcywgRmllbGRPdmVycmlkZXMgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi90eXBlcydcbmltcG9ydCB0eXBlIHsgQ29sbGVjdGlvbkNvbmZpZyB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgeyBiYU1vZGVsRmllbGRLZXlzVG9GaWVsZE5hbWVzLCBiYU1vZGVsS2V5LCBkZWZhdWx0cyB9IGZyb20gJy4uLy4uL2NvbnN0YW50cydcbmltcG9ydCB7IGdldEFkbWluQWNjZXNzIH0gZnJvbSAnLi4vLi4vaGVscGVycy9nZXQtYWRtaW4tYWNjZXNzJ1xuaW1wb3J0IHsgZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWcsIGdldFNjaGVtYUZpZWxkTmFtZSB9IGZyb20gJy4vdXRpbHMvY29sbGVjdGlvbi1zY2hlbWEnXG5pbXBvcnQgeyBhc3NlcnRBbGxTY2hlbWFGaWVsZHMgfSBmcm9tICcuL3V0aWxzL2NvbGxlY3Rpb24tc2NoZW1hJ1xuaW1wb3J0IHsgaXNBZG1pbk9yQ3VycmVudFVzZXJXaXRoUm9sZXMgfSBmcm9tICcuL3V0aWxzL3BheWxvYWQtYWNjZXNzJ1xuaW1wb3J0IHsgZ2V0Q29sbGVjdGlvbkZpZWxkcyB9IGZyb20gJy4vdXRpbHMvdHJhbnNmb3JtLXNjaGVtYS1maWVsZHMtdG8tcGF5bG9hZCdcblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUGFzc2tleXNDb2xsZWN0aW9uKHsgaW5jb21pbmdDb2xsZWN0aW9ucywgcGx1Z2luT3B0aW9ucywgcmVzb2x2ZWRTY2hlbWFzIH06IEJ1aWxkQ29sbGVjdGlvblByb3BzKTogQ29sbGVjdGlvbkNvbmZpZyB7XG4gIGNvbnN0IHBhc3NrZXlTbHVnID0gZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWcocmVzb2x2ZWRTY2hlbWFzLCBiYU1vZGVsS2V5LnBhc3NrZXkpXG4gIGNvbnN0IHBhc3NrZXlTY2hlbWEgPSByZXNvbHZlZFNjaGVtYXNbYmFNb2RlbEtleS5wYXNza2V5XVxuICBjb25zdCB1c2VySWRGaWVsZE5hbWUgPSBwYXNza2V5U2NoZW1hPy5maWVsZHM/LnVzZXJJZD8uZmllbGROYW1lID8/IGJhTW9kZWxGaWVsZEtleXNUb0ZpZWxkTmFtZXMucGFzc2tleS51c2VySWRcbiAgY29uc3QgYWRtaW5Sb2xlcyA9IHBsdWdpbk9wdGlvbnMudXNlcnM/LmFkbWluUm9sZXMgPz8gW2RlZmF1bHRzLmFkbWluUm9sZV1cblxuICBjb25zdCBleGlzdGluZ1Bhc3NrZXlDb2xsZWN0aW9uID0gaW5jb21pbmdDb2xsZWN0aW9ucy5maW5kKChjb2xsZWN0aW9uKSA9PiBjb2xsZWN0aW9uLnNsdWcgPT09IHBhc3NrZXlTbHVnKSBhc1xuICAgIHwgQ29sbGVjdGlvbkNvbmZpZ1xuICAgIHwgdW5kZWZpbmVkXG5cbiAgY29uc3QgZmllbGRPdmVycmlkZXM6IEZpZWxkT3ZlcnJpZGVzPGtleW9mIFBhc3NrZXk+ID0ge1xuICAgIG5hbWU6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdUaGUgbmFtZSBvZiB0aGUgcGFzc2tleScgfVxuICAgIH0pLFxuICAgIHB1YmxpY0tleTogKCkgPT4gKHtcbiAgICAgIGluZGV4OiB0cnVlLFxuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnVGhlIHB1YmxpYyBrZXkgb2YgdGhlIHBhc3NrZXknIH1cbiAgICB9KSxcbiAgICB1c2VySWQ6ICgpID0+ICh7XG4gICAgICBpbmRleDogdHJ1ZSxcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSB1c2VyIHRoYXQgdGhlIHBhc3NrZXkgYmVsb25ncyB0bycgfVxuICAgIH0pLFxuICAgIGNyZWRlbnRpYWxJRDogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSB1bmlxdWUgaWRlbnRpZmllciBvZiB0aGUgcmVnaXN0ZXJlZCBjcmVkZW50aWFsJyB9XG4gICAgfSksXG4gICAgY291bnRlcjogKCkgPT4gKHtcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnVGhlIGNvdW50ZXIgb2YgdGhlIHBhc3NrZXknIH1cbiAgICB9KSxcbiAgICBkZXZpY2VUeXBlOiAoKSA9PiAoe1xuICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdUaGUgdHlwZSBvZiBkZXZpY2UgdXNlZCB0byByZWdpc3RlciB0aGUgcGFzc2tleScgfVxuICAgIH0pLFxuICAgIGJhY2tlZFVwOiAoKSA9PiAoe1xuICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdXaGV0aGVyIHRoZSBwYXNza2V5IGlzIGJhY2tlZCB1cCcgfVxuICAgIH0pLFxuICAgIHRyYW5zcG9ydHM6ICgpID0+ICh7XG4gICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSB0cmFuc3BvcnRzIHVzZWQgdG8gcmVnaXN0ZXIgdGhlIHBhc3NrZXknIH1cbiAgICB9KVxuICB9XG5cbiAgY29uc3QgY29sbGVjdGlvbkZpZWxkcyA9IGdldENvbGxlY3Rpb25GaWVsZHMoe1xuICAgIHNjaGVtYTogcGFzc2tleVNjaGVtYSxcbiAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmllbGRPdmVycmlkZXNcbiAgfSlcblxuICBsZXQgcGFzc2tleUNvbGxlY3Rpb246IENvbGxlY3Rpb25Db25maWcgPSB7XG4gICAgLi4uZXhpc3RpbmdQYXNza2V5Q29sbGVjdGlvbixcbiAgICBzbHVnOiBwYXNza2V5U2x1ZyxcbiAgICBhZG1pbjoge1xuICAgICAgaGlkZGVuOiBwbHVnaW5PcHRpb25zLmhpZGVQbHVnaW5Db2xsZWN0aW9ucyA/PyBmYWxzZSxcbiAgICAgIHVzZUFzVGl0bGU6IGdldFNjaGVtYUZpZWxkTmFtZShyZXNvbHZlZFNjaGVtYXMsIGJhTW9kZWxLZXkucGFzc2tleSwgJ25hbWUnKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnUGFzc2tleXMgYXJlIHVzZWQgdG8gYXV0aGVudGljYXRlIHVzZXJzJyxcbiAgICAgIGdyb3VwOiBwbHVnaW5PcHRpb25zPy5jb2xsZWN0aW9uQWRtaW5Hcm91cCA/PyAnQXV0aCcsXG4gICAgICAuLi5leGlzdGluZ1Bhc3NrZXlDb2xsZWN0aW9uPy5hZG1pblxuICAgIH0sXG4gICAgYWNjZXNzOiB7XG4gICAgICAuLi5nZXRBZG1pbkFjY2VzcyhwbHVnaW5PcHRpb25zKSxcbiAgICAgIHJlYWQ6IGlzQWRtaW5PckN1cnJlbnRVc2VyV2l0aFJvbGVzKHtcbiAgICAgICAgaWRGaWVsZDogdXNlcklkRmllbGROYW1lLFxuICAgICAgICBhZG1pblJvbGVzXG4gICAgICB9KSxcbiAgICAgIGRlbGV0ZTogaXNBZG1pbk9yQ3VycmVudFVzZXJXaXRoUm9sZXMoe1xuICAgICAgICBpZEZpZWxkOiB1c2VySWRGaWVsZE5hbWUsXG4gICAgICAgIGFkbWluUm9sZXNcbiAgICAgIH0pLFxuICAgICAgLi4uKGV4aXN0aW5nUGFzc2tleUNvbGxlY3Rpb24/LmFjY2VzcyA/PyB7fSlcbiAgICB9LFxuICAgIGN1c3RvbToge1xuICAgICAgLi4uKGV4aXN0aW5nUGFzc2tleUNvbGxlY3Rpb24/LmN1c3RvbSA/PyB7fSksXG4gICAgICBiZXR0ZXJBdXRoTW9kZWxLZXk6IGJhTW9kZWxLZXkucGFzc2tleVxuICAgIH0sXG4gICAgZmllbGRzOiBbLi4uKGV4aXN0aW5nUGFzc2tleUNvbGxlY3Rpb24/LmZpZWxkcyA/PyBbXSksIC4uLihjb2xsZWN0aW9uRmllbGRzID8/IFtdKV1cbiAgfVxuXG4gIGlmICh0eXBlb2YgcGx1Z2luT3B0aW9ucy5wbHVnaW5Db2xsZWN0aW9uT3ZlcnJpZGVzPy5wYXNza2V5cyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHBhc3NrZXlDb2xsZWN0aW9uID0gcGx1Z2luT3B0aW9ucy5wbHVnaW5Db2xsZWN0aW9uT3ZlcnJpZGVzLnBhc3NrZXlzKHtcbiAgICAgIGNvbGxlY3Rpb246IHBhc3NrZXlDb2xsZWN0aW9uXG4gICAgfSlcbiAgfVxuXG4gIGFzc2VydEFsbFNjaGVtYUZpZWxkcyhwYXNza2V5Q29sbGVjdGlvbiwgcGFzc2tleVNjaGVtYSlcblxuICByZXR1cm4gcGFzc2tleUNvbGxlY3Rpb25cbn1cbiJdLCJuYW1lcyI6WyJiYU1vZGVsRmllbGRLZXlzVG9GaWVsZE5hbWVzIiwiYmFNb2RlbEtleSIsImRlZmF1bHRzIiwiZ2V0QWRtaW5BY2Nlc3MiLCJnZXRTY2hlbWFDb2xsZWN0aW9uU2x1ZyIsImdldFNjaGVtYUZpZWxkTmFtZSIsImFzc2VydEFsbFNjaGVtYUZpZWxkcyIsImlzQWRtaW5PckN1cnJlbnRVc2VyV2l0aFJvbGVzIiwiZ2V0Q29sbGVjdGlvbkZpZWxkcyIsImJ1aWxkUGFzc2tleXNDb2xsZWN0aW9uIiwiaW5jb21pbmdDb2xsZWN0aW9ucyIsInBsdWdpbk9wdGlvbnMiLCJyZXNvbHZlZFNjaGVtYXMiLCJwYXNza2V5U2x1ZyIsInBhc3NrZXkiLCJwYXNza2V5U2NoZW1hIiwidXNlcklkRmllbGROYW1lIiwiZmllbGRzIiwidXNlcklkIiwiZmllbGROYW1lIiwiYWRtaW5Sb2xlcyIsInVzZXJzIiwiYWRtaW5Sb2xlIiwiZXhpc3RpbmdQYXNza2V5Q29sbGVjdGlvbiIsImZpbmQiLCJjb2xsZWN0aW9uIiwic2x1ZyIsImZpZWxkT3ZlcnJpZGVzIiwibmFtZSIsImFkbWluIiwicmVhZE9ubHkiLCJkZXNjcmlwdGlvbiIsInB1YmxpY0tleSIsImluZGV4IiwiY3JlZGVudGlhbElEIiwiY291bnRlciIsInJlcXVpcmVkIiwiZGV2aWNlVHlwZSIsImJhY2tlZFVwIiwidHJhbnNwb3J0cyIsImNvbGxlY3Rpb25GaWVsZHMiLCJzY2hlbWEiLCJhZGRpdGlvbmFsUHJvcGVydGllcyIsInBhc3NrZXlDb2xsZWN0aW9uIiwiaGlkZGVuIiwiaGlkZVBsdWdpbkNvbGxlY3Rpb25zIiwidXNlQXNUaXRsZSIsImdyb3VwIiwiY29sbGVjdGlvbkFkbWluR3JvdXAiLCJhY2Nlc3MiLCJyZWFkIiwiaWRGaWVsZCIsImRlbGV0ZSIsImN1c3RvbSIsImJldHRlckF1dGhNb2RlbEtleSIsInBsdWdpbkNvbGxlY3Rpb25PdmVycmlkZXMiLCJwYXNza2V5cyJdLCJtYXBwaW5ncyI6IkFBR0EsU0FBU0EsNEJBQTRCLEVBQUVDLFVBQVUsRUFBRUMsUUFBUSxRQUFRLGtCQUFpQjtBQUNwRixTQUFTQyxjQUFjLFFBQVEsaUNBQWdDO0FBQy9ELFNBQVNDLHVCQUF1QixFQUFFQyxrQkFBa0IsUUFBUSw0QkFBMkI7QUFDdkYsU0FBU0MscUJBQXFCLFFBQVEsNEJBQTJCO0FBQ2pFLFNBQVNDLDZCQUE2QixRQUFRLHlCQUF3QjtBQUN0RSxTQUFTQyxtQkFBbUIsUUFBUSw2Q0FBNEM7QUFFaEYsT0FBTyxTQUFTQyx3QkFBd0IsRUFBRUMsbUJBQW1CLEVBQUVDLGFBQWEsRUFBRUMsZUFBZSxFQUF3QjtJQUNuSCxNQUFNQyxjQUFjVCx3QkFBd0JRLGlCQUFpQlgsV0FBV2EsT0FBTztJQUMvRSxNQUFNQyxnQkFBZ0JILGVBQWUsQ0FBQ1gsV0FBV2EsT0FBTyxDQUFDO0lBQ3pELE1BQU1FLGtCQUFrQkQsZUFBZUUsUUFBUUMsUUFBUUMsYUFBYW5CLDZCQUE2QmMsT0FBTyxDQUFDSSxNQUFNO0lBQy9HLE1BQU1FLGFBQWFULGNBQWNVLEtBQUssRUFBRUQsY0FBYztRQUFDbEIsU0FBU29CLFNBQVM7S0FBQztJQUUxRSxNQUFNQyw0QkFB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