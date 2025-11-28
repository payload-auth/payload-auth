import { getAdditionalFieldProperties } from "./model-field-transformations";
export function getCollectionFields({ schema, fieldRules = [], additionalProperties = {} }) {
    const payloadFields = Object.entries(schema.fields).map(([fieldKey, field])=>{
        return convertSchemaFieldToPayload({
            field,
            fieldKey,
            fieldRules,
            additionalProperties
        });
    });
    return payloadFields;
}
export function convertSchemaFieldToPayload({ field, fieldKey, fieldRules = [], additionalProperties = {} }) {
    const { type, hasMany } = getPayloadFieldProperties({
        field
    });
    const additionalFieldProperties = getAdditionalFieldProperties({
        field,
        fieldKey,
        fieldRules,
        additionalProperties
    });
    const baseField = {
        name: field.fieldName ?? fieldKey,
        type,
        ...hasMany && {
            hasMany
        },
        ...field.required && {
            required: true
        },
        ...field.unique && {
            unique: true
        },
        ...additionalFieldProperties,
        custom: {
            betterAuthFieldKey: fieldKey
        }
    };
    if (field.references) {
        return {
            ...baseField,
            ...'relationTo' in additionalFieldProperties ? {
                relationTo: additionalFieldProperties.relationTo
            } : {
                relationTo: field.references.model
            }
        };
    }
    return baseField;
}
export function getPayloadFieldProperties({ field }) {
    const type = field.type;
    if ('references' in field) {
        return {
            type: 'relationship'
        };
    }
    if (type === 'number[]') {
        return {
            type: 'number',
            hasMany: true
        };
    }
    if (type === 'string[]') {
        return {
            type: 'text',
            hasMany: true
        };
    }
    switch(type){
        case 'boolean':
            return {
                type: 'checkbox'
            };
        case 'date':
            return {
                type: 'date'
            };
        case 'string':
            return {
                type: 'text'
            };
        case 'number':
            return {
                type: 'number'
            };
        default:
            return {
                type: 'text'
            };
    }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3V0aWxzL3RyYW5zZm9ybS1zY2hlbWEtZmllbGRzLXRvLXBheWxvYWQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBCdWlsdEJldHRlckF1dGhTY2hlbWEsIEZpZWxkUnVsZSB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL3R5cGVzJ1xuaW1wb3J0IHR5cGUgeyBEQkZpZWxkQXR0cmlidXRlIH0gZnJvbSAnYmV0dGVyLWF1dGgvZGInXG5pbXBvcnQgdHlwZSB7IEZpZWxkLCBSZWxhdGlvbnNoaXBGaWVsZCB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgeyBnZXRBZGRpdGlvbmFsRmllbGRQcm9wZXJ0aWVzIH0gZnJvbSAnLi9tb2RlbC1maWVsZC10cmFuc2Zvcm1hdGlvbnMnXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb2xsZWN0aW9uRmllbGRzKHtcbiAgc2NoZW1hLFxuICBmaWVsZFJ1bGVzID0gW10sXG4gIGFkZGl0aW9uYWxQcm9wZXJ0aWVzID0ge31cbn06IHtcbiAgc2NoZW1hOiBCdWlsdEJldHRlckF1dGhTY2hlbWFcbiAgZmllbGRSdWxlcz86IEZpZWxkUnVsZVtdXG4gIGFkZGl0aW9uYWxQcm9wZXJ0aWVzPzogUmVjb3JkPHN0cmluZywgKGZpZWxkOiBEQkZpZWxkQXR0cmlidXRlKSA9PiBQYXJ0aWFsPEZpZWxkPj5cbn0pOiBGaWVsZFtdIHwgbnVsbCB7XG4gIGNvbnN0IHBheWxvYWRGaWVsZHMgPSBPYmplY3QuZW50cmllcyhzY2hlbWEuZmllbGRzKS5tYXAoKFtmaWVsZEtleSwgZmllbGRdKSA9PiB7XG4gICAgcmV0dXJuIGNvbnZlcnRTY2hlbWFGaWVsZFRvUGF5bG9hZCh7IGZpZWxkLCBmaWVsZEtleSwgZmllbGRSdWxlcywgYWRkaXRpb25hbFByb3BlcnRpZXMgfSlcbiAgfSlcblxuICByZXR1cm4gcGF5bG9hZEZpZWxkc1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29udmVydFNjaGVtYUZpZWxkVG9QYXlsb2FkKHtcbiAgZmllbGQsXG4gIGZpZWxkS2V5LFxuICBmaWVsZFJ1bGVzID0gW10sXG4gIGFkZGl0aW9uYWxQcm9wZXJ0aWVzID0ge31cbn06IHtcbiAgZmllbGQ6IERCRmllbGRBdHRyaWJ1dGVcbiAgZmllbGRLZXk6IHN0cmluZ1xuICBmaWVsZFJ1bGVzPzogRmllbGRSdWxlW11cbiAgYWRkaXRpb25hbFByb3BlcnRpZXM/OiBSZWNvcmQ8c3RyaW5nLCAoZmllbGQ6IERCRmllbGRBdHRyaWJ1dGUpID0+IFBhcnRpYWw8RmllbGQ+PlxufSk6IEZpZWxkIHtcbiAgY29uc3QgeyB0eXBlLCBoYXNNYW55IH0gPSBnZXRQYXlsb2FkRmllbGRQcm9wZXJ0aWVzKHsgZmllbGQgfSlcbiAgY29uc3QgYWRkaXRpb25hbEZpZWxkUHJvcGVydGllcyA9IGdldEFkZGl0aW9uYWxGaWVsZFByb3BlcnRpZXMoe1xuICAgIGZpZWxkLFxuICAgIGZpZWxkS2V5LFxuICAgIGZpZWxkUnVsZXMsXG4gICAgYWRkaXRpb25hbFByb3BlcnRpZXMsXG4gIH0pXG4gIGNvbnN0IGJhc2VGaWVsZCA9IHtcbiAgICBuYW1lOiBmaWVsZC5maWVsZE5hbWUgPz8gZmllbGRLZXksXG4gICAgdHlwZSxcbiAgICAuLi4oaGFzTWFueSAmJiB7IGhhc01hbnkgfSksXG4gICAgLi4uKGZpZWxkLnJlcXVpcmVkICYmIHsgcmVxdWlyZWQ6IHRydWUgfSksXG4gICAgLi4uKGZpZWxkLnVuaXF1ZSAmJiB7IHVuaXF1ZTogdHJ1ZSB9KSxcbiAgICAuLi5hZGRpdGlvbmFsRmllbGRQcm9wZXJ0aWVzLFxuICAgIGN1c3RvbToge1xuICAgICAgYmV0dGVyQXV0aEZpZWxkS2V5OiBmaWVsZEtleVxuICAgIH1cbiAgfSBhcyBGaWVsZFxuXG4gIGlmIChmaWVsZC5yZWZlcmVuY2VzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmJhc2VGaWVsZCxcbiAgICAgIC4uLigncmVsYXRpb25UbycgaW4gYWRkaXRpb25hbEZpZWxkUHJvcGVydGllc1xuICAgICAgICA/IHsgcmVsYXRpb25UbzogYWRkaXRpb25hbEZpZWxkUHJvcGVydGllcy5yZWxhdGlvblRvIH1cbiAgICAgICAgOiB7IHJlbGF0aW9uVG86IGZpZWxkLnJlZmVyZW5jZXMubW9kZWwgfSlcbiAgICB9IGFzIFJlbGF0aW9uc2hpcEZpZWxkXG4gIH1cblxuICByZXR1cm4gYmFzZUZpZWxkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQYXlsb2FkRmllbGRQcm9wZXJ0aWVzKHsgZmllbGQgfTogeyBmaWVsZDogREJGaWVsZEF0dHJpYnV0ZSB9KToge1xuICB0eXBlOiBGaWVsZFsndHlwZSddXG4gIGhhc01hbnk/OiBib29sZWFuXG59IHtcbiAgY29uc3QgdHlwZSA9IGZpZWxkLnR5cGVcblxuICBpZiAoJ3JlZmVyZW5jZXMnIGluIGZpZWxkKSB7XG4gICAgcmV0dXJuIHsgdHlwZTogJ3JlbGF0aW9uc2hpcCcgfVxuICB9XG5cbiAgaWYgKHR5cGUgPT09ICdudW1iZXJbXScpIHtcbiAgICByZXR1cm4geyB0eXBlOiAnbnVtYmVyJywgaGFzTWFueTogdHJ1ZSB9XG4gIH1cblxuICBpZiAodHlwZSA9PT0gJ3N0cmluZ1tdJykge1xuICAgIHJldHVybiB7IHR5cGU6ICd0ZXh0JywgaGFzTWFueTogdHJ1ZSB9XG4gIH1cblxuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICdib29sZWFuJzpcbiAgICAgIHJldHVybiB7IHR5cGU6ICdjaGVja2JveCcgfVxuICAgIGNhc2UgJ2RhdGUnOlxuICAgICAgcmV0dXJuIHsgdHlwZTogJ2RhdGUnIH1cbiAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgcmV0dXJuIHsgdHlwZTogJ3RleHQnIH1cbiAgICBjYXNlICdudW1iZXInOlxuICAgICAgcmV0dXJuIHsgdHlwZTogJ251bWJlcicgfVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4geyB0eXBlOiAndGV4dCcgfVxuICB9XG59XG4iXSwibmFtZXMiOlsiZ2V0QWRkaXRpb25hbEZpZWxkUHJvcGVydGllcyIsImdldENvbGxlY3Rpb25GaWVsZHMiLCJzY2hlbWEiLCJmaWVsZFJ1bGVzIiwiYWRkaXRpb25hbFByb3BlcnRpZXMiLCJwYXlsb2FkRmllbGRzIiwiT2JqZWN0IiwiZW50cmllcyIsImZpZWxkcyIsIm1hcCIsImZpZWxkS2V5IiwiZmllbGQiLCJjb252ZXJ0U2NoZW1hRmllbGRUb1BheWxvYWQiLCJ0eXBlIiwiaGFzTWFueSIsImdldFBheWxvYWRGaWVsZFByb3BlcnRpZXMiLCJhZGRpdGlvbmFsRmllbGRQcm9wZXJ0aWVzIiwiYmFzZUZpZWxkIiwibmFtZSIsImZpZWxkTmFtZSIsInJlcXVpcmVkIiwidW5pcXVlIiwiY3VzdG9tIiwiYmV0dGVyQXV0aEZpZWxkS2V5IiwicmVmZXJlbmNlcyIsInJlbGF0aW9uVG8iLCJtb2RlbCJdLCJtYXBwaW5ncyI6IkFBR0EsU0FBU0EsNEJBQTRCLFFBQVEsZ0NBQStCO0FBRTVFLE9BQU8sU0FBU0Msb0JBQW9CLEVBQ2xDQyxNQUFNLEVBQ05DLGFBQWEsRUFBRSxFQUNmQyx1QkFBdUIsQ0FBQyxDQUFDLEVBSzFCO0lBQ0MsTUFBTUMsZ0JBQWdCQyxPQUFPQyxPQUFPLENBQUNMLE9BQU9NLE1BQU0sRUFBRUMsR0FBRyxDQUFDLENBQUMsQ0FBQ0MsVUFBVUMsTUFBTTtRQUN4RSxPQUFPQyw0QkFBNEI7WUFBRUQ7WUFBT0Q7WUFBVVA7WUFBWUM7UUFBcUI7SUFDekY7SUFFQSxPQUFPQztBQUNUO0FBRUEsT0FBTyxTQUFTTyw0QkFBNEIsRUFDMUNELEtBQUssRUFDTEQsUUFBUSxFQUNSUCxhQUFhLEVBQUUsRUFDZkMsdUJBQXVCLENBQUMsQ0FBQyxFQU0xQjtJQUNDLE1BQU0sRUFBRVMsSUFBSSxFQUFFQyxPQUFPLEVBQUUsR0FBR0MsMEJBQTBCO1FBQUVKO0lBQU07SUFDNUQsTUFBTUssNEJBQTRCaEIsNkJBQTZCO1FBQzdEVztRQUNBRDtRQUNBUDtRQUNBQztJQUNGO0lBQ0EsTUFBTWEsWUFBWTtRQUNoQkMsTUFBTVAsTUFBTVEsU0FBUyxJQUFJVDtRQUN6Qkc7UUFDQSxHQUFJQyxXQUFXO1lBQUVBO1FBQVEsQ0FBQztRQUMxQixHQUFJSCxNQUFNUyxRQUFRLElBQUk7WUFBRUEsVUFBVTtRQUFLLENBQUM7UUFDeEMsR0FBSVQsTUFBTVUsTUFBTSxJQUFJO1lBQUVBLFFBQVE7UUFBSyxDQUFDO1FBQ3BDLEdBQUdMLHlCQUF5QjtRQUM1Qk0sUUFBUTtZQUNOQyxvQkFBb0JiO1FBQ3RCO0lBQ0Y7SUFFQSxJQUFJQyxNQUFNYSxVQUFVLEVBQUU7UUFDcEIsT0FBTztZQUNMLEdBQUdQLFNBQVM7WUFDWixHQUFJLGdCQUFnQkQsNEJBQ2hCO2dCQUFFUyxZQUFZVCwwQkFBMEJTLFVBQVU7WUFBQyxJQUNuRDtnQkFBRUEsWUFBWWQsTUFBTWEsVUFBVSxDQUFDRSxLQUFLO1lBQUMsQ0FBQztRQUM1QztJQUNGO0lBRUEsT0FBT1Q7QUFDVDtBQUVBLE9BQU8sU0FBU0YsMEJBQTBCLEVBQUVKLEtBQUssRUFBK0I7SUFJOUUsTUFBTUUsT0FBT0YsTUFBTUUsSUFBSTtJQUV2QixJQUFJLGdCQUFnQkYsT0FBTztRQUN6QixPQUFPO1lBQUVFLE1BQU07UUFBZTtJQUNoQztJQUVBLElBQUlBLFNBQVMsWUFBWTtRQUN2QixPQUFPO1lBQUVBLE1BQU07WUFBVUMsU0FBUztRQUFLO0lBQ3pDO0lBRUEsSUFBSUQsU0FBUyxZQUFZO1FBQ3ZCLE9BQU87WUFBRUEsTUFBTTtZQUFRQyxTQUFTO1FBQUs7SUFDdkM7SUFFQSxPQUFRRDtRQUNOLEtBQUs7WUFDSCxPQUFPO2dCQUFFQSxNQUFNO1lBQVc7UUFDNUIsS0FBSztZQUNILE9BQU87Z0JBQUVBLE1BQU07WUFBTztRQUN4QixLQUFLO1lBQ0gsT0FBTztnQkFBRUEsTUFBTTtZQUFPO1FBQ3hCLEtBQUs7WUFDSCxPQUFPO2dCQUFFQSxNQUFNO1lBQVM7UUFDMUI7WUFDRSxPQUFPO2dCQUFFQSxNQUFNO1lBQU87SUFDMUI7QUFDRiJ9