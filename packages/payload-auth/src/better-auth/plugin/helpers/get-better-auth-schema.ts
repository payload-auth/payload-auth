import { getAuthTables, type FieldAttribute } from "better-auth/db";
import type { BetterAuthOptions } from "better-auth";

/**
 * This is a slighlty modfied version of the getSchema function from better-auth.
 * Found here: https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/db/get-schema.ts
 * 
 * We DON'T do this:
 * actualFields[field.fieldName || key] = field;
 * 
 * Instead we will do this:
 * actualFields[key] = field;
 * 
 * This is to contain consistency when statically hard coded keys.
 * 
 * @param config - The better auth config
 * @returns The schema for the better auth tables
 */
export function getBetterAuthSchema(config: BetterAuthOptions) {
	const tables = getAuthTables(config);
	let schema: Record<
		string,
		{
			fields: Record<string, FieldAttribute>;
			order: number;
		}
	> = {};
	for (const key in tables) {
		const table = tables[key];
		const fields = table.fields;
		let actualFields: Record<string, FieldAttribute> = {};
		Object.entries(fields).forEach(([key, field]) => {
			actualFields[key] = field;
			if (field.references) {
				const refTable = tables[field.references.model];
				if (refTable) {
					actualFields[key].references = {
						model: refTable.modelName,
						field: field.references.field,
					};
				}
			}
		});
		if (schema[table.modelName]) {
			schema[table.modelName].fields = {
				...schema[table.modelName].fields,
				...actualFields,
			};
			continue;
		}
		schema[table.modelName] = {
			fields: actualFields,
			order: table.order || Infinity,
		};
	}
	return schema;
}