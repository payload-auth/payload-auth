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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3N1YnNjcmlwdGlvbnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYmFNb2RlbEtleSB9IGZyb20gJy4uLy4uL2NvbnN0YW50cydcbmltcG9ydCB7IGdldEFkbWluQWNjZXNzIH0gZnJvbSAnLi4vLi4vaGVscGVycy9nZXQtYWRtaW4tYWNjZXNzJ1xuaW1wb3J0IHsgZ2V0Q29sbGVjdGlvbkZpZWxkcyB9IGZyb20gJy4vdXRpbHMvdHJhbnNmb3JtLXNjaGVtYS1maWVsZHMtdG8tcGF5bG9hZCdcbmltcG9ydCB7IGdldFNjaGVtYUNvbGxlY3Rpb25TbHVnLCBnZXRTY2hlbWFGaWVsZE5hbWUgfSBmcm9tICcuL3V0aWxzL2NvbGxlY3Rpb24tc2NoZW1hJ1xuaW1wb3J0IHsgYXNzZXJ0QWxsU2NoZW1hRmllbGRzIH0gZnJvbSAnLi91dGlscy9jb2xsZWN0aW9uLXNjaGVtYSdcblxuaW1wb3J0IHR5cGUgeyBDb2xsZWN0aW9uQ29uZmlnIH0gZnJvbSAncGF5bG9hZCdcbmltcG9ydCB0eXBlIHsgU3Vic2NyaXB0aW9uIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9nZW5lcmF0ZWQtdHlwZXMnXG5pbXBvcnQgdHlwZSB7IEJ1aWxkQ29sbGVjdGlvblByb3BzLCBGaWVsZE92ZXJyaWRlcyB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL3R5cGVzJ1xuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRTdWJzY3JpcHRpb25zQ29sbGVjdGlvbih7IGluY29taW5nQ29sbGVjdGlvbnMsIHBsdWdpbk9wdGlvbnMsIHJlc29sdmVkU2NoZW1hcyB9OiBCdWlsZENvbGxlY3Rpb25Qcm9wcyk6IENvbGxlY3Rpb25Db25maWcge1xuICBjb25zdCBzdWJzY3JpcHRpb25zU2x1ZyA9IGdldFNjaGVtYUNvbGxlY3Rpb25TbHVnKHJlc29sdmVkU2NoZW1hcywgYmFNb2RlbEtleS5zdWJzY3JpcHRpb24pXG4gIGNvbnN0IHN1YnNjcmlwdGlvbnNTY2hlbWEgPSByZXNvbHZlZFNjaGVtYXNbYmFNb2RlbEtleS5zdWJzY3JpcHRpb25dXG5cbiAgY29uc3QgZXhpc3RpbmdTdWJzY3JpcHRpb25Db2xsZWN0aW9uID0gaW5jb21pbmdDb2xsZWN0aW9ucy5maW5kKChjb2xsZWN0aW9uKSA9PiBjb2xsZWN0aW9uLnNsdWcgPT09IHN1YnNjcmlwdGlvbnNTbHVnKSBhc1xuICAgIHwgQ29sbGVjdGlvbkNvbmZpZ1xuICAgIHwgdW5kZWZpbmVkXG5cbiAgY29uc3QgZmllbGRPdmVycmlkZXM6IEZpZWxkT3ZlcnJpZGVzPGtleW9mIFN1YnNjcmlwdGlvbj4gPSB7XG4gICAgcGxhbjogKCkgPT4gKHtcbiAgICAgIGluZGV4OiB0cnVlLFxuICAgICAgYWRtaW46IHsgcmVhZE9ubHk6IHRydWUsIGRlc2NyaXB0aW9uOiAnVGhlIG5hbWUgb2YgdGhlIHN1YnNjcmlwdGlvbiBwbGFuJyB9XG4gICAgfSksXG4gICAgcmVmZXJlbmNlSWQ6ICgpID0+ICh7XG4gICAgICBpbmRleDogdHJ1ZSxcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSBJRCB0aGlzIHN1YnNjcmlwdGlvbiBpcyBhc3NvY2lhdGVkIHdpdGggKHVzZXIgSUQgYnkgZGVmYXVsdCknIH1cbiAgICB9KSxcbiAgICBzdHJpcGVDdXN0b21lcklkOiAoKSA9PiAoe1xuICAgICAgaW5kZXg6IHRydWUsXG4gICAgICBhZG1pbjogeyByZWFkT25seTogdHJ1ZSwgZGVzY3JpcHRpb246ICdUaGUgU3RyaXBlIGN1c3RvbWVyIElEJyB9XG4gICAgfSksXG4gICAgc3RyaXBlU3Vic2NyaXB0aW9uSWQ6ICgpID0+ICh7XG4gICAgICBpbmRleDogdHJ1ZSxcbiAgICAgIGFkbWluOiB7IHJlYWRPbmx5OiB0cnVlLCBkZXNjcmlwdGlvbjogJ1RoZSBTdHJpcGUgc3Vic2NyaXB0aW9uIElEJyB9XG4gICAgfSksXG4gICAgc3RhdHVzOiAoKSA9PiAoe1xuICAgICAgaW5kZXg6IHRydWUsXG4gICAgICBhZG1pbjogeyBkZXNjcmlwdGlvbjogJ1RoZSBzdGF0dXMgb2YgdGhlIHN1YnNjcmlwdGlvbiAoYWN0aXZlLCBjYW5jZWxlZCwgZXRjLiknIH1cbiAgICB9KSxcbiAgICBwZXJpb2RTdGFydDogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IGRlc2NyaXB0aW9uOiAnU3RhcnQgZGF0ZSBvZiB0aGUgY3VycmVudCBiaWxsaW5nIHBlcmlvZCcgfVxuICAgIH0pLFxuICAgIHBlcmlvZEVuZDogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IGRlc2NyaXB0aW9uOiAnRW5kIGRhdGUgb2YgdGhlIGN1cnJlbnQgYmlsbGluZyBwZXJpb2QnIH1cbiAgICB9KSxcbiAgICBjYW5jZWxBdFBlcmlvZEVuZDogKCkgPT4gKHtcbiAgICAgIGFkbWluOiB7IGRlc2NyaXB0aW9uOiAnV2hldGhlciB0aGUgc3Vic2NyaXB0aW9uIHdpbGwgYmUgY2FuY2VsZWQgYXQgdGhlIGVuZCBvZiB0aGUgcGVyaW9kJyB9XG4gICAgfSksXG4gICAgc2VhdHM6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyBkZXNjcmlwdGlvbjogJ051bWJlciBvZiBzZWF0cyBmb3IgdGVhbSBwbGFucycgfVxuICAgIH0pLFxuICAgIHRyaWFsU3RhcnQ6ICgpID0+ICh7XG4gICAgICBhZG1pbjogeyBkZXNjcmlwdGlvbjogJ1N0YXJ0IGRhdGUgb2YgdGhlIHRyaWFsIHBlcmlvZCcgfVxuICAgIH0pLFxuICAgIHRyaWFsRW5kOiAoKSA9PiAoe1xuICAgICAgYWRtaW46IHsgZGVzY3JpcHRpb246ICdFbmQgZGF0ZSBvZiB0aGUgdHJpYWwgcGVyaW9kJyB9XG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IGNvbGxlY3Rpb25GaWVsZHMgPSBnZXRDb2xsZWN0aW9uRmllbGRzKHtcbiAgICBzY2hlbWE6IHN1YnNjcmlwdGlvbnNTY2hlbWEsXG4gICAgYWRkaXRpb25hbFByb3BlcnRpZXM6IGZpZWxkT3ZlcnJpZGVzXG4gIH0pXG5cbiAgbGV0IHN1YnNjcmlwdGlvbnNDb2xsZWN0aW9uOiBDb2xsZWN0aW9uQ29uZmlnID0ge1xuICAgIC4uLmV4aXN0aW5nU3Vic2NyaXB0aW9uQ29sbGVjdGlvbixcbiAgICBzbHVnOiBzdWJzY3JpcHRpb25zU2x1ZyxcbiAgICBhZG1pbjoge1xuICAgICAgdXNlQXNUaXRsZTogZ2V0U2NoZW1hRmllbGROYW1lKHJlc29sdmVkU2NoZW1hcywgYmFNb2RlbEtleS5zdWJzY3JpcHRpb24sICdwbGFuJyksXG4gICAgICBkZXNjcmlwdGlvbjogJ1N1YnNjcmlwdGlvbnMgYXJlIHVzZWQgdG8gbWFuYWdlIHRoZSBzdWJzY3JpcHRpb25zIG9mIHRoZSB1c2VycycsXG4gICAgICBncm91cDogcGx1Z2luT3B0aW9ucz8uY29sbGVjdGlvbkFkbWluR3JvdXAgPz8gJ0F1dGgnLFxuICAgICAgLi4uZXhpc3RpbmdTdWJzY3JpcHRpb25Db2xsZWN0aW9uPy5hZG1pblxuICAgIH0sXG4gICAgYWNjZXNzOiB7XG4gICAgICAuLi5nZXRBZG1pbkFjY2VzcyhwbHVnaW5PcHRpb25zKSxcbiAgICAgIC4uLihleGlzdGluZ1N1YnNjcmlwdGlvbkNvbGxlY3Rpb24/LmFjY2VzcyA/PyB7fSlcbiAgICB9LFxuICAgIGN1c3RvbToge1xuICAgICAgLi4uKGV4aXN0aW5nU3Vic2NyaXB0aW9uQ29sbGVjdGlvbj8uY3VzdG9tID8/IHt9KSxcbiAgICAgIGJldHRlckF1dGhNb2RlbEtleTogYmFNb2RlbEtleS5zdWJzY3JpcHRpb25cbiAgICB9LFxuICAgIGZpZWxkczogWy4uLihleGlzdGluZ1N1YnNjcmlwdGlvbkNvbGxlY3Rpb24/LmZpZWxkcyA/PyBbXSksIC4uLihjb2xsZWN0aW9uRmllbGRzID8/IFtdKV1cbiAgfVxuXG4gIGlmICh0eXBlb2YgcGx1Z2luT3B0aW9ucy5wbHVnaW5Db2xsZWN0aW9uT3ZlcnJpZGVzPy5zdWJzY3JpcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgc3Vic2NyaXB0aW9uc0NvbGxlY3Rpb24gPSBwbHVnaW5PcHRpb25zLnBsdWdpbkNvbGxlY3Rpb25PdmVycmlkZXMuc3Vic2NyaXB0aW9ucyh7XG4gICAgICBjb2xsZWN0aW9uOiBzdWJzY3JpcHRpb25zQ29sbGVjdGlvblxuICAgIH0pXG4gIH1cblxuICBhc3NlcnRBbGxTY2hlbWFGaWVsZHMoc3Vic2NyaXB0aW9uc0NvbGxlY3Rpb24sIHN1YnNjcmlwdGlvbnNTY2hlbWEpXG5cbiAgcmV0dXJuIHN1YnNjcmlwdGlvbnNDb2xsZWN0aW9uXG59XG4iXSwibmFtZXMiOlsiYmFNb2RlbEtleSIsImdldEFkbWluQWNjZXNzIiwiZ2V0Q29sbGVjdGlvbkZpZWxkcyIsImdldFNjaGVtYUNvbGxlY3Rpb25TbHVnIiwiZ2V0U2NoZW1hRmllbGROYW1lIiwiYXNzZXJ0QWxsU2NoZW1hRmllbGRzIiwiYnVpbGRTdWJzY3JpcHRpb25zQ29sbGVjdGlvbiIsImluY29taW5nQ29sbGVjdGlvbnMiLCJwbHVnaW5PcHRpb25zIiwicmVzb2x2ZWRTY2hlbWFzIiwic3Vic2NyaXB0aW9uc1NsdWciLCJzdWJzY3JpcHRpb24iLCJzdWJzY3JpcHRpb25zU2NoZW1hIiwiZXhpc3RpbmdTdWJzY3JpcHRpb25Db2xsZWN0aW9uIiwiZmluZCIsImNvbGxlY3Rpb24iLCJzbHVnIiwiZmllbGRPdmVycmlkZXMiLCJwbGFuIiwiaW5kZXgiLCJhZG1pbiIsInJlYWRPbmx5IiwiZGVzY3JpcHRpb24iLCJyZWZlcmVuY2VJZCIsInN0cmlwZUN1c3RvbWVySWQiLCJzdHJpcGVTdWJzY3JpcHRpb25JZCIsInN0YXR1cyIsInBlcmlvZFN0YXJ0IiwicGVyaW9kRW5kIiwiY2FuY2VsQXRQZXJpb2RFbmQiLCJzZWF0cyIsInRyaWFsU3RhcnQiLCJ0cmlhbEVuZCIsImNvbGxlY3Rpb25GaWVsZHMiLCJzY2hlbWEiLCJhZGRpdGlvbmFsUHJvcGVydGllcyIsInN1YnNjcmlwdGlvbnNDb2xsZWN0aW9uIiwidXNlQXNUaXRsZSIsImdyb3VwIiwiY29sbGVjdGlvbkFkbWluR3JvdXAiLCJhY2Nlc3MiLCJjdXN0b20iLCJiZXR0ZXJBdXRoTW9kZWxLZXkiLCJmaWVsZHMiLCJwbHVnaW5Db2xsZWN0aW9uT3ZlcnJpZGVzIiwic3Vic2NyaXB0aW9ucyJdLCJtYXBwaW5ncyI6IkFBQUEsU0FBU0EsVUFBVSxRQUFRLGtCQUFpQjtBQUM1QyxTQUFTQyxjQUFjLFFBQVEsaUNBQWdDO0FBQy9ELFNBQVNDLG1CQUFtQixRQUFRLDZDQUE0QztBQUNoRixTQUFTQyx1QkFBdUIsRUFBRUMsa0JBQWtCLFFBQVEsNEJBQTJCO0FBQ3ZGLFNBQVNDLHFCQUFxQixRQUFRLDRCQUEyQjtBQU1qRSxPQUFPLFNBQVNDLDZCQUE2QixFQUFFQyxtQkFBbUIsRUFBRUMsYUFBYSxFQUFFQyxlQUFlLEVBQXdCO0lBQ3hILE1BQU1DLG9CQUFvQlAsd0JBQXdCTSxpQkFBaUJULFdBQVdXLFlBQVk7SUFDMUYsTUFBTUMsc0JBQXNCSCxlQUFlLENBQUNULFdBQVdXLFlBQVksQ0FBQztJQUVwRSxNQUFNRSxpQ0FBaUNOLG9CQUFvQk8sSUFBSSxDQUFDLENBQUNDLGFBQWVBLFdBQVdDLElBQUksS0FBS047SUFJcEcsTUFBTU8saUJBQXFEO1FBQ3pEQyxNQUFNLElBQU8sQ0FBQTtnQkFDWEMsT0FBTztnQkFDUEMsT0FBTztvQkFBRUMsVUFBVTtvQkFBTUMsYUFBYTtnQkFBb0M7WUFDNUUsQ0FBQTtRQUNBQyxhQUFhLElBQU8sQ0FBQTtnQkFDbEJKLE9BQU87Z0JBQ1BDLE9BQU87b0JBQUVDLFVBQVU7b0JBQU1DLGFBQWE7Z0JBQW1FO1lBQzNHLENBQUE7UUFDQUUsa0JBQWtCLElBQU8sQ0FBQTtnQkFDdkJMLE9BQU87Z0JBQ1BDLE9BQU87b0JBQUVDLFVBQVU7b0JBQU1DLGFBQWE7Z0JBQXlCO1lBQ2pFLENBQUE7UUFDQUcsc0JBQXNCLElBQU8sQ0FBQTtnQkFDM0JOLE9BQU87Z0JBQ1BDLE9BQU87b0JBQUVDLFVBQVU7b0JBQU1DLGFBQWE7Z0JBQTZCO1lBQ3JFLENBQUE7UUFDQUksUUFBUSxJQUFPLENBQUE7Z0JBQ2JQLE9BQU87Z0JBQ1BDLE9BQU87b0JBQUVFLGFBQWE7Z0JBQTBEO1lBQ2xGLENBQUE7UUFDQUssYUFBYSxJQUFPLENBQUE7Z0JBQ2xCUCxPQUFPO29CQUFFRSxhQUFhO2dCQUEyQztZQUNuRSxDQUFBO1FBQ0FNLFdBQVcsSUFBTyxDQUFBO2dCQUNoQlIsT0FBTztvQkFBRUUsYUFBYTtnQkFBeUM7WUFDakUsQ0FBQTtRQUNBTyxtQkFBbUIsSUFBTyxDQUFBO2dCQUN4QlQsT0FBTztvQkFBRUUsYUFBYTtnQkFBcUU7WUFDN0YsQ0FBQTtRQUNBUSxPQUFPLElBQU8sQ0FBQTtnQkFDWlYsT0FBTztvQkFBRUUsYUFBYTtnQkFBaUM7WUFDekQsQ0FBQTtRQUNBUyxZQUFZLElBQU8sQ0FBQTtnQkFDakJYLE9BQU87b0JBQUVFLGFBQWE7Z0JBQWlDO1lBQ3pELENBQUE7UUFDQVUsVUFBVSxJQUFPLENBQUE7Z0JBQ2ZaLE9BQU87b0JBQUVFLGFBQWE7Z0JBQStCO1lBQ3ZELENBQUE7SUFDRjtJQUVBLE1BQU1XLG1CQUFtQi9CLG9CQUFvQjtRQUMzQ2dDLFFBQVF0QjtRQUNSdUIsc0JBQXNCbEI7SUFDeEI7SUFFQSxJQUFJbUIsMEJBQTRDO1FBQzlDLEdBQUd2Qiw4QkFBOEI7UUFDakNHLE1BQU1OO1FBQ05VLE9BQU87WUFDTGlCLFlBQVlqQyxtQkFBbUJLLGlCQUFpQlQsV0FBV1csWUFBWSxFQUFFO1lBQ3pFVyxhQUFhO1lBQ2JnQixPQUFPOUIsZUFBZStCLHdCQUF3QjtZQUM5QyxHQUFHMUIsZ0NBQWdDTyxLQUFLO1FBQzFDO1FBQ0FvQixRQUFRO1lBQ04sR0FBR3ZDLGVBQWVPLGNBQWM7WUFDaEMsR0FBSUssZ0NBQWdDMkIsVUFBVSxDQUFDLENBQUM7UUFDbEQ7UUFDQUMsUUFBUTtZQUNOLEdBQUk1QixnQ0FBZ0M0QixVQUFVLENBQUMsQ0FBQztZQUNoREMsb0JBQW9CMUMsV0FBV1csWUFBWTtRQUM3QztRQUNBZ0MsUUFBUTtlQUFLOUIsZ0NBQWdDOEIsVUFBVSxFQUFFO2VBQU9WLG9CQUFvQixFQUFFO1NBQUU7SUFDMUY7SUFFQSxJQUFJLE9BQU96QixjQUFjb0MseUJBQXlCLEVBQUVDLGtCQUFrQixZQUFZO1FBQ2hGVCwwQkFBMEI1QixjQUFjb0MseUJBQXlCLENBQUNDLGFBQWEsQ0FBQztZQUM5RTlCLFlBQVlxQjtRQUNkO0lBQ0Y7SUFFQS9CLHNCQUFzQitCLHlCQUF5QnhCO0lBRS9DLE9BQU93QjtBQUNUIn0=