/**
 * User-related utility functions for the Clerk plugin
 */ /**
 * Find a user in Payload by their Clerk ID or primary email
 */ export async function findUserFromClerkUser({ payload, userSlug, clerkUser }) {
    const primaryEmailObj = clerkUser.email_addresses?.find((email)=>email.id === clerkUser.primary_email_address_id);
    const primaryEmail = primaryEmailObj?.email_address;
    return payload.find({
        collection: userSlug,
        where: {
            or: [
                {
                    clerkId: {
                        equals: clerkUser.id
                    }
                },
                primaryEmail ? {
                    email: {
                        equals: primaryEmail
                    }
                } : undefined
            ].filter(Boolean)
        }
    });
}
/**
 * Get a user by their Clerk ID
 * Returns the first user found or null if not found
 */ export async function getUserByClerkId(payload, userSlug, clerkId) {
    if (!clerkId) return null;
    try {
        const result = await findUserFromClerkUser({
            payload,
            userSlug,
            clerkUser: {
                id: clerkId
            }
        });
        return result.docs.length > 0 ? result.docs[0] : null;
    } catch (error) {
        console.error('Error finding user by Clerk ID:', error);
        return null;
    }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGVyay91dGlscy91c2VyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVXNlci1yZWxhdGVkIHV0aWxpdHkgZnVuY3Rpb25zIGZvciB0aGUgQ2xlcmsgcGx1Z2luXG4gKi9cblxuLyoqXG4gKiBGaW5kIGEgdXNlciBpbiBQYXlsb2FkIGJ5IHRoZWlyIENsZXJrIElEIG9yIHByaW1hcnkgZW1haWxcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZpbmRVc2VyRnJvbUNsZXJrVXNlcih7IHBheWxvYWQsIHVzZXJTbHVnLCBjbGVya1VzZXIgfTogeyBwYXlsb2FkOiBhbnk7IHVzZXJTbHVnOiBzdHJpbmc7IGNsZXJrVXNlcjogYW55IH0pIHtcbiAgY29uc3QgcHJpbWFyeUVtYWlsT2JqID0gY2xlcmtVc2VyLmVtYWlsX2FkZHJlc3Nlcz8uZmluZCgoZW1haWw6IGFueSkgPT4gZW1haWwuaWQgPT09IGNsZXJrVXNlci5wcmltYXJ5X2VtYWlsX2FkZHJlc3NfaWQpXG5cbiAgY29uc3QgcHJpbWFyeUVtYWlsID0gcHJpbWFyeUVtYWlsT2JqPy5lbWFpbF9hZGRyZXNzXG5cbiAgcmV0dXJuIHBheWxvYWQuZmluZCh7XG4gICAgY29sbGVjdGlvbjogdXNlclNsdWcsXG4gICAgd2hlcmU6IHtcbiAgICAgIG9yOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBjbGVya0lkOiB7XG4gICAgICAgICAgICBlcXVhbHM6IGNsZXJrVXNlci5pZFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgcHJpbWFyeUVtYWlsXG4gICAgICAgICAgPyB7XG4gICAgICAgICAgICAgIGVtYWlsOiB7XG4gICAgICAgICAgICAgICAgZXF1YWxzOiBwcmltYXJ5RW1haWxcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIDogdW5kZWZpbmVkXG4gICAgICBdLmZpbHRlcihCb29sZWFuKVxuICAgIH1cbiAgfSlcbn1cblxuLyoqXG4gKiBHZXQgYSB1c2VyIGJ5IHRoZWlyIENsZXJrIElEXG4gKiBSZXR1cm5zIHRoZSBmaXJzdCB1c2VyIGZvdW5kIG9yIG51bGwgaWYgbm90IGZvdW5kXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRVc2VyQnlDbGVya0lkKHBheWxvYWQ6IGFueSwgdXNlclNsdWc6IHN0cmluZywgY2xlcmtJZDogc3RyaW5nKSB7XG4gIGlmICghY2xlcmtJZCkgcmV0dXJuIG51bGxcblxuICB0cnkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGZpbmRVc2VyRnJvbUNsZXJrVXNlcih7XG4gICAgICBwYXlsb2FkLFxuICAgICAgdXNlclNsdWcsXG4gICAgICBjbGVya1VzZXI6IHsgaWQ6IGNsZXJrSWQgfVxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdC5kb2NzLmxlbmd0aCA+IDAgPyByZXN1bHQuZG9jc1swXSA6IG51bGxcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmaW5kaW5nIHVzZXIgYnkgQ2xlcmsgSUQ6JywgZXJyb3IpXG4gICAgcmV0dXJuIG51bGxcbiAgfVxufVxuIl0sIm5hbWVzIjpbImZpbmRVc2VyRnJvbUNsZXJrVXNlciIsInBheWxvYWQiLCJ1c2VyU2x1ZyIsImNsZXJrVXNlciIsInByaW1hcnlFbWFpbE9iaiIsImVtYWlsX2FkZHJlc3NlcyIsImZpbmQiLCJlbWFpbCIsImlkIiwicHJpbWFyeV9lbWFpbF9hZGRyZXNzX2lkIiwicHJpbWFyeUVtYWlsIiwiZW1haWxfYWRkcmVzcyIsImNvbGxlY3Rpb24iLCJ3aGVyZSIsIm9yIiwiY2xlcmtJZCIsImVxdWFscyIsInVuZGVmaW5lZCIsImZpbHRlciIsIkJvb2xlYW4iLCJnZXRVc2VyQnlDbGVya0lkIiwicmVzdWx0IiwiZG9jcyIsImxlbmd0aCIsImVycm9yIiwiY29uc29sZSJdLCJtYXBwaW5ncyI6IkFBQUE7O0NBRUMsR0FFRDs7Q0FFQyxHQUNELE9BQU8sZUFBZUEsc0JBQXNCLEVBQUVDLE9BQU8sRUFBRUMsUUFBUSxFQUFFQyxTQUFTLEVBQXNEO0lBQzlILE1BQU1DLGtCQUFrQkQsVUFBVUUsZUFBZSxFQUFFQyxLQUFLLENBQUNDLFFBQWVBLE1BQU1DLEVBQUUsS0FBS0wsVUFBVU0sd0JBQXdCO0lBRXZILE1BQU1DLGVBQWVOLGlCQUFpQk87SUFFdEMsT0FBT1YsUUFBUUssSUFBSSxDQUFDO1FBQ2xCTSxZQUFZVjtRQUNaVyxPQUFPO1lBQ0xDLElBQUk7Z0JBQ0Y7b0JBQ0VDLFNBQVM7d0JBQ1BDLFFBQVFiLFVBQVVLLEVBQUU7b0JBQ3RCO2dCQUNGO2dCQUNBRSxlQUNJO29CQUNFSCxPQUFPO3dCQUNMUyxRQUFRTjtvQkFDVjtnQkFDRixJQUNBTzthQUNMLENBQUNDLE1BQU0sQ0FBQ0M7UUFDWDtJQUNGO0FBQ0Y7QUFFQTs7O0NBR0MsR0FDRCxPQUFPLGVBQWVDLGlCQUFpQm5CLE9BQVksRUFBRUMsUUFBZ0IsRUFBRWEsT0FBZTtJQUNwRixJQUFJLENBQUNBLFNBQVMsT0FBTztJQUVyQixJQUFJO1FBQ0YsTUFBTU0sU0FBUyxNQUFNckIsc0JBQXNCO1lBQ3pDQztZQUNBQztZQUNBQyxXQUFXO2dCQUFFSyxJQUFJTztZQUFRO1FBQzNCO1FBQ0EsT0FBT00sT0FBT0MsSUFBSSxDQUFDQyxNQUFNLEdBQUcsSUFBSUYsT0FBT0MsSUFBSSxDQUFDLEVBQUUsR0FBRztJQUNuRCxFQUFFLE9BQU9FLE9BQU87UUFDZEMsUUFBUUQsS0FBSyxDQUFDLG1DQUFtQ0E7UUFDakQsT0FBTztJQUNUO0FBQ0YifQ==