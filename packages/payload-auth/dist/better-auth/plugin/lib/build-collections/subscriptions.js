import { baModelKey } from "../../constants";
import { getAdminAccess } from "../../helpers/get-admin-access";
import { getCollectionFields } from "./utils/transform-schema-fields-to-payload";
import { getSchemaCollectionSlug, getSchemaFieldName } from "./utils/collection-schema";
import { assertAllSchemaFields } from "./utils/collection-schema";
export function buildSubscriptionsCollection({ incomingCollections, pluginOptions, resolvedSchemas }) {
    const subscriptionsSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.subscription);
    const subscriptionsSchema = resolvedSchemas[baModelKey.subscription];
    const existingSubscriptionCollection = incomingCollections.find((collection)=>collection.slug === subscriptionsSlug);
    const fieldOverrides = {
        plan: ()=>({
                index: true,
                admin: {
                    readOnly: true,
                    description: 'The name of the subscription plan'
                }
            }),
        referenceId: ()=>({
                index: true,
                admin: {
                    readOnly: true,
                    description: 'The ID this subscription is associated with (user ID by default)'
                }
            }),
        stripeCustomerId: ()=>({
                index: true,
                admin: {
                    readOnly: true,
                    description: 'The Stripe customer ID'
                }
            }),
        stripeSubscriptionId: ()=>({
                index: true,
                admin: {
                    readOnly: true,
                    description: 'The Stripe subscription ID'
                }
            }),
        status: ()=>({
                index: true,
                admin: {
                    description: 'The status of the subscription (active, canceled, etc.)'
                }
            }),
        periodStart: ()=>({
                admin: {
                    description: 'Start date of the current billing period'
                }
            }),
        periodEnd: ()=>({
                admin: {
                    description: 'End date of the current billing period'
                }
            }),
        cancelAtPeriodEnd: ()=>({
                admin: {
                    description: 'Whether the subscription will be canceled at the end of the period'
                }
            }),
        seats: ()=>({
                admin: {
                    description: 'Number of seats for team plans'
                }
            }),
        trialStart: ()=>({
                admin: {
                    description: 'Start date of the trial period'
                }
            }),
        trialEnd: ()=>({
                admin: {
                    description: 'End date of the trial period'
                }
            })
    };
    const collectionFields = getCollectionFields({
        schema: subscriptionsSchema,
        additionalProperties: fieldOverrides
    });
    let subscriptionsCollection = {
        ...existingSubscriptionCollection,
        slug: subscriptionsSlug,
        admin: {
            useAsTitle: getSchemaFieldName(resolvedSchemas, baModelKey.subscription, 'plan'),
            description: 'Subscriptions are used to manage the subscriptions of the users',
            group: pluginOptions?.collectionAdminGroup ?? 'Auth',
            ...existingSubscriptionCollection?.admin
        },
        access: {
            ...getAdminAccess(pluginOptions),
            ...existingSubscriptionCollection?.access ?? {}
        },
        custom: {
            ...existingSubscriptionCollection?.custom ?? {},
            betterAuthModelKey: baModelKey.subscription
        },
        fields: [
            ...existingSubscriptionCollection?.fields ?? [],
            ...collectionFields ?? []
        ]
    };
    if (typeof pluginOptions.pluginCollectionOverrides?.subscriptions === 'function') {
        subscriptionsCollection = pluginOptions.pluginCollectionOverrides.subscriptions({
            collection: subscriptionsCollection
        });
    }
    assertAllSchemaFields(subscriptionsCollection, subscriptionsSchema);
    return subscriptionsCollection;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3N1YnNjcmlwdGlvbnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYmFNb2RlbEtleSB9IGZyb20gJy4uLy4uL2NvbnN0YW50cydcbmltcG9ydCB7IGdldEFkbWluQWNjZXNzIH0gZnJvbSAnLi4vLi4vaGVscGVycy9nZXQtYWRtaW4tYWNjZXNzJ1xuaW1wb3J0IHsgZ2V0Q29sbGVjdGlvbkZpZWxkcyB9IGZyb20gJy4vdXRpbHMvdHJhbnNmb3JtLXNjaGVtYS1maWVsZHMtdG8tcGF5bG9hZCdcbmltcG9ydCB7IGdldFNjaGVtYUNvbGxlY3Rpb25TbHVnLCBnZXRTY2hlbWFGaWVsZE5hbWUgfSBmcm9tICcuL3V0aWxzL2NvbGxlY3Rpb24tc2NoZW1hJ1xuaW1wb3J0IHsgYXNzZXJ0QWxsU2NoZW1hRmllbGRzIH0gZnJvbSAnLi91dGlscy9jb2xsZWN0aW9uLXNjaGVtYSdcblxuaW1wb3J0IHR5cGUgeyBDb2xsZWN0aW9uQ29uZmlnIH0gZnJvbSAncGF5bG9hZCdcbmltcG9ydCB0eXBlIHsgU3Vic2NyaXB0aW9uIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9nZW5lcmF0ZWQtdHlwZXMnXG5pbXBvcnQgdHlwZSB7IEJ1aWxkQ29sbGVjdGlvblByb3BzLCBGaWVsZE92ZXJyaWRlcyB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL3R5cGVzJ1xuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRTdWJzY3JpcHRpb25zQ29sbGVjdGlvbih7XG4gIGluY29taW5nQ29sbGVjdGlvbnMsXG4gIHBsdWdpbk9wdGlvbnMsXG4gIHJlc29sdmVkU2NoZW1hc1xufTogQnVpbGRDb2xsZWN0aW9uUHJvcHMpOiBDb2xsZWN0aW9uQ29uZmlnIHtcbiAgY29uc3Qgc3Vic2NyaXB0aW9uc1NsdWcgPSBnZXRTY2hlbWFDb2xsZWN0aW9uU2x1ZyhyZXNvbHZlZFNjaGVtYXMsIGJhTW9kZWxLZXkuc3Vic2NyaXB0aW9uKVxuICBjb25zdCBzdWJzY3JpcHRpb25zU2NoZW1hID0gcmVzb2x2ZWRTY2hlbWFzW2JhTW9kZWxLZXkuc3Vic2NyaXB0aW9uXVxuXG4gIGNvbnN0IGV4aXN0aW5nU3Vic2NyaXB0aW9uQ29sbGVjdGlvbiA9IGluY29taW5nQ29sbGVjdGlvbnMuZmluZCgoY29sbGVjdGlvbikgPT4gY29sbGVjdGlvbi5zbHVnID09PSBzdWJzY3JpcHRpb25zU2x1ZykgYXNcbiAgICB8IENvbGxlY3Rpb25Db25maWdcbiAgICB8IHVuZGVmaW5lZFxuXG4gIGNvbnN0IGZpZWxkT3ZlcnJpZGVzOiBGaWVsZE92ZXJyaWRlczxrZXlvZiBTdWJzY3JpcHRpb24+ID0ge1xuICAgIHBsYW46ICgpID0+ICh7XG4gICAgICBpbmRleDogdHJ1ZSxcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSBuYW1lIG9mIHRoZSBzdWJzY3JpcHRpb24gcGxhbicgfVxuICAgIH0pLFxuICAgIHJlZmVyZW5jZUlkOiAoKSA9PiAoe1xuICAgICAgaW5kZXg6IHRydWUsXG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdUaGUgSUQgdGhpcyBzdWJzY3JpcHRpb24gaXMgYXNzb2NpYXRlZCB3aXRoICh1c2VyIElEIGJ5IGRlZmF1bHQpJyB9XG4gICAgfSksXG4gICAgc3RyaXBlQ3VzdG9tZXJJZDogKCkgPT4gKHtcbiAgICAgIGluZGV4OiB0cnVlLFxuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnVGhlIFN0cmlwZSBjdXN0b21lciBJRCcgfVxuICAgIH0pLFxuICAgIHN0cmlwZVN1YnNjcmlwdGlvbklkOiAoKSA9PiAoe1xuICAgICAgaW5kZXg6IHRydWUsXG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdUaGUgU3RyaXBlIHN1YnNjcmlwdGlvbiBJRCcgfVxuICAgIH0pLFxuICAgIHN0YXR1czogKCkgPT4gKHtcbiAgICAgIGluZGV4OiB0cnVlLFxuICAgICAgYWRtaW46IHsgZGVzY3JpcHRpb246ICdUaGUgc3RhdHVzIG9mIHRoZSBzdWJzY3JpcHRpb24gKGFjdGl2ZSwgY2FuY2VsZWQsIGV0Yy4pJyB9XG4gICAgfSksXG4gICAgcGVyaW9kU3RhcnQ6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyBkZXNjcmlwdGlvbjogJ1N0YXJ0IGRhdGUgb2YgdGhlIGN1cnJlbnQgYmlsbGluZyBwZXJpb2QnIH1cbiAgICB9KSxcbiAgICBwZXJpb2RFbmQ6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyBkZXNjcmlwdGlvbjogJ0VuZCBkYXRlIG9mIHRoZSBjdXJyZW50IGJpbGxpbmcgcGVyaW9kJyB9XG4gICAgfSksXG4gICAgY2FuY2VsQXRQZXJpb2RFbmQ6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyBkZXNjcmlwdGlvbjogJ1doZXRoZXIgdGhlIHN1YnNjcmlwdGlvbiB3aWxsIGJlIGNhbmNlbGVkIGF0IHRoZSBlbmQgb2YgdGhlIHBlcmlvZCcgfVxuICAgIH0pLFxuICAgIHNlYXRzOiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHsgZGVzY3JpcHRpb246ICdOdW1iZXIgb2Ygc2VhdHMgZm9yIHRlYW0gcGxhbnMnIH1cbiAgICB9KSxcbiAgICB0cmlhbFN0YXJ0OiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHsgZGVzY3JpcHRpb246ICdTdGFydCBkYXRlIG9mIHRoZSB0cmlhbCBwZXJpb2QnIH1cbiAgICB9KSxcbiAgICB0cmlhbEVuZDogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IGRlc2NyaXB0aW9uOiAnRW5kIGRhdGUgb2YgdGhlIHRyaWFsIHBlcmlvZCcgfVxuICAgIH0pXG4gIH1cblxuICBjb25zdCBjb2xsZWN0aW9uRmllbGRzID0gZ2V0Q29sbGVjdGlvbkZpZWxkcyh7XG4gICAgc2NoZW1hOiBzdWJzY3JpcHRpb25zU2NoZW1hLFxuICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmaWVsZE92ZXJyaWRlc1xuICB9KVxuXG4gIGxldCBzdWJzY3JpcHRpb25zQ29sbGVjdGlvbjogQ29sbGVjdGlvbkNvbmZpZyA9IHtcbiAgICAuLi5leGlzdGluZ1N1YnNjcmlwdGlvbkNvbGxlY3Rpb24sXG4gICAgc2x1Zzogc3Vic2NyaXB0aW9uc1NsdWcsXG4gICAgYWRtaW46IHtcbiAgICAgIHVzZUFzVGl0bGU6IGdldFNjaGVtYUZpZWxkTmFtZShyZXNvbHZlZFNjaGVtYXMsIGJhTW9kZWxLZXkuc3Vic2NyaXB0aW9uLCAncGxhbicpLFxuICAgICAgZGVzY3JpcHRpb246ICdTdWJzY3JpcHRpb25zIGFyZSB1c2VkIHRvIG1hbmFnZSB0aGUgc3Vic2NyaXB0aW9ucyBvZiB0aGUgdXNlcnMnLFxuICAgICAgZ3JvdXA6IHBsdWdpbk9wdGlvbnM/LmNvbGxlY3Rpb25BZG1pbkdyb3VwID8/ICdBdXRoJyxcbiAgICAgIC4uLmV4aXN0aW5nU3Vic2NyaXB0aW9uQ29sbGVjdGlvbj8uYWRtaW5cbiAgICB9LFxuICAgIGFjY2Vzczoge1xuICAgICAgLi4uZ2V0QWRtaW5BY2Nlc3MocGx1Z2luT3B0aW9ucyksXG4gICAgICAuLi4oZXhpc3RpbmdTdWJzY3JpcHRpb25Db2xsZWN0aW9uPy5hY2Nlc3MgPz8ge30pXG4gICAgfSxcbiAgICBjdXN0b206IHtcbiAgICAgIC4uLihleGlzdGluZ1N1YnNjcmlwdGlvbkNvbGxlY3Rpb24/LmN1c3RvbSA/PyB7fSksXG4gICAgICBiZXR0ZXJBdXRoTW9kZWxLZXk6IGJhTW9kZWxLZXkuc3Vic2NyaXB0aW9uXG4gICAgfSxcbiAgICBmaWVsZHM6IFsuLi4oZXhpc3RpbmdTdWJzY3JpcHRpb25Db2xsZWN0aW9uPy5maWVsZHMgPz8gW10pLCAuLi4oY29sbGVjdGlvbkZpZWxkcyA/PyBbXSldXG4gIH1cblxuICBpZiAodHlwZW9mIHBsdWdpbk9wdGlvbnMucGx1Z2luQ29sbGVjdGlvbk92ZXJyaWRlcz8uc3Vic2NyaXB0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHN1YnNjcmlwdGlvbnNDb2xsZWN0aW9uID0gcGx1Z2luT3B0aW9ucy5wbHVnaW5Db2xsZWN0aW9uT3ZlcnJpZGVzLnN1YnNjcmlwdGlvbnMoe1xuICAgICAgY29sbGVjdGlvbjogc3Vic2NyaXB0aW9uc0NvbGxlY3Rpb25cbiAgICB9KVxuICB9XG5cbiAgYXNzZXJ0QWxsU2NoZW1hRmllbGRzKHN1YnNjcmlwdGlvbnNDb2xsZWN0aW9uLCBzdWJzY3JpcHRpb25zU2NoZW1hKVxuXG4gIHJldHVybiBzdWJzY3JpcHRpb25zQ29sbGVjdGlvblxufVxuIl0sIm5hbWVzIjpbImJhTW9kZWxLZXkiLCJnZXRBZG1pbkFjY2VzcyIsImdldENvbGxlY3Rpb25GaWVsZHMiLCJnZXRTY2hlbWFDb2xsZWN0aW9uU2x1ZyIsImdldFNjaGVtYUZpZWxkTmFtZSIsImFzc2VydEFsbFNjaGVtYUZpZWxkcyIsImJ1aWxkU3Vic2NyaXB0aW9uc0NvbGxlY3Rpb24iLCJpbmNvbWluZ0NvbGxlY3Rpb25zIiwicGx1Z2luT3B0aW9ucyIsInJlc29sdmVkU2NoZW1hcyIsInN1YnNjcmlwdGlvbnNTbHVnIiwic3Vic2NyaXB0aW9uIiwic3Vic2NyaXB0aW9uc1NjaGVtYSIsImV4aXN0aW5nU3Vic2NyaXB0aW9uQ29sbGVjdGlvbiIsImZpbmQiLCJjb2xsZWN0aW9uIiwic2x1ZyIsImZpZWxkT3ZlcnJpZGVzIiwicGxhbiIsImluZGV4IiwiYWRtaW4iLCJyZWFkT25seSIsImRlc2NyaXB0aW9uIiwicmVmZXJlbmNlSWQiLCJzdHJpcGVDdXN0b21lcklkIiwic3RyaXBlU3Vic2NyaXB0aW9uSWQiLCJzdGF0dXMiLCJwZXJpb2RTdGFydCIsInBlcmlvZEVuZCIsImNhbmNlbEF0UGVyaW9kRW5kIiwic2VhdHMiLCJ0cmlhbFN0YXJ0IiwidHJpYWxFbmQiLCJjb2xsZWN0aW9uRmllbGRzIiwic2NoZW1hIiwiYWRkaXRpb25hbFByb3BlcnRpZXMiLCJzdWJzY3JpcHRpb25zQ29sbGVjdGlvbiIsInVzZUFzVGl0bGUiLCJncm91cCIsImNvbGxlY3Rpb25BZG1pbkdyb3VwIiwiYWNjZXNzIiwiY3VzdG9tIiwiYmV0dGVyQXV0aE1vZGVsS2V5IiwiZmllbGRzIiwicGx1Z2luQ29sbGVjdGlvbk92ZXJyaWRlcyIsInN1YnNjcmlwdGlvbnMiXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLFVBQVUsUUFBUSxrQkFBaUI7QUFDNUMsU0FBU0MsY0FBYyxRQUFRLGlDQUFnQztBQUMvRCxTQUFTQyxtQkFBbUIsUUFBUSw2Q0FBNEM7QUFDaEYsU0FBU0MsdUJBQXVCLEVBQUVDLGtCQUFrQixRQUFRLDRCQUEyQjtBQUN2RixTQUFTQyxxQkFBcUIsUUFBUSw0QkFBMkI7QUFNakUsT0FBTyxTQUFTQyw2QkFBNkIsRUFDM0NDLG1CQUFtQixFQUNuQkMsYUFBYSxFQUNiQyxlQUFlLEVBQ007SUFDckIsTUFBTUMsb0JBQW9CUCx3QkFBd0JNLGlCQUFpQlQsV0FBV1csWUFBWTtJQUMxRixNQUFNQyxzQkFBc0JILGVBQWUsQ0FBQ1QsV0FBV1csWUFBWSxDQUFDO0lBRXBFLE1BQU1FLGlDQUFpQ04sb0JBQW9CTyxJQUFJLENBQUMsQ0FBQ0MsYUFBZUEsV0FBV0MsSUFBSSxLQUFLTjtJQUlwRyxNQUFNTyxpQkFBcUQ7UUFDekRDLE1BQU0sSUFBTyxDQUFBO2dCQUNYQyxPQUFPO2dCQUNQQyxPQUFPO29CQUFFQyxVQUFVO29CQUFNQyxhQUFhO2dCQUFvQztZQUM1RSxDQUFBO1FBQ0FDLGFBQWEsSUFBTyxDQUFBO2dCQUNsQkosT0FBTztnQkFDUEMsT0FBTztvQkFBRUMsVUFBVTtvQkFBTUMsYUFBYTtnQkFBbUU7WUFDM0csQ0FBQTtRQUNBRSxrQkFBa0IsSUFBTyxDQUFBO2dCQUN2QkwsT0FBTztnQkFDUEMsT0FBTztvQkFBRUMsVUFBVTtvQkFBTUMsYUFBYTtnQkFBeUI7WUFDakUsQ0FBQTtRQUNBRyxzQkFBc0IsSUFBTyxDQUFBO2dCQUMzQk4sT0FBTztnQkFDUEMsT0FBTztvQkFBRUMsVUFBVTtvQkFBTUMsYUFBYTtnQkFBNkI7WUFDckUsQ0FBQTtRQUNBSSxRQUFRLElBQU8sQ0FBQTtnQkFDYlAsT0FBTztnQkFDUEMsT0FBTztvQkFBRUUsYUFBYTtnQkFBMEQ7WUFDbEYsQ0FBQTtRQUNBSyxhQUFhLElBQU8sQ0FBQTtnQkFDbEJQLE9BQU87b0JBQUVFLGFBQWE7Z0JBQTJDO1lBQ25FLENBQUE7UUFDQU0sV0FBVyxJQUFPLENBQUE7Z0JBQ2hCUixPQUFPO29CQUFFRSxhQUFhO2dCQUF5QztZQUNqRSxDQUFBO1FBQ0FPLG1CQUFtQixJQUFPLENBQUE7Z0JBQ3hCVCxPQUFPO29CQUFFRSxhQUFhO2dCQUFxRTtZQUM3RixDQUFBO1FBQ0FRLE9BQU8sSUFBTyxDQUFBO2dCQUNaVixPQUFPO29CQUFFRSxhQUFhO2dCQUFpQztZQUN6RCxDQUFBO1FBQ0FTLFlBQVksSUFBTyxDQUFBO2dCQUNqQlgsT0FBTztvQkFBRUUsYUFBYTtnQkFBaUM7WUFDekQsQ0FBQTtRQUNBVSxVQUFVLElBQU8sQ0FBQTtnQkFDZlosT0FBTztvQkFBRUUsYUFBYTtnQkFBK0I7WUFDdkQsQ0FBQTtJQUNGO0lBRUEsTUFBTVcsbUJBQW1CL0Isb0JBQW9CO1FBQzNDZ0MsUUFBUXRCO1FBQ1J1QixzQkFBc0JsQjtJQUN4QjtJQUVBLElBQUltQiwwQkFBNEM7UUFDOUMsR0FBR3ZCLDhCQUE4QjtRQUNqQ0csTUFBTU47UUFDTlUsT0FBTztZQUNMaUIsWUFBWWpDLG1CQUFtQkssaUJBQWlCVCxXQUFXVyxZQUFZLEVBQUU7WUFDekVXLGFBQWE7WUFDYmdCLE9BQU85QixlQUFlK0Isd0JBQXdCO1lBQzlDLEdBQUcxQixnQ0FBZ0NPLEtBQUs7UUFDMUM7UUFDQW9CLFFBQVE7WUFDTixHQUFHdkMsZUFBZU8sY0FBYztZQUNoQyxHQUFJSyxnQ0FBZ0MyQixVQUFVLENBQUMsQ0FBQztRQUNsRDtRQUNBQyxRQUFRO1lBQ04sR0FBSTVCLGdDQUFnQzRCLFVBQVUsQ0FBQyxDQUFDO1lBQ2hEQyxvQkFBb0IxQyxXQUFXVyxZQUFZO1FBQzdDO1FBQ0FnQyxRQUFRO2VBQUs5QixnQ0FBZ0M4QixVQUFVLEVBQUU7ZUFBT1Ysb0JBQW9CLEVBQUU7U0FBRTtJQUMxRjtJQUVBLElBQUksT0FBT3pCLGNBQWNvQyx5QkFBeUIsRUFBRUMsa0JBQWtCLFlBQVk7UUFDaEZULDBCQUEwQjVCLGNBQWNvQyx5QkFBeUIsQ0FBQ0MsYUFBYSxDQUFDO1lBQzlFOUIsWUFBWXFCO1FBQ2Q7SUFDRjtJQUVBL0Isc0JBQXNCK0IseUJBQXlCeEI7SUFFL0MsT0FBT3dCO0FBQ1QifQ==