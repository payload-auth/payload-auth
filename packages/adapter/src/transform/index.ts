import { BetterAuthError } from "better-auth";
import { getAuthTables } from "better-auth/db";
import type { BetterAuthOptions, Where } from "better-auth";
import type { CollectionSlug, Where as PayloadWhere } from "payload";

export const createTransform = (options: BetterAuthOptions) => {
  const schema = getAuthTables(options);

  function getField(model: string, field: string) {
    if (field === "id") {
      return field;
    }
    const f = (schema as Record<string, any>)[model]?.fields[field];
    return f?.fieldName || field;
  }

  function getModelName(model: string): CollectionSlug {
    const collection =
      (schema as Record<string, any>)[model]?.modelName || model;
    if (!collection) {
      throw new BetterAuthError(
        `Model ${model} does not exist in the database.`
      );
    }
    return collection as CollectionSlug;
  }

  function singleIdQuery(where: Where[]) {
    if (!where || where.length !== 1) return null;

    const [condition] = where;

    const isIdField = condition?.field === "id" || condition?.field === "_id";
    const isEqOperator = condition?.operator === "eq";
    const isContainsSingleId =
      condition?.operator === "contains" &&
      Array.isArray(condition?.value) &&
      condition?.value?.length === 1 &&
      (typeof condition?.value[0] === "string" ||
        typeof condition?.value[0] === "number");

    if (
      isIdField &&
      isEqOperator &&
      (typeof condition?.value === "string" ||
        typeof condition?.value === "number")
    ) {
      return condition?.value;
    }

    if (isIdField && isContainsSingleId && Array.isArray(condition?.value)) {
      return condition?.value[0] ?? null;
    }

    return null;
  }

  function multipleIdsQuery(where: Where[]) {
    if (!where || where.length !== 1) {
      return null;
    }
    const condition = where[0];

    // Check if this is an 'in' operator with id field and array of values
    if (
      condition &&
      (condition.field === "id" || condition.field === "_id") &&
      condition.operator === "in" &&
      Array.isArray(condition.value) &&
      condition.value.length > 0 &&
      condition.value.every(
        (id) => typeof id === "string" || typeof id === "number"
      )
    ) {
      return condition.value as (number | string)[];
    }

    // Also check for contains operator with array of IDs
    if (
      condition &&
      (condition.field === "id" || condition.field === "_id") &&
      condition.operator === "contains" &&
      Array.isArray(condition.value) &&
      condition.value.length > 1 &&
      condition.value.every(
        (id) => typeof id === "string" || typeof id === "number"
      )
    ) {
      return condition.value as (number | string)[];
    }

    return null;
  }

  function transformInput(
    data: Record<string, any>,
    model: string,
    action: "create" | "update"
  ) {
    const transformedData: Record<string, any> = {};
    const schemaFields = (schema as Record<string, any>)[model].fields;
    for (const dataField in data) {
      if (data[dataField] === undefined && action === "update") {
        continue;
      }
      const updatedField = schemaFields[dataField]?.fieldName;
      if (updatedField) {
        transformedData[updatedField] = data[dataField];
      } else {
        transformedData[dataField] = data[dataField];
      }
    }
    return transformedData;
  }

  function transformOutput<T extends Record<string, any> | undefined>(
    doc: T
  ): T {
    if (!doc || typeof doc !== "object") return doc;

    const result = { ...doc } as any;

    // Scan for relationship fields that contain objects with IDs
    Object.entries(doc).forEach(([key, value]) => {
      // If the value is an object with an id property, it's likely a relationship
      if (value && typeof value === "object" && "id" in value) {
        // Create a new field with Id suffix containing just the ID
        const newKey = `${key}Id`;
        result[newKey] = value.id;

        // Keep the original value as well for backward compatibility
      } else if (Array.isArray(value)) {
        // Handle arrays of relationships
        if (
          value.length > 0 &&
          typeof value[0] === "object" &&
          "id" in value[0]
        ) {
          const newKey = `${key}Ids`;
          result[newKey] = value.map((item) => item.id);
        }
      }
    });

    return result as T;
  }

  function operatorToPayload(operator: string, value: any) {
    switch (operator) {
      case "eq":
        return { equals: value };
      case "ne":
        return { not_equals: value };
      case "gt":
        return { greater_than: value };
      case "gte":
        return { greater_than_equal: value };
      case "lt":
        return { less_than: value };
      case "lte":
        return { less_than_equal: value };
      case "contains":
        return { contains: value };
      case "in":
        return { in: value };
      case "starts_with":
        return { like: `${value}%` };
      case "ends_with":
        return { like: `%${value}` };
      default:
        return { equals: value };
    }
  }

  function convertWhereClause(model: string, where?: Where[]): PayloadWhere {
    if (!where) return {};
    if (where.length === 1) {
      const w = where[0];
      if (!w) {
        return {};
      }
      return {
        [getField(model, w.field)]: operatorToPayload(
          w.operator ?? "",
          w.value
        ),
      };
    }
    const and = where.filter((w) => w.connector === "AND" || !w.connector);
    const or = where.filter((w) => w.connector === "OR");
    const andClause = and.map((w) => {
      return {
        [getField(model, w.field)]: operatorToPayload(
          w.operator ?? "",
          w.value
        ),
      };
    });
    const orClause = or.map((w) => {
      return {
        [getField(model, w.field)]: operatorToPayload(
          w.operator ?? "",
          w.value
        ),
      };
    });

    return {
      ...(andClause.length ? { AND: andClause } : {}),
      ...(orClause.length ? { OR: orClause } : {}),
    };
  }

  function convertSelect(model: string, select?: string[]) {
    if (!select || select.length === 0) return undefined;
    return select.reduce(
      (acc, field) => ({ ...acc, [getField(model, field)]: true }),
      {}
    );
  }

  function convertSort(
    model: string,
    sortBy?: { field: string; direction: "asc" | "desc" }
  ) {
    if (!sortBy) return undefined;
    return `${sortBy.direction === "desc" ? "-" : ""}${getField(
      model,
      sortBy.field
    )}`;
  }

  return {
    getField,
    getModelName,
    singleIdQuery,
    multipleIdsQuery,
    transformInput,
    transformOutput,
    convertWhereClause,
    convertSelect,
    convertSort,
  };
};
