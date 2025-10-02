import type { Access, FieldAccess } from 'payload';
export type AdminRolesConfig = {
    adminRoles?: string[];
};
export type AdminOrCurrentUserConfig = AdminRolesConfig & {
    idField?: string;
};
export type AdminOrCurrentUserUpdateConfig = AdminOrCurrentUserConfig & {
    allowedFields?: string[];
    userSlug: string;
};
export declare const isAdminWithRoles: (config?: AdminRolesConfig) => FieldAccess;
export declare const isAdminOrCurrentUserWithRoles: (config?: AdminOrCurrentUserConfig) => Access;
export declare const isAdminOrCurrentUserUpdateWithAllowedFields: (config: AdminOrCurrentUserUpdateConfig) => Access;
//# sourceMappingURL=payload-access.d.ts.map