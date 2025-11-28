/**
 * Syncs a BetterAuth `ResolvedSchema` object with the *actual* collection
 * definitions created by this plugin.
 *
 * This must run **after** the first call to `buildCollections`, because only
 * then do we know the user-overridden slugs / field names.  The algorithm is
 * kept deliberately simple:
 *
 *  1. Build a `modelKey → newSlug` map from each collection's
 *     `custom.betterAuthModelKey` property.
 *  2. Update `schema.modelName` for all affected tables.
 *  3. Rewrite `references.model` in *every* table field according to the new
 *     slugs.  We do this in a dedicated pass so referencing tables no longer
 *     depend on the original slugs.
 *  4. Finally, iterate collections once more to apply any *field* renames via
 *     the `custom.betterAuthFieldKey` property.
 */ export function syncResolvedSchemaWithCollectionMap(resolvedSchemas, collectionMap) {
    const collections = Object.values(collectionMap);
    // Helper to update references across the whole schema
    const updateReferences = (oldSlug, newSlug)=>{
        for (const schema of Object.values(resolvedSchemas)){
            for (const fieldAttr of Object.values(schema.fields)){
                const ref = fieldAttr.references;
                if (ref?.model === oldSlug) {
                    ref.model = newSlug;
                }
            }
        }
    };
    for (const [modelKey, schema] of Object.entries(resolvedSchemas)){
        // Find the collection corresponding to this BetterAuth model
        const collection = collections.find((c)=>c.custom?.betterAuthModelKey === modelKey);
        if (!collection) {
            console.error(`Collection not found for model key: ${modelKey}`);
            continue;
        }
        // ───── Sync slug ─────────────────────────────────────────────────────────
        const oldSlug = schema.modelName;
        const newSlug = collection.slug;
        if (oldSlug !== newSlug) {
            // First, rewrite *all* references that still point to the old slug
            updateReferences(oldSlug, newSlug);
            // Now store the new slug on the schema itself
            schema.modelName = newSlug;
        }
        // ───── Sync field names ───────────────────────────────────────────────────
        const collectionFields = Array.isArray(collection.fields) ? collection.fields : [];
        for (const [fieldKey, schemaField] of Object.entries(schema.fields)){
            const matchingField = collectionFields.find((f)=>f.custom?.betterAuthFieldKey === fieldKey);
            if (!matchingField) {
                console.error(`Field not found for key "${fieldKey}" in collection "${collection.slug}"`);
                continue;
            }
            const newName = matchingField.name;
            if (newName && schemaField.fieldName !== newName) {
                schemaField.fieldName = newName;
            }
        }
    }
    return resolvedSchemas;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vaGVscGVycy9zeW5jLXJlc29sdmVkLXNjaGVtYS13aXRoLWNvbGxlY3Rpb24tbWFwLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgQ29sbGVjdGlvbkNvbmZpZyB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgdHlwZSB7IE1vZGVsS2V5IH0gZnJvbSAnLi4vLi4vZ2VuZXJhdGVkLXR5cGVzJ1xuaW1wb3J0IHR5cGUgeyBCZXR0ZXJBdXRoU2NoZW1hcywgRmllbGRXaXRoSWRzIH0gZnJvbSAnLi4vdHlwZXMnXG5cbi8qKlxuICogU3luY3MgYSBCZXR0ZXJBdXRoIGBSZXNvbHZlZFNjaGVtYWAgb2JqZWN0IHdpdGggdGhlICphY3R1YWwqIGNvbGxlY3Rpb25cbiAqIGRlZmluaXRpb25zIGNyZWF0ZWQgYnkgdGhpcyBwbHVnaW4uXG4gKlxuICogVGhpcyBtdXN0IHJ1biAqKmFmdGVyKiogdGhlIGZpcnN0IGNhbGwgdG8gYGJ1aWxkQ29sbGVjdGlvbnNgLCBiZWNhdXNlIG9ubHlcbiAqIHRoZW4gZG8gd2Uga25vdyB0aGUgdXNlci1vdmVycmlkZGVuIHNsdWdzIC8gZmllbGQgbmFtZXMuICBUaGUgYWxnb3JpdGhtIGlzXG4gKiBrZXB0IGRlbGliZXJhdGVseSBzaW1wbGU6XG4gKlxuICogIDEuIEJ1aWxkIGEgYG1vZGVsS2V5IOKGkiBuZXdTbHVnYCBtYXAgZnJvbSBlYWNoIGNvbGxlY3Rpb24nc1xuICogICAgIGBjdXN0b20uYmV0dGVyQXV0aE1vZGVsS2V5YCBwcm9wZXJ0eS5cbiAqICAyLiBVcGRhdGUgYHNjaGVtYS5tb2RlbE5hbWVgIGZvciBhbGwgYWZmZWN0ZWQgdGFibGVzLlxuICogIDMuIFJld3JpdGUgYHJlZmVyZW5jZXMubW9kZWxgIGluICpldmVyeSogdGFibGUgZmllbGQgYWNjb3JkaW5nIHRvIHRoZSBuZXdcbiAqICAgICBzbHVncy4gIFdlIGRvIHRoaXMgaW4gYSBkZWRpY2F0ZWQgcGFzcyBzbyByZWZlcmVuY2luZyB0YWJsZXMgbm8gbG9uZ2VyXG4gKiAgICAgZGVwZW5kIG9uIHRoZSBvcmlnaW5hbCBzbHVncy5cbiAqICA0LiBGaW5hbGx5LCBpdGVyYXRlIGNvbGxlY3Rpb25zIG9uY2UgbW9yZSB0byBhcHBseSBhbnkgKmZpZWxkKiByZW5hbWVzIHZpYVxuICogICAgIHRoZSBgY3VzdG9tLmJldHRlckF1dGhGaWVsZEtleWAgcHJvcGVydHkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzeW5jUmVzb2x2ZWRTY2hlbWFXaXRoQ29sbGVjdGlvbk1hcChcbiAgcmVzb2x2ZWRTY2hlbWFzOiBCZXR0ZXJBdXRoU2NoZW1hcyxcbiAgY29sbGVjdGlvbk1hcDogUmVjb3JkPHN0cmluZywgQ29sbGVjdGlvbkNvbmZpZz5cbik6IEJldHRlckF1dGhTY2hlbWFzIHtcbiAgY29uc3QgY29sbGVjdGlvbnMgPSBPYmplY3QudmFsdWVzKGNvbGxlY3Rpb25NYXApXG5cbiAgLy8gSGVscGVyIHRvIHVwZGF0ZSByZWZlcmVuY2VzIGFjcm9zcyB0aGUgd2hvbGUgc2NoZW1hXG4gIGNvbnN0IHVwZGF0ZVJlZmVyZW5jZXMgPSAob2xkU2x1Zzogc3RyaW5nLCBuZXdTbHVnOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICBmb3IgKGNvbnN0IHNjaGVtYSBvZiBPYmplY3QudmFsdWVzKHJlc29sdmVkU2NoZW1hcykpIHtcbiAgICAgIGZvciAoY29uc3QgZmllbGRBdHRyIG9mIE9iamVjdC52YWx1ZXMoc2NoZW1hLmZpZWxkcykpIHtcbiAgICAgICAgY29uc3QgcmVmID0gKGZpZWxkQXR0ciBhcyBhbnkpLnJlZmVyZW5jZXNcbiAgICAgICAgaWYgKHJlZj8ubW9kZWwgPT09IG9sZFNsdWcpIHtcbiAgICAgICAgICByZWYubW9kZWwgPSBuZXdTbHVnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmb3IgKGNvbnN0IFttb2RlbEtleSwgc2NoZW1hXSBvZiBPYmplY3QuZW50cmllcyhyZXNvbHZlZFNjaGVtYXMpIGFzIFtNb2RlbEtleSwgKHR5cGVvZiByZXNvbHZlZFNjaGVtYXMpW01vZGVsS2V5XV1bXSkge1xuICAgIC8vIEZpbmQgdGhlIGNvbGxlY3Rpb24gY29ycmVzcG9uZGluZyB0byB0aGlzIEJldHRlckF1dGggbW9kZWxcbiAgICBjb25zdCBjb2xsZWN0aW9uID0gY29sbGVjdGlvbnMuZmluZCgoYykgPT4gKGMuY3VzdG9tIGFzIGFueSk/LmJldHRlckF1dGhNb2RlbEtleSA9PT0gbW9kZWxLZXkpXG4gICAgaWYgKCFjb2xsZWN0aW9uKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBDb2xsZWN0aW9uIG5vdCBmb3VuZCBmb3IgbW9kZWwga2V5OiAke21vZGVsS2V5fWApXG4gICAgICBjb250aW51ZVxuICAgIH1cblxuICAgIC8vIOKUgOKUgOKUgOKUgOKUgCBTeW5jIHNsdWcg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4gICAgY29uc3Qgb2xkU2x1ZyA9IHNjaGVtYS5tb2RlbE5hbWVcbiAgICBjb25zdCBuZXdTbHVnID0gY29sbGVjdGlvbi5zbHVnXG5cbiAgICBpZiAob2xkU2x1ZyAhPT0gbmV3U2x1Zykge1xuICAgICAgLy8gRmlyc3QsIHJld3JpdGUgKmFsbCogcmVmZXJlbmNlcyB0aGF0IHN0aWxsIHBvaW50IHRvIHRoZSBvbGQgc2x1Z1xuICAgICAgdXBkYXRlUmVmZXJlbmNlcyhvbGRTbHVnLCBuZXdTbHVnKVxuXG4gICAgICAvLyBOb3cgc3RvcmUgdGhlIG5ldyBzbHVnIG9uIHRoZSBzY2hlbWEgaXRzZWxmXG4gICAgICBzY2hlbWEubW9kZWxOYW1lID0gbmV3U2x1Z1xuICAgIH1cblxuICAgIC8vIOKUgOKUgOKUgOKUgOKUgCBTeW5jIGZpZWxkIG5hbWVzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuICAgIGNvbnN0IGNvbGxlY3Rpb25GaWVsZHM6IEZpZWxkV2l0aElkc1tdID0gQXJyYXkuaXNBcnJheShjb2xsZWN0aW9uLmZpZWxkcykgPyAoY29sbGVjdGlvbi5maWVsZHMgYXMgRmllbGRXaXRoSWRzW10pIDogW11cblxuICAgIGZvciAoY29uc3QgW2ZpZWxkS2V5LCBzY2hlbWFGaWVsZF0gb2YgT2JqZWN0LmVudHJpZXMoc2NoZW1hLmZpZWxkcykpIHtcbiAgICAgIGNvbnN0IG1hdGNoaW5nRmllbGQgPSBjb2xsZWN0aW9uRmllbGRzLmZpbmQoKGYpID0+IGYuY3VzdG9tPy5iZXR0ZXJBdXRoRmllbGRLZXkgPT09IGZpZWxkS2V5KVxuXG4gICAgICBpZiAoIW1hdGNoaW5nRmllbGQpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgRmllbGQgbm90IGZvdW5kIGZvciBrZXkgXCIke2ZpZWxkS2V5fVwiIGluIGNvbGxlY3Rpb24gXCIke2NvbGxlY3Rpb24uc2x1Z31cImApXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG5ld05hbWUgPSBtYXRjaGluZ0ZpZWxkLm5hbWVcbiAgICAgIGlmIChuZXdOYW1lICYmIHNjaGVtYUZpZWxkLmZpZWxkTmFtZSAhPT0gbmV3TmFtZSkge1xuICAgICAgICBzY2hlbWFGaWVsZC5maWVsZE5hbWUgPSBuZXdOYW1lXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc29sdmVkU2NoZW1hc1xufVxuIl0sIm5hbWVzIjpbInN5bmNSZXNvbHZlZFNjaGVtYVdpdGhDb2xsZWN0aW9uTWFwIiwicmVzb2x2ZWRTY2hlbWFzIiwiY29sbGVjdGlvbk1hcCIsImNvbGxlY3Rpb25zIiwiT2JqZWN0IiwidmFsdWVzIiwidXBkYXRlUmVmZXJlbmNlcyIsIm9sZFNsdWciLCJuZXdTbHVnIiwic2NoZW1hIiwiZmllbGRBdHRyIiwiZmllbGRzIiwicmVmIiwicmVmZXJlbmNlcyIsIm1vZGVsIiwibW9kZWxLZXkiLCJlbnRyaWVzIiwiY29sbGVjdGlvbiIsImZpbmQiLCJjIiwiY3VzdG9tIiwiYmV0dGVyQXV0aE1vZGVsS2V5IiwiY29uc29sZSIsImVycm9yIiwibW9kZWxOYW1lIiwic2x1ZyIsImNvbGxlY3Rpb25GaWVsZHMiLCJBcnJheSIsImlzQXJyYXkiLCJmaWVsZEtleSIsInNjaGVtYUZpZWxkIiwibWF0Y2hpbmdGaWVsZCIsImYiLCJiZXR0ZXJBdXRoRmllbGRLZXkiLCJuZXdOYW1lIiwibmFtZSIsImZpZWxkTmFtZSJdLCJtYXBwaW5ncyI6IkFBSUE7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FnQkMsR0FDRCxPQUFPLFNBQVNBLG9DQUNkQyxlQUFrQyxFQUNsQ0MsYUFBK0M7SUFFL0MsTUFBTUMsY0FBY0MsT0FBT0MsTUFBTSxDQUFDSDtJQUVsQyxzREFBc0Q7SUFDdEQsTUFBTUksbUJBQW1CLENBQUNDLFNBQWlCQztRQUN6QyxLQUFLLE1BQU1DLFVBQVVMLE9BQU9DLE1BQU0sQ0FBQ0osaUJBQWtCO1lBQ25ELEtBQUssTUFBTVMsYUFBYU4sT0FBT0MsTUFBTSxDQUFDSSxPQUFPRSxNQUFNLEVBQUc7Z0JBQ3BELE1BQU1DLE1BQU0sQUFBQ0YsVUFBa0JHLFVBQVU7Z0JBQ3pDLElBQUlELEtBQUtFLFVBQVVQLFNBQVM7b0JBQzFCSyxJQUFJRSxLQUFLLEdBQUdOO2dCQUNkO1lBQ0Y7UUFDRjtJQUNGO0lBRUEsS0FBSyxNQUFNLENBQUNPLFVBQVVOLE9BQU8sSUFBSUwsT0FBT1ksT0FBTyxDQUFDZixpQkFBc0U7UUFDcEgsNkRBQTZEO1FBQzdELE1BQU1nQixhQUFhZCxZQUFZZSxJQUFJLENBQUMsQ0FBQ0MsSUFBTSxBQUFDQSxFQUFFQyxNQUFNLEVBQVVDLHVCQUF1Qk47UUFDckYsSUFBSSxDQUFDRSxZQUFZO1lBQ2ZLLFFBQVFDLEtBQUssQ0FBQyxDQUFDLG9DQUFvQyxFQUFFUixVQUFVO1lBQy9EO1FBQ0Y7UUFFQSw0RUFBNEU7UUFDNUUsTUFBTVIsVUFBVUUsT0FBT2UsU0FBUztRQUNoQyxNQUFNaEIsVUFBVVMsV0FBV1EsSUFBSTtRQUUvQixJQUFJbEIsWUFBWUMsU0FBUztZQUN2QixtRUFBbUU7WUFDbkVGLGlCQUFpQkMsU0FBU0M7WUFFMUIsOENBQThDO1lBQzlDQyxPQUFPZSxTQUFTLEdBQUdoQjtRQUNyQjtRQUVBLDZFQUE2RTtRQUM3RSxNQUFNa0IsbUJBQW1DQyxNQUFNQyxPQUFPLENBQUNYLFdBQVdOLE1BQU0sSUFBS00sV0FBV04sTUFBTSxHQUFzQixFQUFFO1FBRXRILEtBQUssTUFBTSxDQUFDa0IsVUFBVUMsWUFBWSxJQUFJMUIsT0FBT1ksT0FBTyxDQUFDUCxPQUFPRSxNQUFNLEVBQUc7WUFDbkUsTUFBTW9CLGdCQUFnQkwsaUJBQWlCUixJQUFJLENBQUMsQ0FBQ2MsSUFBTUEsRUFBRVosTUFBTSxFQUFFYSx1QkFBdUJKO1lBRXBGLElBQUksQ0FBQ0UsZUFBZTtnQkFDbEJULFFBQVFDLEtBQUssQ0FBQyxDQUFDLHlCQUF5QixFQUFFTSxTQUFTLGlCQUFpQixFQUFFWixXQUFXUSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUN4RjtZQUNGO1lBRUEsTUFBTVMsVUFBVUgsY0FBY0ksSUFBSTtZQUNsQyxJQUFJRCxXQUFXSixZQUFZTSxTQUFTLEtBQUtGLFNBQVM7Z0JBQ2hESixZQUFZTSxTQUFTLEdBQUdGO1lBQzFCO1FBQ0Y7SUFDRjtJQUVBLE9BQU9qQztBQUNUIn0=