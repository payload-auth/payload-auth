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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3V0aWxzL3RyYW5zZm9ybS1zY2hlbWEtZmllbGRzLXRvLXBheWxvYWQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQnVpbHRCZXR0ZXJBdXRoU2NoZW1hIH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vdHlwZXMnXG5pbXBvcnQgeyB0eXBlIEZpZWxkQXR0cmlidXRlIH0gZnJvbSAnYmV0dGVyLWF1dGgvZGInXG5pbXBvcnQgdHlwZSB7IEZpZWxkLCBSZWxhdGlvbnNoaXBGaWVsZCB9IGZyb20gJ3BheWxvYWQnXG5pbXBvcnQgdHlwZSB7IEZpZWxkUnVsZSB9IGZyb20gJy4vbW9kZWwtZmllbGQtdHJhbnNmb3JtYXRpb25zJ1xuaW1wb3J0IHsgZ2V0QWRkaXRpb25hbEZpZWxkUHJvcGVydGllcyB9IGZyb20gJy4vbW9kZWwtZmllbGQtdHJhbnNmb3JtYXRpb25zJ1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29sbGVjdGlvbkZpZWxkcyh7XG4gIHNjaGVtYSxcbiAgZmllbGRSdWxlcyA9IFtdLFxuICBhZGRpdGlvbmFsUHJvcGVydGllcyA9IHt9XG59OiB7XG4gIHNjaGVtYTogQnVpbHRCZXR0ZXJBdXRoU2NoZW1hXG4gIGZpZWxkUnVsZXM/OiBGaWVsZFJ1bGVbXVxuICBhZGRpdGlvbmFsUHJvcGVydGllcz86IFJlY29yZDxzdHJpbmcsIChmaWVsZDogRmllbGRBdHRyaWJ1dGUpID0+IFBhcnRpYWw8RmllbGQ+PlxufSk6IEZpZWxkW10gfCBudWxsIHtcbiAgY29uc3QgcGF5bG9hZEZpZWxkcyA9IE9iamVjdC5lbnRyaWVzKHNjaGVtYS5maWVsZHMpLm1hcCgoW2ZpZWxkS2V5LCBmaWVsZF0pID0+IHtcbiAgICByZXR1cm4gY29udmVydFNjaGVtYUZpZWxkVG9QYXlsb2FkKHsgZmllbGQsIGZpZWxkS2V5LCBmaWVsZFJ1bGVzLCBhZGRpdGlvbmFsUHJvcGVydGllcyB9KVxuICB9KVxuXG4gIHJldHVybiBwYXlsb2FkRmllbGRzXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0U2NoZW1hRmllbGRUb1BheWxvYWQoe1xuICBmaWVsZCxcbiAgZmllbGRLZXksXG4gIGZpZWxkUnVsZXMgPSBbXSxcbiAgYWRkaXRpb25hbFByb3BlcnRpZXMgPSB7fVxufToge1xuICBmaWVsZDogRmllbGRBdHRyaWJ1dGVcbiAgZmllbGRLZXk6IHN0cmluZ1xuICBmaWVsZFJ1bGVzPzogRmllbGRSdWxlW11cbiAgYWRkaXRpb25hbFByb3BlcnRpZXM/OiBSZWNvcmQ8c3RyaW5nLCAoZmllbGQ6IEZpZWxkQXR0cmlidXRlKSA9PiBQYXJ0aWFsPEZpZWxkPj5cbn0pOiBGaWVsZCB7XG4gIGNvbnN0IHsgdHlwZSwgaGFzTWFueSB9ID0gZ2V0UGF5bG9hZEZpZWxkUHJvcGVydGllcyh7IGZpZWxkIH0pXG4gIGNvbnN0IGFkZGl0aW9uYWxGaWVsZFByb3BlcnRpZXMgPSBnZXRBZGRpdGlvbmFsRmllbGRQcm9wZXJ0aWVzKHsgZmllbGQsIGZpZWxkS2V5LCBmaWVsZFJ1bGVzLCBhZGRpdGlvbmFsUHJvcGVydGllcyB9KVxuICBjb25zdCBiYXNlRmllbGQgPSB7XG4gICAgbmFtZTogZmllbGQuZmllbGROYW1lID8/IGZpZWxkS2V5LFxuICAgIHR5cGUsXG4gICAgLi4uKGhhc01hbnkgJiYgeyBoYXNNYW55IH0pLFxuICAgIC4uLihmaWVsZC5yZXF1aXJlZCAmJiB7IHJlcXVpcmVkOiB0cnVlIH0pLFxuICAgIC4uLihmaWVsZC51bmlxdWUgJiYgeyB1bmlxdWU6IHRydWUgfSksXG4gICAgLi4uYWRkaXRpb25hbEZpZWxkUHJvcGVydGllcyxcbiAgICBjdXN0b206IHtcbiAgICAgIGJldHRlckF1dGhGaWVsZEtleTogZmllbGRLZXlcbiAgICB9XG4gIH0gYXMgRmllbGRcblxuICBpZiAoZmllbGQucmVmZXJlbmNlcykge1xuICAgIHJldHVybiB7XG4gICAgICAuLi5iYXNlRmllbGQsXG4gICAgICAuLi4oJ3JlbGF0aW9uVG8nIGluIGFkZGl0aW9uYWxGaWVsZFByb3BlcnRpZXNcbiAgICAgICAgPyB7IHJlbGF0aW9uVG86IGFkZGl0aW9uYWxGaWVsZFByb3BlcnRpZXMucmVsYXRpb25UbyB9XG4gICAgICAgIDogeyByZWxhdGlvblRvOiBmaWVsZC5yZWZlcmVuY2VzLm1vZGVsIH0pXG4gICAgfSBhcyBSZWxhdGlvbnNoaXBGaWVsZFxuICB9XG5cbiAgcmV0dXJuIGJhc2VGaWVsZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGF5bG9hZEZpZWxkUHJvcGVydGllcyh7IGZpZWxkIH06IHsgZmllbGQ6IEZpZWxkQXR0cmlidXRlIH0pOiB7XG4gIHR5cGU6IEZpZWxkWyd0eXBlJ11cbiAgaGFzTWFueT86IGJvb2xlYW5cbn0ge1xuICBjb25zdCB0eXBlID0gZmllbGQudHlwZVxuXG4gIGlmICgncmVmZXJlbmNlcycgaW4gZmllbGQpIHtcbiAgICByZXR1cm4geyB0eXBlOiAncmVsYXRpb25zaGlwJyB9XG4gIH1cblxuICBpZiAodHlwZSA9PT0gJ251bWJlcltdJykge1xuICAgIHJldHVybiB7IHR5cGU6ICdudW1iZXInLCBoYXNNYW55OiB0cnVlIH1cbiAgfVxuXG4gIGlmICh0eXBlID09PSAnc3RyaW5nW10nKSB7XG4gICAgcmV0dXJuIHsgdHlwZTogJ3RleHQnLCBoYXNNYW55OiB0cnVlIH1cbiAgfVxuXG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgcmV0dXJuIHsgdHlwZTogJ2NoZWNrYm94JyB9XG4gICAgY2FzZSAnZGF0ZSc6XG4gICAgICByZXR1cm4geyB0eXBlOiAnZGF0ZScgfVxuICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICByZXR1cm4geyB0eXBlOiAndGV4dCcgfVxuICAgIGNhc2UgJ251bWJlcic6XG4gICAgICByZXR1cm4geyB0eXBlOiAnbnVtYmVyJyB9XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB7IHR5cGU6ICd0ZXh0JyB9XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJnZXRBZGRpdGlvbmFsRmllbGRQcm9wZXJ0aWVzIiwiZ2V0Q29sbGVjdGlvbkZpZWxkcyIsInNjaGVtYSIsImZpZWxkUnVsZXMiLCJhZGRpdGlvbmFsUHJvcGVydGllcyIsInBheWxvYWRGaWVsZHMiLCJPYmplY3QiLCJlbnRyaWVzIiwiZmllbGRzIiwibWFwIiwiZmllbGRLZXkiLCJmaWVsZCIsImNvbnZlcnRTY2hlbWFGaWVsZFRvUGF5bG9hZCIsInR5cGUiLCJoYXNNYW55IiwiZ2V0UGF5bG9hZEZpZWxkUHJvcGVydGllcyIsImFkZGl0aW9uYWxGaWVsZFByb3BlcnRpZXMiLCJiYXNlRmllbGQiLCJuYW1lIiwiZmllbGROYW1lIiwicmVxdWlyZWQiLCJ1bmlxdWUiLCJjdXN0b20iLCJiZXR0ZXJBdXRoRmllbGRLZXkiLCJyZWZlcmVuY2VzIiwicmVsYXRpb25UbyIsIm1vZGVsIl0sIm1hcHBpbmdzIjoiQUFJQSxTQUFTQSw0QkFBNEIsUUFBUSxnQ0FBK0I7QUFFNUUsT0FBTyxTQUFTQyxvQkFBb0IsRUFDbENDLE1BQU0sRUFDTkMsYUFBYSxFQUFFLEVBQ2ZDLHVCQUF1QixDQUFDLENBQUMsRUFLMUI7SUFDQyxNQUFNQyxnQkFBZ0JDLE9BQU9DLE9BQU8sQ0FBQ0wsT0FBT00sTUFBTSxFQUFFQyxHQUFHLENBQUMsQ0FBQyxDQUFDQyxVQUFVQyxNQUFNO1FBQ3hFLE9BQU9DLDRCQUE0QjtZQUFFRDtZQUFPRDtZQUFVUDtZQUFZQztRQUFxQjtJQUN6RjtJQUVBLE9BQU9DO0FBQ1Q7QUFFQSxPQUFPLFNBQVNPLDRCQUE0QixFQUMxQ0QsS0FBSyxFQUNMRCxRQUFRLEVBQ1JQLGFBQWEsRUFBRSxFQUNmQyx1QkFBdUIsQ0FBQyxDQUFDLEVBTTFCO0lBQ0MsTUFBTSxFQUFFUyxJQUFJLEVBQUVDLE9BQU8sRUFBRSxHQUFHQywwQkFBMEI7UUFBRUo7SUFBTTtJQUM1RCxNQUFNSyw0QkFBNEJoQiw2QkFBNkI7UUFBRVc7UUFBT0Q7UUFBVVA7UUFBWUM7SUFBcUI7SUFDbkgsTUFBTWEsWUFBWTtRQUNoQkMsTUFBTVAsTUFBTVEsU0FBUyxJQUFJVDtRQUN6Qkc7UUFDQSxHQUFJQyxXQUFXO1lBQUVBO1FBQVEsQ0FBQztRQUMxQixHQUFJSCxNQUFNUyxRQUFRLElBQUk7WUFBRUEsVUFBVTtRQUFLLENBQUM7UUFDeEMsR0FBSVQsTUFBTVUsTUFBTSxJQUFJO1lBQUVBLFFBQVE7UUFBSyxDQUFDO1FBQ3BDLEdBQUdMLHlCQUF5QjtRQUM1Qk0sUUFBUTtZQUNOQyxvQkFBb0JiO1FBQ3RCO0lBQ0Y7SUFFQSxJQUFJQyxNQUFNYSxVQUFVLEVBQUU7UUFDcEIsT0FBTztZQUNMLEdBQUdQLFNBQVM7WUFDWixHQUFJLGdCQUFnQkQsNEJBQ2hCO2dCQUFFUyxZQUFZVCwwQkFBMEJTLFVBQVU7WUFBQyxJQUNuRDtnQkFBRUEsWUFBWWQsTUFBTWEsVUFBVSxDQUFDRSxLQUFLO1lBQUMsQ0FBQztRQUM1QztJQUNGO0lBRUEsT0FBT1Q7QUFDVDtBQUVBLE9BQU8sU0FBU0YsMEJBQTBCLEVBQUVKLEtBQUssRUFBNkI7SUFJNUUsTUFBTUUsT0FBT0YsTUFBTUUsSUFBSTtJQUV2QixJQUFJLGdCQUFnQkYsT0FBTztRQUN6QixPQUFPO1lBQUVFLE1BQU07UUFBZTtJQUNoQztJQUVBLElBQUlBLFNBQVMsWUFBWTtRQUN2QixPQUFPO1lBQUVBLE1BQU07WUFBVUMsU0FBUztRQUFLO0lBQ3pDO0lBRUEsSUFBSUQsU0FBUyxZQUFZO1FBQ3ZCLE9BQU87WUFBRUEsTUFBTTtZQUFRQyxTQUFTO1FBQUs7SUFDdkM7SUFFQSxPQUFRRDtRQUNOLEtBQUs7WUFDSCxPQUFPO2dCQUFFQSxNQUFNO1lBQVc7UUFDNUIsS0FBSztZQUNILE9BQU87Z0JBQUVBLE1BQU07WUFBTztRQUN4QixLQUFLO1lBQ0gsT0FBTztnQkFBRUEsTUFBTTtZQUFPO1FBQ3hCLEtBQUs7WUFDSCxPQUFPO2dCQUFFQSxNQUFNO1lBQVM7UUFDMUI7WUFDRSxPQUFPO2dCQUFFQSxNQUFNO1lBQU87SUFDMUI7QUFDRiJ9