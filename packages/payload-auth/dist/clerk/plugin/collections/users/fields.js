/**
 * Clerk user fields to be added to the user collection
 */ export const clerkUserFields = [
    {
        name: 'clerkId',
        type: 'text',
        unique: true,
        index: true,
        admin: {
            description: 'Clerk user ID',
            readOnly: true
        }
    },
    {
        name: 'emailVerified',
        type: 'checkbox',
        defaultValue: false,
        admin: {
            description: 'Whether the email is verified',
            readOnly: true
        }
    },
    {
        name: 'firstName',
        type: 'text',
        admin: {
            description: 'User first name'
        }
    },
    {
        name: 'lastName',
        type: 'text',
        admin: {
            description: 'User last name'
        }
    },
    {
        name: 'imageUrl',
        type: 'text',
        admin: {
            description: 'User profile image URL'
        }
    },
    {
        name: 'role',
        type: 'select',
        required: true,
        defaultValue: 'user',
        options: [
            {
                label: 'Admin',
                value: 'admin'
            },
            {
                label: 'User',
                value: 'user'
            }
        ],
        admin: {
            description: 'User role for access control'
        }
    },
    {
        name: 'lastSyncedAt',
        type: 'date',
        admin: {
            description: 'When the user was last synced with Clerk',
            readOnly: true
        }
    },
    {
        name: 'clerkPublicMetadata',
        type: 'json',
        admin: {
            description: 'Additional metadata from Clerk',
            readOnly: true
        }
    }
];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jbGVyay9wbHVnaW4vY29sbGVjdGlvbnMvdXNlcnMvZmllbGRzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgRmllbGQgfSBmcm9tICdwYXlsb2FkJ1xuXG4vKipcbiAqIENsZXJrIHVzZXIgZmllbGRzIHRvIGJlIGFkZGVkIHRvIHRoZSB1c2VyIGNvbGxlY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGNsZXJrVXNlckZpZWxkczogRmllbGRbXSA9IFtcbiAge1xuICAgIG5hbWU6ICdjbGVya0lkJyxcbiAgICB0eXBlOiAndGV4dCcsXG4gICAgdW5pcXVlOiB0cnVlLFxuICAgIGluZGV4OiB0cnVlLFxuICAgIGFkbWluOiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ0NsZXJrIHVzZXIgSUQnLFxuICAgICAgcmVhZE9ubHk6IHRydWVcbiAgICB9XG4gIH0sXG4gIHtcbiAgICBuYW1lOiAnZW1haWxWZXJpZmllZCcsXG4gICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICBkZWZhdWx0VmFsdWU6IGZhbHNlLFxuICAgIGFkbWluOiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1doZXRoZXIgdGhlIGVtYWlsIGlzIHZlcmlmaWVkJyxcbiAgICAgIHJlYWRPbmx5OiB0cnVlXG4gICAgfVxuICB9LFxuICB7XG4gICAgbmFtZTogJ2ZpcnN0TmFtZScsXG4gICAgdHlwZTogJ3RleHQnLFxuICAgIGFkbWluOiB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1VzZXIgZmlyc3QgbmFtZSdcbiAgICB9XG4gIH0sXG4gIHtcbiAgICBuYW1lOiAnbGFzdE5hbWUnLFxuICAgIHR5cGU6ICd0ZXh0JyxcbiAgICBhZG1pbjoge1xuICAgICAgZGVzY3JpcHRpb246ICdVc2VyIGxhc3QgbmFtZSdcbiAgICB9XG4gIH0sXG4gIHtcbiAgICBuYW1lOiAnaW1hZ2VVcmwnLFxuICAgIHR5cGU6ICd0ZXh0JyxcbiAgICBhZG1pbjoge1xuICAgICAgZGVzY3JpcHRpb246ICdVc2VyIHByb2ZpbGUgaW1hZ2UgVVJMJ1xuICAgIH1cbiAgfSxcbiAge1xuICAgIG5hbWU6ICdyb2xlJyxcbiAgICB0eXBlOiAnc2VsZWN0JyxcbiAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICBkZWZhdWx0VmFsdWU6ICd1c2VyJyxcbiAgICBvcHRpb25zOiBbXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnQWRtaW4nLFxuICAgICAgICB2YWx1ZTogJ2FkbWluJ1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdVc2VyJyxcbiAgICAgICAgdmFsdWU6ICd1c2VyJ1xuICAgICAgfVxuICAgIF0sXG4gICAgYWRtaW46IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnVXNlciByb2xlIGZvciBhY2Nlc3MgY29udHJvbCdcbiAgICB9XG4gIH0sXG4gIHtcbiAgICBuYW1lOiAnbGFzdFN5bmNlZEF0JyxcbiAgICB0eXBlOiAnZGF0ZScsXG4gICAgYWRtaW46IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnV2hlbiB0aGUgdXNlciB3YXMgbGFzdCBzeW5jZWQgd2l0aCBDbGVyaycsXG4gICAgICByZWFkT25seTogdHJ1ZVxuICAgIH1cbiAgfSxcbiAge1xuICAgIG5hbWU6ICdjbGVya1B1YmxpY01ldGFkYXRhJyxcbiAgICB0eXBlOiAnanNvbicsXG4gICAgYWRtaW46IHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnQWRkaXRpb25hbCBtZXRhZGF0YSBmcm9tIENsZXJrJyxcbiAgICAgIHJlYWRPbmx5OiB0cnVlXG4gICAgfVxuICB9XG5dXG4iXSwibmFtZXMiOlsiY2xlcmtVc2VyRmllbGRzIiwibmFtZSIsInR5cGUiLCJ1bmlxdWUiLCJpbmRleCIsImFkbWluIiwiZGVzY3JpcHRpb24iLCJyZWFkT25seSIsImRlZmF1bHRWYWx1ZSIsInJlcXVpcmVkIiwib3B0aW9ucyIsImxhYmVsIiwidmFsdWUiXSwibWFwcGluZ3MiOiJBQUVBOztDQUVDLEdBQ0QsT0FBTyxNQUFNQSxrQkFBMkI7SUFDdEM7UUFDRUMsTUFBTTtRQUNOQyxNQUFNO1FBQ05DLFFBQVE7UUFDUkMsT0FBTztRQUNQQyxPQUFPO1lBQ0xDLGFBQWE7WUFDYkMsVUFBVTtRQUNaO0lBQ0Y7SUFDQTtRQUNFTixNQUFNO1FBQ05DLE1BQU07UUFDTk0sY0FBYztRQUNkSCxPQUFPO1lBQ0xDLGFBQWE7WUFDYkMsVUFBVTtRQUNaO0lBQ0Y7SUFDQTtRQUNFTixNQUFNO1FBQ05DLE1BQU07UUFDTkcsT0FBTztZQUNMQyxhQUFhO1FBQ2Y7SUFDRjtJQUNBO1FBQ0VMLE1BQU07UUFDTkMsTUFBTTtRQUNORyxPQUFPO1lBQ0xDLGFBQWE7UUFDZjtJQUNGO0lBQ0E7UUFDRUwsTUFBTTtRQUNOQyxNQUFNO1FBQ05HLE9BQU87WUFDTEMsYUFBYTtRQUNmO0lBQ0Y7SUFDQTtRQUNFTCxNQUFNO1FBQ05DLE1BQU07UUFDTk8sVUFBVTtRQUNWRCxjQUFjO1FBQ2RFLFNBQVM7WUFDUDtnQkFDRUMsT0FBTztnQkFDUEMsT0FBTztZQUNUO1lBQ0E7Z0JBQ0VELE9BQU87Z0JBQ1BDLE9BQU87WUFDVDtTQUNEO1FBQ0RQLE9BQU87WUFDTEMsYUFBYTtRQUNmO0lBQ0Y7SUFDQTtRQUNFTCxNQUFNO1FBQ05DLE1BQU07UUFDTkcsT0FBTztZQUNMQyxhQUFhO1lBQ2JDLFVBQVU7UUFDWjtJQUNGO0lBQ0E7UUFDRU4sTUFBTTtRQUNOQyxNQUFNO1FBQ05HLE9BQU87WUFDTEMsYUFBYTtZQUNiQyxVQUFVO1FBQ1o7SUFDRjtDQUNELENBQUEifQ==