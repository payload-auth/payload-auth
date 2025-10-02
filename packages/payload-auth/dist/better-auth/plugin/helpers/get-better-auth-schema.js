import { getAuthTables } from "better-auth/db";
import { baModelFieldKeysToFieldNames } from "../constants";
import { getDefaultCollectionSlug } from "./get-collection-slug";
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vaGVscGVycy9nZXQtYmV0dGVyLWF1dGgtc2NoZW1hLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1vZGVsS2V5IH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9nZW5lcmF0ZWQtdHlwZXMnXG5pbXBvcnQgeyBnZXRBdXRoVGFibGVzLCB0eXBlIEZpZWxkQXR0cmlidXRlIH0gZnJvbSAnYmV0dGVyLWF1dGgvZGInXG5pbXBvcnQgeyBiYU1vZGVsRmllbGRLZXlzVG9GaWVsZE5hbWVzIH0gZnJvbSAnLi4vY29uc3RhbnRzJ1xuaW1wb3J0IHsgQmV0dGVyQXV0aFBsdWdpbk9wdGlvbnMsIEJldHRlckF1dGhTY2hlbWFzIH0gZnJvbSAnLi4vdHlwZXMnXG5pbXBvcnQgeyBnZXREZWZhdWx0Q29sbGVjdGlvblNsdWcgfSBmcm9tICcuL2dldC1jb2xsZWN0aW9uLXNsdWcnXG5cbi8qKlxuICogQSBjb25zaXN0ZW50IEJldHRlckF1dGggc2NoZW1hIGdlbmVyYXRvci5cbiAqXG4gKiBEaWZmZXJlbmNlcyBmcm9tIHRoZSBvcmlnaW5hbCBgZ2V0U2NoZW1hYCBpbXBsZW1lbnRhdGlvbiBpbiBCZXR0ZXJBdXRoOlxuICogMS4gS2V5cyBpbiB0aGUgcmV0dXJuZWQgb2JqZWN0IGFyZSBhbHdheXMgdGhlICoqc3RhdGljIHRhYmxlIGlkZW50aWZpZXJzKiogY29taW5nIGZyb21cbiAqICAgIGBnZXRBdXRoVGFibGVzYCwgbmV2ZXIgdGhlIHBvc3NpYmx5LW92ZXJyaWRkZW4gYG1vZGVsTmFtZWAuICBUaGlzIGd1YXJhbnRlZXMgdGhhdFxuICogICAgc3Vic2VxdWVudCBsb29rLXVwcyByZW1haW4gc3RhYmxlIGV2ZW4gaWYgdGhlIHVzZXIgcmVuYW1lcyBjb2xsZWN0aW9ucy5cbiAqIDIuIEVhY2ggc2NoZW1hIGVudHJ5IG5vdyBjb250YWlucyBhbiBleHBsaWNpdCBgbW9kZWxOYW1lYCBwcm9wZXJ0eSBleHBvc2luZyB0aGUgY3VycmVudFxuICogICAgKHBvdGVudGlhbGx5IHVzZXItb3ZlcnJpZGRlbikgbW9kZWwgbmFtZSwgd2hpbGUgYGZpZWxkc2AgY29udGludWUgdG8gYmUgcmVmZXJlbmNlZCBieVxuICogICAgdGhlaXIgc3RhdGljIEJldHRlckF1dGggZmllbGQga2V5cy5cbiAqIDMuIFdoZW4gY29udmVydGluZyBmaWVsZHMsIHdlIHN0b3JlIHRoZW0gdW5kZXIgdGhlaXIgb3JpZ2luYWwga2V5IChgYWN0dWFsRmllbGRzW2tleV0gPSBmaWVsZGApXG4gKiAgICBpbnN0ZWFkIG9mIGBmaWVsZC5maWVsZE5hbWUgfHwga2V5YCB0byBhdm9pZCBhY2NpZGVudGFsIHJlbmFtZXMuXG4gKlxuICogQHBhcmFtIGNvbmZpZyAtIFRoZSBCZXR0ZXJBdXRoIG9wdGlvbnMgZmVkIGludG8gYGdldEF1dGhUYWJsZXNgLlxuICogQHJldHVybnMgQSBtYXAga2V5ZWQgYnkgc3RhdGljIHRhYmxlIGtleXMsIGVhY2ggdmFsdWUgY29udGFpbmluZyBgeyBtb2RlbE5hbWUsIGZpZWxkcywgb3JkZXIgfWAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXREZWZhdWx0QmV0dGVyQXV0aFNjaGVtYShwbHVnaW5PcHRpb25zOiBCZXR0ZXJBdXRoUGx1Z2luT3B0aW9ucyk6IEJldHRlckF1dGhTY2hlbWFzIHtcbiAgY29uc3QgYmV0dGVyQXV0aE9wdGlvbnMgPSBwbHVnaW5PcHRpb25zLmJldHRlckF1dGhPcHRpb25zID8/IHt9XG4gIGNvbnN0IHRhYmxlcyA9IGdldEF1dGhUYWJsZXMoYmV0dGVyQXV0aE9wdGlvbnMpXG5cbiAgY29uc3Qgc2NoZW1hOiBQYXJ0aWFsPEJldHRlckF1dGhTY2hlbWFzPiA9IHt9XG5cbiAgZm9yIChjb25zdCBtb2RlbEtleSBvZiBPYmplY3Qua2V5cyh0YWJsZXMpIGFzIE1vZGVsS2V5W10pIHtcbiAgICBjb25zdCB0YWJsZSA9IHRhYmxlc1ttb2RlbEtleV1cblxuICAgIC8vIFJlc29sdmUgdGhlIGNhbm9uaWNhbCBjb2xsZWN0aW9uIHNsdWcgLyBtb2RlbCBuYW1lIGZvciB0aGlzIGtleVxuICAgIGNvbnN0IHJlc29sdmVkTW9kZWxOYW1lID0gZ2V0RGVmYXVsdENvbGxlY3Rpb25TbHVnKHsgbW9kZWxLZXksIHBsdWdpbk9wdGlvbnMgfSlcblxuICAgIGNvbnN0IGRlZmF1bHRGaWVsZE1hcCA9IChiYU1vZGVsRmllbGRLZXlzVG9GaWVsZE5hbWVzIGFzIFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIHN0cmluZz4+KVttb2RlbEtleV0gPz8ge31cblxuICAgIGNvbnN0IGFjdHVhbEZpZWxkczogUmVjb3JkPHN0cmluZywgRmllbGRBdHRyaWJ1dGU+ID0ge31cblxuICAgIE9iamVjdC5lbnRyaWVzKHRhYmxlLmZpZWxkcykuZm9yRWFjaCgoW2ZpZWxkS2V5LCBmaWVsZFZhbHVlXSkgPT4ge1xuICAgICAgLy8gQnVpbGQgdGhlIGZpZWxkIGVuc3VyaW5nIGEgZmllbGROYW1lIGV4aXN0c1xuICAgICAgY29uc3QgbmV3RmllbGQ6IEZpZWxkQXR0cmlidXRlID0ge1xuICAgICAgICAuLi5maWVsZFZhbHVlLFxuICAgICAgICBmaWVsZE5hbWU6IGRlZmF1bHRGaWVsZE1hcFtmaWVsZEtleV0gPz8gZmllbGRLZXlcbiAgICAgIH1cblxuICAgICAgLy8gUmV3cml0ZSByZWZlcmVuY2VzIHRvIHVzZSB0aGUgcmVzb2x2ZWQgbW9kZWxOYW1lIGZvciB0aGUgdGFyZ2V0IHRhYmxlXG4gICAgICBpZiAoZmllbGRWYWx1ZS5yZWZlcmVuY2VzKSB7XG4gICAgICAgIGNvbnN0IHJlZk1vZGVsS2V5ID0gZmllbGRWYWx1ZS5yZWZlcmVuY2VzLm1vZGVsIGFzIHN0cmluZ1xuICAgICAgICBjb25zdCByZXNvbHZlZFJlZk1vZGVsTmFtZSA9IGdldERlZmF1bHRDb2xsZWN0aW9uU2x1Zyh7IG1vZGVsS2V5OiByZWZNb2RlbEtleSwgcGx1Z2luT3B0aW9ucyB9KVxuICAgICAgICBuZXdGaWVsZC5yZWZlcmVuY2VzID0ge1xuICAgICAgICAgIG1vZGVsOiByZXNvbHZlZFJlZk1vZGVsTmFtZSxcbiAgICAgICAgICBmaWVsZDogZmllbGRWYWx1ZS5yZWZlcmVuY2VzLmZpZWxkXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgYWN0dWFsRmllbGRzW2ZpZWxkS2V5XSA9IG5ld0ZpZWxkXG4gICAgfSlcblxuICAgIGlmIChzY2hlbWFbbW9kZWxLZXldKSB7XG4gICAgICBzY2hlbWFbbW9kZWxLZXldLmZpZWxkcyA9IHtcbiAgICAgICAgLi4uc2NoZW1hW21vZGVsS2V5XS5maWVsZHMsXG4gICAgICAgIC4uLmFjdHVhbEZpZWxkc1xuICAgICAgfVxuICAgICAgY29udGludWVcbiAgICB9XG5cbiAgICBzY2hlbWFbbW9kZWxLZXldID0ge1xuICAgICAgbW9kZWxOYW1lOiByZXNvbHZlZE1vZGVsTmFtZSxcbiAgICAgIGZpZWxkczogYWN0dWFsRmllbGRzLFxuICAgICAgb3JkZXI6IHRhYmxlLm9yZGVyIHx8IEluZmluaXR5XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHNjaGVtYSBhcyBCZXR0ZXJBdXRoU2NoZW1hc1xufVxuIl0sIm5hbWVzIjpbImdldEF1dGhUYWJsZXMiLCJiYU1vZGVsRmllbGRLZXlzVG9GaWVsZE5hbWVzIiwiZ2V0RGVmYXVsdENvbGxlY3Rpb25TbHVnIiwiZ2V0RGVmYXVsdEJldHRlckF1dGhTY2hlbWEiLCJwbHVnaW5PcHRpb25zIiwiYmV0dGVyQXV0aE9wdGlvbnMiLCJ0YWJsZXMiLCJzY2hlbWEiLCJtb2RlbEtleSIsIk9iamVjdCIsImtleXMiLCJ0YWJsZSIsInJlc29sdmVkTW9kZWxOYW1lIiwiZGVmYXVsdEZpZWxkTWFwIiwiYWN0dWFsRmllbGRzIiwiZW50cmllcyIsImZpZWxkcyIsImZvckVhY2giLCJmaWVsZEtleSIsImZpZWxkVmFsdWUiLCJuZXdGaWVsZCIsImZpZWxkTmFtZSIsInJlZmVyZW5jZXMiLCJyZWZNb2RlbEtleSIsIm1vZGVsIiwicmVzb2x2ZWRSZWZNb2RlbE5hbWUiLCJmaWVsZCIsIm1vZGVsTmFtZSIsIm9yZGVyIiwiSW5maW5pdHkiXSwibWFwcGluZ3MiOiJBQUNBLFNBQVNBLGFBQWEsUUFBNkIsaUJBQWdCO0FBQ25FLFNBQVNDLDRCQUE0QixRQUFRLGVBQWM7QUFFM0QsU0FBU0Msd0JBQXdCLFFBQVEsd0JBQXVCO0FBRWhFOzs7Ozs7Ozs7Ozs7Ozs7Q0FlQyxHQUNELE9BQU8sU0FBU0MsMkJBQTJCQyxhQUFzQztJQUMvRSxNQUFNQyxvQkFBb0JELGNBQWNDLGlCQUFpQixJQUFJLENBQUM7SUFDOUQsTUFBTUMsU0FBU04sY0FBY0s7SUFFN0IsTUFBTUUsU0FBcUMsQ0FBQztJQUU1QyxLQUFLLE1BQU1DLFlBQVlDLE9BQU9DLElBQUksQ0FBQ0osUUFBdUI7UUFDeEQsTUFBTUssUUFBUUwsTUFBTSxDQUFDRSxTQUFTO1FBRTlCLGtFQUFrRTtRQUNsRSxNQUFNSSxvQkFBb0JWLHlCQUF5QjtZQUFFTTtZQUFVSjtRQUFjO1FBRTdFLE1BQU1TLGtCQUFrQixBQUFDWiw0QkFBdUUsQ0FBQ08sU0FBUyxJQUFJLENBQUM7UUFFL0csTUFBTU0sZUFBK0MsQ0FBQztRQUV0REwsT0FBT00sT0FBTyxDQUFDSixNQUFNSyxNQUFNLEVBQUVDLE9BQU8sQ0FBQyxDQUFDLENBQUNDLFVBQVVDLFdBQVc7WUFDMUQsOENBQThDO1lBQzlDLE1BQU1DLFdBQTJCO2dCQUMvQixHQUFHRCxVQUFVO2dCQUNiRSxXQUFXUixlQUFlLENBQUNLLFNBQVMsSUFBSUE7WUFDMUM7WUFFQSx3RUFBd0U7WUFDeEUsSUFBSUMsV0FBV0csVUFBVSxFQUFFO2dCQUN6QixNQUFNQyxjQUFjSixXQUFXRyxVQUFVLENBQUNFLEtBQUs7Z0JBQy9DLE1BQU1DLHVCQUF1QnZCLHlCQUF5QjtvQkFBRU0sVUFBVWU7b0JBQWFuQjtnQkFBYztnQkFDN0ZnQixTQUFTRSxVQUFVLEdBQUc7b0JBQ3BCRSxPQUFPQztvQkFDUEMsT0FBT1AsV0FBV0csVUFBVSxDQUFDSSxLQUFLO2dCQUNwQztZQUNGO1lBRUFaLFlBQVksQ0FBQ0ksU0FBUyxHQUFHRTtRQUMzQjtRQUVBLElBQUliLE1BQU0sQ0FBQ0MsU0FBUyxFQUFFO1lBQ3BCRCxNQUFNLENBQUNDLFNBQVMsQ0FBQ1EsTUFBTSxHQUFHO2dCQUN4QixHQUFHVCxNQUFNLENBQUNDLFNBQVMsQ0FBQ1EsTUFBTTtnQkFDMUIsR0FBR0YsWUFBWTtZQUNqQjtZQUNBO1FBQ0Y7UUFFQVAsTUFBTSxDQUFDQyxTQUFTLEdBQUc7WUFDakJtQixXQUFXZjtZQUNYSSxRQUFRRjtZQUNSYyxPQUFPakIsTUFBTWlCLEtBQUssSUFBSUM7UUFDeEI7SUFDRjtJQUVBLE9BQU90QjtBQUNUIn0=