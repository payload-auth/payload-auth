import { getAuthTables } from "better-auth/db";
import { baModelFieldKeysToFieldNames, baModelKey, defaults } from "../constants";
import { getDefaultCollectionSlug } from "./get-collection-slug";
import { set } from "../utils/set";
/**
 * A consistent BetterAuth schema generator.
 *
 * Differences from the original `getSchema` implementation in BetterAuth:
 * 1. Keys in the returned object are always the **static table identifiers** coming from
 *    `getAuthTables`, never the possibly-overridden `modelName`.  This guarantees that
 *    subsequent look-ups remain stable even if the user renames collections.
 * 2. Each schema entry now contains an explicit `modelName` property exposing the current
 *    (potentially user-overridden) model name, while `fields` continue to be referenced by
 *    their static BetterAuth field keys.
 * 3. When converting fields, we store them under their original key (`actualFields[key] = field`)
 *    instead of `field.fieldName || key` to avoid accidental renames.
 *
 * @param config - The BetterAuth options fed into `getAuthTables`.
 * @returns A map keyed by static table keys, each value containing `{ modelName, fields, order }`.
 */ export function getDefaultBetterAuthSchema(pluginOptions) {
    const betterAuthOptions = pluginOptions.betterAuthOptions ?? {};
    // We need to add the additional role field to the user schema here or else the built collections will not pick it up.
    set(betterAuthOptions, `${baModelKey.user}.additionalFields.role`, {
        type: 'string',
        defaultValue: pluginOptions.users?.defaultRole || defaults.userRole,
        input: false
    });
    const tables = getAuthTables(betterAuthOptions);
    const schema = {};
    for (const modelKey of Object.keys(tables)){
        const table = tables[modelKey];
        // Resolve the canonical collection slug / model name for this key
        const resolvedModelName = getDefaultCollectionSlug({
            modelKey,
            pluginOptions
        });
        const defaultFieldMap = baModelFieldKeysToFieldNames[modelKey] ?? {};
        const actualFields = {};
        Object.entries(table.fields).forEach(([fieldKey, fieldValue])=>{
            // Build the field ensuring a fieldName exists
            const newField = {
                ...fieldValue,
                fieldName: defaultFieldMap[fieldKey] ?? fieldKey
            };
            // Rewrite references to use the resolved modelName for the target table
            if (fieldValue.references) {
                const refModelKey = fieldValue.references.model;
                const resolvedRefModelName = getDefaultCollectionSlug({
                    modelKey: refModelKey,
                    pluginOptions
                });
                newField.references = {
                    model: resolvedRefModelName,
                    field: fieldValue.references.field
                };
            }
            actualFields[fieldKey] = newField;
        });
        if (schema[modelKey]) {
            schema[modelKey].fields = {
                ...schema[modelKey].fields,
                ...actualFields
            };
            continue;
        }
        schema[modelKey] = {
            modelName: resolvedModelName,
            fields: actualFields,
            order: table.order || Infinity
        };
    }
    return schema;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vaGVscGVycy9nZXQtYmV0dGVyLWF1dGgtc2NoZW1hLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1vZGVsS2V5IH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9nZW5lcmF0ZWQtdHlwZXMnXG5pbXBvcnQgeyB0eXBlIERCRmllbGRBdHRyaWJ1dGUsIGdldEF1dGhUYWJsZXMgfSBmcm9tICdiZXR0ZXItYXV0aC9kYidcbmltcG9ydCB7IGJhTW9kZWxGaWVsZEtleXNUb0ZpZWxkTmFtZXMsIGJhTW9kZWxLZXksIGRlZmF1bHRzIH0gZnJvbSAnLi4vY29uc3RhbnRzJ1xuaW1wb3J0IHsgQmV0dGVyQXV0aFBsdWdpbk9wdGlvbnMsIEJldHRlckF1dGhTY2hlbWFzIH0gZnJvbSAnLi4vdHlwZXMnXG5pbXBvcnQgeyBnZXREZWZhdWx0Q29sbGVjdGlvblNsdWcgfSBmcm9tICcuL2dldC1jb2xsZWN0aW9uLXNsdWcnXG5pbXBvcnQgeyBzZXQgfSBmcm9tICcuLi91dGlscy9zZXQnXG5cbi8qKlxuICogQSBjb25zaXN0ZW50IEJldHRlckF1dGggc2NoZW1hIGdlbmVyYXRvci5cbiAqXG4gKiBEaWZmZXJlbmNlcyBmcm9tIHRoZSBvcmlnaW5hbCBgZ2V0U2NoZW1hYCBpbXBsZW1lbnRhdGlvbiBpbiBCZXR0ZXJBdXRoOlxuICogMS4gS2V5cyBpbiB0aGUgcmV0dXJuZWQgb2JqZWN0IGFyZSBhbHdheXMgdGhlICoqc3RhdGljIHRhYmxlIGlkZW50aWZpZXJzKiogY29taW5nIGZyb21cbiAqICAgIGBnZXRBdXRoVGFibGVzYCwgbmV2ZXIgdGhlIHBvc3NpYmx5LW92ZXJyaWRkZW4gYG1vZGVsTmFtZWAuICBUaGlzIGd1YXJhbnRlZXMgdGhhdFxuICogICAgc3Vic2VxdWVudCBsb29rLXVwcyByZW1haW4gc3RhYmxlIGV2ZW4gaWYgdGhlIHVzZXIgcmVuYW1lcyBjb2xsZWN0aW9ucy5cbiAqIDIuIEVhY2ggc2NoZW1hIGVudHJ5IG5vdyBjb250YWlucyBhbiBleHBsaWNpdCBgbW9kZWxOYW1lYCBwcm9wZXJ0eSBleHBvc2luZyB0aGUgY3VycmVudFxuICogICAgKHBvdGVudGlhbGx5IHVzZXItb3ZlcnJpZGRlbikgbW9kZWwgbmFtZSwgd2hpbGUgYGZpZWxkc2AgY29udGludWUgdG8gYmUgcmVmZXJlbmNlZCBieVxuICogICAgdGhlaXIgc3RhdGljIEJldHRlckF1dGggZmllbGQga2V5cy5cbiAqIDMuIFdoZW4gY29udmVydGluZyBmaWVsZHMsIHdlIHN0b3JlIHRoZW0gdW5kZXIgdGhlaXIgb3JpZ2luYWwga2V5IChgYWN0dWFsRmllbGRzW2tleV0gPSBmaWVsZGApXG4gKiAgICBpbnN0ZWFkIG9mIGBmaWVsZC5maWVsZE5hbWUgfHwga2V5YCB0byBhdm9pZCBhY2NpZGVudGFsIHJlbmFtZXMuXG4gKlxuICogQHBhcmFtIGNvbmZpZyAtIFRoZSBCZXR0ZXJBdXRoIG9wdGlvbnMgZmVkIGludG8gYGdldEF1dGhUYWJsZXNgLlxuICogQHJldHVybnMgQSBtYXAga2V5ZWQgYnkgc3RhdGljIHRhYmxlIGtleXMsIGVhY2ggdmFsdWUgY29udGFpbmluZyBgeyBtb2RlbE5hbWUsIGZpZWxkcywgb3JkZXIgfWAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXREZWZhdWx0QmV0dGVyQXV0aFNjaGVtYShwbHVnaW5PcHRpb25zOiBCZXR0ZXJBdXRoUGx1Z2luT3B0aW9ucyk6IEJldHRlckF1dGhTY2hlbWFzIHtcbiAgY29uc3QgYmV0dGVyQXV0aE9wdGlvbnMgPSBwbHVnaW5PcHRpb25zLmJldHRlckF1dGhPcHRpb25zID8/IHt9XG5cbiAgLy8gV2UgbmVlZCB0byBhZGQgdGhlIGFkZGl0aW9uYWwgcm9sZSBmaWVsZCB0byB0aGUgdXNlciBzY2hlbWEgaGVyZSBvciBlbHNlIHRoZSBidWlsdCBjb2xsZWN0aW9ucyB3aWxsIG5vdCBwaWNrIGl0IHVwLlxuICBzZXQoYmV0dGVyQXV0aE9wdGlvbnMgYXMgYW55LCBgJHtiYU1vZGVsS2V5LnVzZXJ9LmFkZGl0aW9uYWxGaWVsZHMucm9sZWAsIHtcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBkZWZhdWx0VmFsdWU6IHBsdWdpbk9wdGlvbnMudXNlcnM/LmRlZmF1bHRSb2xlIHx8IGRlZmF1bHRzLnVzZXJSb2xlLFxuICAgIGlucHV0OiBmYWxzZSxcbiAgfSlcblxuICBjb25zdCB0YWJsZXMgPSBnZXRBdXRoVGFibGVzKGJldHRlckF1dGhPcHRpb25zKVxuXG4gIGNvbnN0IHNjaGVtYTogUGFydGlhbDxCZXR0ZXJBdXRoU2NoZW1hcz4gPSB7fVxuXG4gIGZvciAoY29uc3QgbW9kZWxLZXkgb2YgT2JqZWN0LmtleXModGFibGVzKSBhcyBNb2RlbEtleVtdKSB7XG4gICAgY29uc3QgdGFibGUgPSB0YWJsZXNbbW9kZWxLZXldXG5cbiAgICAvLyBSZXNvbHZlIHRoZSBjYW5vbmljYWwgY29sbGVjdGlvbiBzbHVnIC8gbW9kZWwgbmFtZSBmb3IgdGhpcyBrZXlcbiAgICBjb25zdCByZXNvbHZlZE1vZGVsTmFtZSA9IGdldERlZmF1bHRDb2xsZWN0aW9uU2x1Zyh7IG1vZGVsS2V5LCBwbHVnaW5PcHRpb25zIH0pXG5cbiAgICBjb25zdCBkZWZhdWx0RmllbGRNYXAgPSAoYmFNb2RlbEZpZWxkS2V5c1RvRmllbGROYW1lcyBhcyBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+PilbbW9kZWxLZXldID8/IHt9XG5cbiAgICBjb25zdCBhY3R1YWxGaWVsZHM6IFJlY29yZDxzdHJpbmcsIERCRmllbGRBdHRyaWJ1dGU+ID0ge31cblxuICAgIE9iamVjdC5lbnRyaWVzKHRhYmxlLmZpZWxkcykuZm9yRWFjaCgoW2ZpZWxkS2V5LCBmaWVsZFZhbHVlXSkgPT4ge1xuICAgICAgLy8gQnVpbGQgdGhlIGZpZWxkIGVuc3VyaW5nIGEgZmllbGROYW1lIGV4aXN0c1xuICAgICAgY29uc3QgbmV3RmllbGQ6IERCRmllbGRBdHRyaWJ1dGUgPSB7XG4gICAgICAgIC4uLmZpZWxkVmFsdWUsXG4gICAgICAgIGZpZWxkTmFtZTogZGVmYXVsdEZpZWxkTWFwW2ZpZWxkS2V5XSA/PyBmaWVsZEtleVxuICAgICAgfVxuXG4gICAgICAvLyBSZXdyaXRlIHJlZmVyZW5jZXMgdG8gdXNlIHRoZSByZXNvbHZlZCBtb2RlbE5hbWUgZm9yIHRoZSB0YXJnZXQgdGFibGVcbiAgICAgIGlmIChmaWVsZFZhbHVlLnJlZmVyZW5jZXMpIHtcbiAgICAgICAgY29uc3QgcmVmTW9kZWxLZXkgPSBmaWVsZFZhbHVlLnJlZmVyZW5jZXMubW9kZWwgYXMgc3RyaW5nXG4gICAgICAgIGNvbnN0IHJlc29sdmVkUmVmTW9kZWxOYW1lID0gZ2V0RGVmYXVsdENvbGxlY3Rpb25TbHVnKHsgbW9kZWxLZXk6IHJlZk1vZGVsS2V5LCBwbHVnaW5PcHRpb25zIH0pXG4gICAgICAgIG5ld0ZpZWxkLnJlZmVyZW5jZXMgPSB7XG4gICAgICAgICAgbW9kZWw6IHJlc29sdmVkUmVmTW9kZWxOYW1lLFxuICAgICAgICAgIGZpZWxkOiBmaWVsZFZhbHVlLnJlZmVyZW5jZXMuZmllbGRcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBhY3R1YWxGaWVsZHNbZmllbGRLZXldID0gbmV3RmllbGRcbiAgICB9KVxuXG4gICAgaWYgKHNjaGVtYVttb2RlbEtleV0pIHtcbiAgICAgIHNjaGVtYVttb2RlbEtleV0uZmllbGRzID0ge1xuICAgICAgICAuLi5zY2hlbWFbbW9kZWxLZXldLmZpZWxkcyxcbiAgICAgICAgLi4uYWN0dWFsRmllbGRzXG4gICAgICB9XG4gICAgICBjb250aW51ZVxuICAgIH1cblxuICAgIHNjaGVtYVttb2RlbEtleV0gPSB7XG4gICAgICBtb2RlbE5hbWU6IHJlc29sdmVkTW9kZWxOYW1lLFxuICAgICAgZmllbGRzOiBhY3R1YWxGaWVsZHMsXG4gICAgICBvcmRlcjogdGFibGUub3JkZXIgfHwgSW5maW5pdHlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc2NoZW1hIGFzIEJldHRlckF1dGhTY2hlbWFzXG59XG4iXSwibmFtZXMiOlsiZ2V0QXV0aFRhYmxlcyIsImJhTW9kZWxGaWVsZEtleXNUb0ZpZWxkTmFtZXMiLCJiYU1vZGVsS2V5IiwiZGVmYXVsdHMiLCJnZXREZWZhdWx0Q29sbGVjdGlvblNsdWciLCJzZXQiLCJnZXREZWZhdWx0QmV0dGVyQXV0aFNjaGVtYSIsInBsdWdpbk9wdGlvbnMiLCJiZXR0ZXJBdXRoT3B0aW9ucyIsInVzZXIiLCJ0eXBlIiwiZGVmYXVsdFZhbHVlIiwidXNlcnMiLCJkZWZhdWx0Um9sZSIsInVzZXJSb2xlIiwiaW5wdXQiLCJ0YWJsZXMiLCJzY2hlbWEiLCJtb2RlbEtleSIsIk9iamVjdCIsImtleXMiLCJ0YWJsZSIsInJlc29sdmVkTW9kZWxOYW1lIiwiZGVmYXVsdEZpZWxkTWFwIiwiYWN0dWFsRmllbGRzIiwiZW50cmllcyIsImZpZWxkcyIsImZvckVhY2giLCJmaWVsZEtleSIsImZpZWxkVmFsdWUiLCJuZXdGaWVsZCIsImZpZWxkTmFtZSIsInJlZmVyZW5jZXMiLCJyZWZNb2RlbEtleSIsIm1vZGVsIiwicmVzb2x2ZWRSZWZNb2RlbE5hbWUiLCJmaWVsZCIsIm1vZGVsTmFtZSIsIm9yZGVyIiwiSW5maW5pdHkiXSwibWFwcGluZ3MiOiJBQUNBLFNBQWdDQSxhQUFhLFFBQVEsaUJBQWdCO0FBQ3JFLFNBQVNDLDRCQUE0QixFQUFFQyxVQUFVLEVBQUVDLFFBQVEsUUFBUSxlQUFjO0FBRWpGLFNBQVNDLHdCQUF3QixRQUFRLHdCQUF1QjtBQUNoRSxTQUFTQyxHQUFHLFFBQVEsZUFBYztBQUVsQzs7Ozs7Ozs7Ozs7Ozs7O0NBZUMsR0FDRCxPQUFPLFNBQVNDLDJCQUEyQkMsYUFBc0M7SUFDL0UsTUFBTUMsb0JBQW9CRCxjQUFjQyxpQkFBaUIsSUFBSSxDQUFDO0lBRTlELHNIQUFzSDtJQUN0SEgsSUFBSUcsbUJBQTBCLEdBQUdOLFdBQVdPLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFO1FBQ3hFQyxNQUFNO1FBQ05DLGNBQWNKLGNBQWNLLEtBQUssRUFBRUMsZUFBZVYsU0FBU1csUUFBUTtRQUNuRUMsT0FBTztJQUNUO0lBRUEsTUFBTUMsU0FBU2hCLGNBQWNRO0lBRTdCLE1BQU1TLFNBQXFDLENBQUM7SUFFNUMsS0FBSyxNQUFNQyxZQUFZQyxPQUFPQyxJQUFJLENBQUNKLFFBQXVCO1FBQ3hELE1BQU1LLFFBQVFMLE1BQU0sQ0FBQ0UsU0FBUztRQUU5QixrRUFBa0U7UUFDbEUsTUFBTUksb0JBQW9CbEIseUJBQXlCO1lBQUVjO1lBQVVYO1FBQWM7UUFFN0UsTUFBTWdCLGtCQUFrQixBQUFDdEIsNEJBQXVFLENBQUNpQixTQUFTLElBQUksQ0FBQztRQUUvRyxNQUFNTSxlQUFpRCxDQUFDO1FBRXhETCxPQUFPTSxPQUFPLENBQUNKLE1BQU1LLE1BQU0sRUFBRUMsT0FBTyxDQUFDLENBQUMsQ0FBQ0MsVUFBVUMsV0FBVztZQUMxRCw4Q0FBOEM7WUFDOUMsTUFBTUMsV0FBNkI7Z0JBQ2pDLEdBQUdELFVBQVU7Z0JBQ2JFLFdBQVdSLGVBQWUsQ0FBQ0ssU0FBUyxJQUFJQTtZQUMxQztZQUVBLHdFQUF3RTtZQUN4RSxJQUFJQyxXQUFXRyxVQUFVLEVBQUU7Z0JBQ3pCLE1BQU1DLGNBQWNKLFdBQVdHLFVBQVUsQ0FBQ0UsS0FBSztnQkFDL0MsTUFBTUMsdUJBQXVCL0IseUJBQXlCO29CQUFFYyxVQUFVZTtvQkFBYTFCO2dCQUFjO2dCQUM3RnVCLFNBQVNFLFVBQVUsR0FBRztvQkFDcEJFLE9BQU9DO29CQUNQQyxPQUFPUCxXQUFXRyxVQUFVLENBQUNJLEtBQUs7Z0JBQ3BDO1lBQ0Y7WUFFQVosWUFBWSxDQUFDSSxTQUFTLEdBQUdFO1FBQzNCO1FBRUEsSUFBSWIsTUFBTSxDQUFDQyxTQUFTLEVBQUU7WUFDcEJELE1BQU0sQ0FBQ0MsU0FBUyxDQUFDUSxNQUFNLEdBQUc7Z0JBQ3hCLEdBQUdULE1BQU0sQ0FBQ0MsU0FBUyxDQUFDUSxNQUFNO2dCQUMxQixHQUFHRixZQUFZO1lBQ2pCO1lBQ0E7UUFDRjtRQUVBUCxNQUFNLENBQUNDLFNBQVMsR0FBRztZQUNqQm1CLFdBQVdmO1lBQ1hJLFFBQVFGO1lBQ1JjLE9BQU9qQixNQUFNaUIsS0FBSyxJQUFJQztRQUN4QjtJQUNGO0lBRUEsT0FBT3RCO0FBQ1QifQ==