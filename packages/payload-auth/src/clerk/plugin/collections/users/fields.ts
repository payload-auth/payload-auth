import type { Field } from 'payload'

/**
 * Clerk user fields to be added to the user collection
 */
export const clerkUserFields: Field[] = [
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
]
