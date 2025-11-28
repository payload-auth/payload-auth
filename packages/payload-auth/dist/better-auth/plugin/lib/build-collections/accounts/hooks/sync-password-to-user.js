import { baModelKey } from "../../../../constants";
import { getSchemaCollectionSlug, getSchemaFieldName } from "../../utils/collection-schema";
export function getSyncPasswordToUserHook(resolvedSchemas) {
    const hook = async ({ doc, req, operation, context })=>{
        if (context?.syncAccountHook) return doc;
        if (operation !== 'create' && operation !== 'update') {
            return doc;
        }
        const userSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.user);
        const accountSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.account);
        const userField = getSchemaFieldName(resolvedSchemas, baModelKey.account, 'userId');
        if (!doc[userField]) {
            return doc;
        }
        const account = await req.payload.findByID({
            collection: accountSlug,
            id: doc.id,
            depth: 0,
            req,
            showHiddenFields: true
        });
        if (!account || !account.password) {
            return doc;
        }
        const [salt, hash] = account.password.split(':');
        if (!salt || !hash) {
            return doc;
        }
        const userId = typeof doc[userField] === 'object' ? doc[userField]?.id : doc[userField];
        try {
            await req.payload.update({
                collection: userSlug,
                id: userId,
                data: {
                    salt,
                    hash
                },
                req,
                context: {
                    syncPasswordToUser: true
                }
            });
        } catch (error) {
            console.error('Failed to sync password to user:', error);
        }
        return doc;
    };
    return hook;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL2FjY291bnRzL2hvb2tzL3N5bmMtcGFzc3dvcmQtdG8tdXNlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IENvbGxlY3Rpb25BZnRlckNoYW5nZUhvb2sgfSBmcm9tICdwYXlsb2FkJ1xuaW1wb3J0IHR5cGUgeyBCZXR0ZXJBdXRoU2NoZW1hcyB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL3R5cGVzJ1xuaW1wb3J0IHsgYmFNb2RlbEtleSB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL2NvbnN0YW50cydcbmltcG9ydCB7IGdldFNjaGVtYUNvbGxlY3Rpb25TbHVnLCBnZXRTY2hlbWFGaWVsZE5hbWUgfSBmcm9tICcuLi8uLi91dGlscy9jb2xsZWN0aW9uLXNjaGVtYSdcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFN5bmNQYXNzd29yZFRvVXNlckhvb2socmVzb2x2ZWRTY2hlbWFzOiBCZXR0ZXJBdXRoU2NoZW1hcyk6IENvbGxlY3Rpb25BZnRlckNoYW5nZUhvb2sge1xuICBjb25zdCBob29rOiBDb2xsZWN0aW9uQWZ0ZXJDaGFuZ2VIb29rID0gYXN5bmMgKHsgZG9jLCByZXEsIG9wZXJhdGlvbiwgY29udGV4dCB9KSA9PiB7XG4gICAgaWYgKGNvbnRleHQ/LnN5bmNBY2NvdW50SG9vaykgcmV0dXJuIGRvY1xuXG4gICAgaWYgKG9wZXJhdGlvbiAhPT0gJ2NyZWF0ZScgJiYgb3BlcmF0aW9uICE9PSAndXBkYXRlJykge1xuICAgICAgcmV0dXJuIGRvY1xuICAgIH1cbiAgICBjb25zdCB1c2VyU2x1ZyA9IGdldFNjaGVtYUNvbGxlY3Rpb25TbHVnKHJlc29sdmVkU2NoZW1hcywgYmFNb2RlbEtleS51c2VyKVxuICAgIGNvbnN0IGFjY291bnRTbHVnID0gZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWcocmVzb2x2ZWRTY2hlbWFzLCBiYU1vZGVsS2V5LmFjY291bnQpXG4gICAgY29uc3QgdXNlckZpZWxkID0gZ2V0U2NoZW1hRmllbGROYW1lKHJlc29sdmVkU2NoZW1hcywgYmFNb2RlbEtleS5hY2NvdW50LCAndXNlcklkJylcblxuICAgIGlmICghZG9jW3VzZXJGaWVsZF0pIHtcbiAgICAgIHJldHVybiBkb2NcbiAgICB9XG5cbiAgICBjb25zdCBhY2NvdW50ID0gYXdhaXQgcmVxLnBheWxvYWQuZmluZEJ5SUQoe1xuICAgICAgY29sbGVjdGlvbjogYWNjb3VudFNsdWcsXG4gICAgICBpZDogZG9jLmlkLFxuICAgICAgZGVwdGg6IDAsXG4gICAgICByZXEsXG4gICAgICBzaG93SGlkZGVuRmllbGRzOiB0cnVlXG4gICAgfSlcblxuICAgIGlmICghYWNjb3VudCB8fCAhYWNjb3VudC5wYXNzd29yZCkge1xuICAgICAgcmV0dXJuIGRvY1xuICAgIH1cblxuICAgIGNvbnN0IFtzYWx0LCBoYXNoXSA9IGFjY291bnQucGFzc3dvcmQuc3BsaXQoJzonKVxuXG4gICAgaWYgKCFzYWx0IHx8ICFoYXNoKSB7XG4gICAgICByZXR1cm4gZG9jXG4gICAgfVxuXG4gICAgY29uc3QgdXNlcklkID0gdHlwZW9mIGRvY1t1c2VyRmllbGRdID09PSAnb2JqZWN0JyA/IGRvY1t1c2VyRmllbGRdPy5pZCA6IGRvY1t1c2VyRmllbGRdXG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgcmVxLnBheWxvYWQudXBkYXRlKHtcbiAgICAgICAgY29sbGVjdGlvbjogdXNlclNsdWcsXG4gICAgICAgIGlkOiB1c2VySWQsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBzYWx0LFxuICAgICAgICAgIGhhc2hcbiAgICAgICAgfSxcbiAgICAgICAgcmVxLFxuICAgICAgICBjb250ZXh0OiB7IHN5bmNQYXNzd29yZFRvVXNlcjogdHJ1ZSB9XG4gICAgICB9KVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc3luYyBwYXNzd29yZCB0byB1c2VyOicsIGVycm9yKVxuICAgIH1cblxuICAgIHJldHVybiBkb2NcbiAgfVxuXG4gIHJldHVybiBob29rIGFzIENvbGxlY3Rpb25BZnRlckNoYW5nZUhvb2tcbn1cbiJdLCJuYW1lcyI6WyJiYU1vZGVsS2V5IiwiZ2V0U2NoZW1hQ29sbGVjdGlvblNsdWciLCJnZXRTY2hlbWFGaWVsZE5hbWUiLCJnZXRTeW5jUGFzc3dvcmRUb1VzZXJIb29rIiwicmVzb2x2ZWRTY2hlbWFzIiwiaG9vayIsImRvYyIsInJlcSIsIm9wZXJhdGlvbiIsImNvbnRleHQiLCJzeW5jQWNjb3VudEhvb2siLCJ1c2VyU2x1ZyIsInVzZXIiLCJhY2NvdW50U2x1ZyIsImFjY291bnQiLCJ1c2VyRmllbGQiLCJwYXlsb2FkIiwiZmluZEJ5SUQiLCJjb2xsZWN0aW9uIiwiaWQiLCJkZXB0aCIsInNob3dIaWRkZW5GaWVsZHMiLCJwYXNzd29yZCIsInNhbHQiLCJoYXNoIiwic3BsaXQiLCJ1c2VySWQiLCJ1cGRhdGUiLCJkYXRhIiwic3luY1Bhc3N3b3JkVG9Vc2VyIiwiZXJyb3IiLCJjb25zb2xlIl0sIm1hcHBpbmdzIjoiQUFFQSxTQUFTQSxVQUFVLFFBQVEsd0JBQWdDO0FBQzNELFNBQVNDLHVCQUF1QixFQUFFQyxrQkFBa0IsUUFBUSxnQ0FBK0I7QUFFM0YsT0FBTyxTQUFTQywwQkFBMEJDLGVBQWtDO0lBQzFFLE1BQU1DLE9BQWtDLE9BQU8sRUFBRUMsR0FBRyxFQUFFQyxHQUFHLEVBQUVDLFNBQVMsRUFBRUMsT0FBTyxFQUFFO1FBQzdFLElBQUlBLFNBQVNDLGlCQUFpQixPQUFPSjtRQUVyQyxJQUFJRSxjQUFjLFlBQVlBLGNBQWMsVUFBVTtZQUNwRCxPQUFPRjtRQUNUO1FBQ0EsTUFBTUssV0FBV1Ysd0JBQXdCRyxpQkFBaUJKLFdBQVdZLElBQUk7UUFDekUsTUFBTUMsY0FBY1osd0JBQXdCRyxpQkFBaUJKLFdBQVdjLE9BQU87UUFDL0UsTUFBTUMsWUFBWWIsbUJBQW1CRSxpQkFBaUJKLFdBQVdjLE9BQU8sRUFBRTtRQUUxRSxJQUFJLENBQUNSLEdBQUcsQ0FBQ1MsVUFBVSxFQUFFO1lBQ25CLE9BQU9UO1FBQ1Q7UUFFQSxNQUFNUSxVQUFVLE1BQU1QLElBQUlTLE9BQU8sQ0FBQ0MsUUFBUSxDQUFDO1lBQ3pDQyxZQUFZTDtZQUNaTSxJQUFJYixJQUFJYSxFQUFFO1lBQ1ZDLE9BQU87WUFDUGI7WUFDQWMsa0JBQWtCO1FBQ3BCO1FBRUEsSUFBSSxDQUFDUCxXQUFXLENBQUNBLFFBQVFRLFFBQVEsRUFBRTtZQUNqQyxPQUFPaEI7UUFDVDtRQUVBLE1BQU0sQ0FBQ2lCLE1BQU1DLEtBQUssR0FBR1YsUUFBUVEsUUFBUSxDQUFDRyxLQUFLLENBQUM7UUFFNUMsSUFBSSxDQUFDRixRQUFRLENBQUNDLE1BQU07WUFDbEIsT0FBT2xCO1FBQ1Q7UUFFQSxNQUFNb0IsU0FBUyxPQUFPcEIsR0FBRyxDQUFDUyxVQUFVLEtBQUssV0FBV1QsR0FBRyxDQUFDUyxVQUFVLEVBQUVJLEtBQUtiLEdBQUcsQ0FBQ1MsVUFBVTtRQUV2RixJQUFJO1lBQ0YsTUFBTVIsSUFBSVMsT0FBTyxDQUFDVyxNQUFNLENBQUM7Z0JBQ3ZCVCxZQUFZUDtnQkFDWlEsSUFBSU87Z0JBQ0pFLE1BQU07b0JBQ0pMO29CQUNBQztnQkFDRjtnQkFDQWpCO2dCQUNBRSxTQUFTO29CQUFFb0Isb0JBQW9CO2dCQUFLO1lBQ3RDO1FBQ0YsRUFBRSxPQUFPQyxPQUFPO1lBQ2RDLFFBQVFELEtBQUssQ0FBQyxvQ0FBb0NBO1FBQ3BEO1FBRUEsT0FBT3hCO0lBQ1Q7SUFFQSxPQUFPRDtBQUNUIn0=