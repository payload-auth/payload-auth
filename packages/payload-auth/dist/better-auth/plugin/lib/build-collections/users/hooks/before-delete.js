import { baModelKey } from "../../../../constants";
import { getCollectionByModelKey } from "../../../../helpers/get-collection";
import { commitTransaction, initTransaction, killTransaction } from "payload";
export function getBeforeDeleteHook() {
    const hook = async ({ req, id })=>{
        const collections = req.payload.collections;
        const accountsSlug = getCollectionByModelKey(collections, baModelKey.account).slug;
        const sessionsSlug = getCollectionByModelKey(collections, baModelKey.session).slug;
        const verificationsSlug = getCollectionByModelKey(collections, baModelKey.verification).slug;
        try {
            const { payload } = req;
            const userId = id;
            const shouldCommit = await initTransaction(req);
            await payload.delete({
                collection: accountsSlug,
                where: {
                    user: {
                        equals: userId
                    }
                },
                req
            });
            await payload.delete({
                collection: sessionsSlug,
                where: {
                    user: {
                        equals: userId
                    }
                },
                req
            });
            await payload.delete({
                collection: verificationsSlug,
                where: {
                    value: {
                        like: `"${userId}"`
                    }
                },
                req
            });
            if (shouldCommit) {
                await commitTransaction(req);
            }
            return;
        } catch (error) {
            await killTransaction(req);
            console.error('Error in user afterDelete hook:', error);
            return;
        }
    };
    return hook;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3VzZXJzL2hvb2tzL2JlZm9yZS1kZWxldGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYmFNb2RlbEtleSB9IGZyb20gJ0AvYmV0dGVyLWF1dGgvcGx1Z2luL2NvbnN0YW50cydcbmltcG9ydCB7IGdldENvbGxlY3Rpb25CeU1vZGVsS2V5IH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vaGVscGVycy9nZXQtY29sbGVjdGlvbidcbmltcG9ydCB7IGNvbW1pdFRyYW5zYWN0aW9uLCBpbml0VHJhbnNhY3Rpb24sIGtpbGxUcmFuc2FjdGlvbiwgdHlwZSBDb2xsZWN0aW9uQmVmb3JlRGVsZXRlSG9vayB9IGZyb20gJ3BheWxvYWQnXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRCZWZvcmVEZWxldGVIb29rKCk6IENvbGxlY3Rpb25CZWZvcmVEZWxldGVIb29rIHtcbiAgY29uc3QgaG9vazogQ29sbGVjdGlvbkJlZm9yZURlbGV0ZUhvb2sgPSBhc3luYyAoeyByZXEsIGlkIH0pID0+IHtcbiAgICBjb25zdCBjb2xsZWN0aW9ucyA9IHJlcS5wYXlsb2FkLmNvbGxlY3Rpb25zXG4gICAgY29uc3QgYWNjb3VudHNTbHVnID0gZ2V0Q29sbGVjdGlvbkJ5TW9kZWxLZXkoY29sbGVjdGlvbnMsIGJhTW9kZWxLZXkuYWNjb3VudCkuc2x1Z1xuICAgIGNvbnN0IHNlc3Npb25zU2x1ZyA9IGdldENvbGxlY3Rpb25CeU1vZGVsS2V5KGNvbGxlY3Rpb25zLCBiYU1vZGVsS2V5LnNlc3Npb24pLnNsdWdcbiAgICBjb25zdCB2ZXJpZmljYXRpb25zU2x1ZyA9IGdldENvbGxlY3Rpb25CeU1vZGVsS2V5KGNvbGxlY3Rpb25zLCBiYU1vZGVsS2V5LnZlcmlmaWNhdGlvbikuc2x1Z1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IHBheWxvYWQgfSA9IHJlcVxuICAgICAgY29uc3QgdXNlcklkID0gaWRcblxuICAgICAgY29uc3Qgc2hvdWxkQ29tbWl0ID0gYXdhaXQgaW5pdFRyYW5zYWN0aW9uKHJlcSlcblxuICAgICAgYXdhaXQgcGF5bG9hZC5kZWxldGUoe1xuICAgICAgICBjb2xsZWN0aW9uOiBhY2NvdW50c1NsdWcsXG4gICAgICAgIHdoZXJlOiB7XG4gICAgICAgICAgdXNlcjoge1xuICAgICAgICAgICAgZXF1YWxzOiB1c2VySWRcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHJlcVxuICAgICAgfSlcblxuICAgICAgYXdhaXQgcGF5bG9hZC5kZWxldGUoe1xuICAgICAgICBjb2xsZWN0aW9uOiBzZXNzaW9uc1NsdWcsXG4gICAgICAgIHdoZXJlOiB7XG4gICAgICAgICAgdXNlcjoge1xuICAgICAgICAgICAgZXF1YWxzOiB1c2VySWRcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHJlcVxuICAgICAgfSlcblxuICAgICAgYXdhaXQgcGF5bG9hZC5kZWxldGUoe1xuICAgICAgICBjb2xsZWN0aW9uOiB2ZXJpZmljYXRpb25zU2x1ZyxcbiAgICAgICAgd2hlcmU6IHtcbiAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgbGlrZTogYFwiJHt1c2VySWR9XCJgXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICByZXFcbiAgICAgIH0pXG5cbiAgICAgIGlmIChzaG91bGRDb21taXQpIHtcbiAgICAgICAgYXdhaXQgY29tbWl0VHJhbnNhY3Rpb24ocmVxKVxuICAgICAgfVxuXG4gICAgICByZXR1cm5cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgYXdhaXQga2lsbFRyYW5zYWN0aW9uKHJlcSlcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIHVzZXIgYWZ0ZXJEZWxldGUgaG9vazonLCBlcnJvcilcbiAgICAgIHJldHVyblxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBob29rXG59XG4iXSwibmFtZXMiOlsiYmFNb2RlbEtleSIsImdldENvbGxlY3Rpb25CeU1vZGVsS2V5IiwiY29tbWl0VHJhbnNhY3Rpb24iLCJpbml0VHJhbnNhY3Rpb24iLCJraWxsVHJhbnNhY3Rpb24iLCJnZXRCZWZvcmVEZWxldGVIb29rIiwiaG9vayIsInJlcSIsImlkIiwiY29sbGVjdGlvbnMiLCJwYXlsb2FkIiwiYWNjb3VudHNTbHVnIiwiYWNjb3VudCIsInNsdWciLCJzZXNzaW9uc1NsdWciLCJzZXNzaW9uIiwidmVyaWZpY2F0aW9uc1NsdWciLCJ2ZXJpZmljYXRpb24iLCJ1c2VySWQiLCJzaG91bGRDb21taXQiLCJkZWxldGUiLCJjb2xsZWN0aW9uIiwid2hlcmUiLCJ1c2VyIiwiZXF1YWxzIiwidmFsdWUiLCJsaWtlIiwiZXJyb3IiLCJjb25zb2xlIl0sIm1hcHBpbmdzIjoiQUFBQSxTQUFTQSxVQUFVLFFBQVEsd0JBQWdDO0FBQzNELFNBQVNDLHVCQUF1QixRQUFRLHFDQUE2QztBQUNyRixTQUFTQyxpQkFBaUIsRUFBRUMsZUFBZSxFQUFFQyxlQUFlLFFBQXlDLFVBQVM7QUFFOUcsT0FBTyxTQUFTQztJQUNkLE1BQU1DLE9BQW1DLE9BQU8sRUFBRUMsR0FBRyxFQUFFQyxFQUFFLEVBQUU7UUFDekQsTUFBTUMsY0FBY0YsSUFBSUcsT0FBTyxDQUFDRCxXQUFXO1FBQzNDLE1BQU1FLGVBQWVWLHdCQUF3QlEsYUFBYVQsV0FBV1ksT0FBTyxFQUFFQyxJQUFJO1FBQ2xGLE1BQU1DLGVBQWViLHdCQUF3QlEsYUFBYVQsV0FBV2UsT0FBTyxFQUFFRixJQUFJO1FBQ2xGLE1BQU1HLG9CQUFvQmYsd0JBQXdCUSxhQUFhVCxXQUFXaUIsWUFBWSxFQUFFSixJQUFJO1FBQzVGLElBQUk7WUFDRixNQUFNLEVBQUVILE9BQU8sRUFBRSxHQUFHSDtZQUNwQixNQUFNVyxTQUFTVjtZQUVmLE1BQU1XLGVBQWUsTUFBTWhCLGdCQUFnQkk7WUFFM0MsTUFBTUcsUUFBUVUsTUFBTSxDQUFDO2dCQUNuQkMsWUFBWVY7Z0JBQ1pXLE9BQU87b0JBQ0xDLE1BQU07d0JBQ0pDLFFBQVFOO29CQUNWO2dCQUNGO2dCQUNBWDtZQUNGO1lBRUEsTUFBTUcsUUFBUVUsTUFBTSxDQUFDO2dCQUNuQkMsWUFBWVA7Z0JBQ1pRLE9BQU87b0JBQ0xDLE1BQU07d0JBQ0pDLFFBQVFOO29CQUNWO2dCQUNGO2dCQUNBWDtZQUNGO1lBRUEsTUFBTUcsUUFBUVUsTUFBTSxDQUFDO2dCQUNuQkMsWUFBWUw7Z0JBQ1pNLE9BQU87b0JBQ0xHLE9BQU87d0JBQ0xDLE1BQU0sQ0FBQyxDQUFDLEVBQUVSLE9BQU8sQ0FBQyxDQUFDO29CQUNyQjtnQkFDRjtnQkFDQVg7WUFDRjtZQUVBLElBQUlZLGNBQWM7Z0JBQ2hCLE1BQU1qQixrQkFBa0JLO1lBQzFCO1lBRUE7UUFDRixFQUFFLE9BQU9vQixPQUFPO1lBQ2QsTUFBTXZCLGdCQUFnQkc7WUFDdEJxQixRQUFRRCxLQUFLLENBQUMsbUNBQW1DQTtZQUNqRDtRQUNGO0lBQ0Y7SUFFQSxPQUFPckI7QUFDVCJ9