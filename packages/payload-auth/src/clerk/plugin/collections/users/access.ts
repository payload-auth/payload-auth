import type { Access, PayloadRequest } from 'payload'

const isAdmin = (req: any, adminRoles: string[]): boolean => {
  return Boolean(req.user && adminRoles.includes(req.user.role as string))
}

const isCurrentUser = (req: PayloadRequest) => {
  return {
    id: {
      equals: req.user?.id,
    }
  }
}

export const getReadAccess = ({ adminRoles }: { adminRoles: string[] }): Access => {
  return ({ req }) => {
    if (!req.user) return false
    
    if (isAdmin(req, adminRoles)) {
      return true
    }
    
    return isCurrentUser(req)
  }
}

export const getCreateAccess = ({ adminRoles }: { adminRoles: string[] }): Access => {
  return ({ req }) => {
    return isAdmin(req, adminRoles)
  }
}

export const getUpdateAccess = ({ adminRoles }: { adminRoles: string[] }): Access => {
  return ({ req }) => {
    return isAdmin(req, adminRoles)
  }
}

export const getDeleteAccess = ({ adminRoles }: { adminRoles: string[] }): Access => {
  return ({ req }) => {
    return isAdmin(req, adminRoles)
  }
}
