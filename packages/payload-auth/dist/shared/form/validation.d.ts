import { z } from 'zod';
/**
 * Minimal translation function type extracted from `i18next`.
 * Accepts a key and returns the translated string.
 */
export type Translate = (...args: any[]) => string;
export declare const emailField: ({ t, required }: {
    t: Translate;
    required?: boolean;
}) => z.ZodEffects<z.ZodString, string, string>;
export declare const usernameField: ({ t, required }: {
    t: Translate;
    required?: boolean;
}) => z.ZodEffects<z.ZodString, string, string>;
export declare const passwordField: ({ t, required, minLength }: {
    t: Translate;
    required?: boolean;
    minLength?: number;
}) => z.ZodString;
export declare const confirmPasswordField: ({ t, required }: {
    t: Translate;
    required?: boolean;
}) => z.ZodString;
/**
 * Returns a Zod object schema with `password` and `confirmPassword` fields
 * and a refinement that ensures they match.
 */
export declare const passwordWithConfirmation: ({ t, minLength }: {
    t: Translate;
    minLength?: number;
}) => z.ZodEffects<z.ZodObject<{
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    confirmPassword: string;
}, {
    password: string;
    confirmPassword: string;
}>, {
    password: string;
    confirmPassword: string;
}, {
    password: string;
    confirmPassword: string;
}>;
export declare const isValidEmail: (val: string) => boolean;
export declare const isValidUsername: (val: string, { minLength, maxLength }?: {
    minLength?: number;
    maxLength?: number;
}) => boolean;
type UsernameSettings = {
    minLength: number;
    maxLength: number;
};
export declare const createLoginSchema: ({ t, loginType, canLoginWithUsername, usernameSettings }: {
    t: Translate;
    loginType: "email" | "username" | "emailOrUsername";
    canLoginWithUsername?: boolean;
    usernameSettings?: UsernameSettings;
}) => z.ZodObject<{
    login: z.ZodEffects<z.ZodString, string, string>;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    login: string;
}, {
    password: string;
    login: string;
}>;
export declare const createSignupSchema: ({ t, requireUsername, requireConfirmPassword }: {
    t: Translate;
    requireUsername?: boolean;
    requireConfirmPassword?: boolean;
}) => z.ZodObject<{
    name: z.ZodString;
    email: z.ZodEffects<z.ZodString, string, string>;
    username: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    password: z.ZodString;
    confirmPassword: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
    username?: string | undefined;
    confirmPassword?: string | undefined;
}, {
    name: string;
    email: string;
    password: string;
    username?: string | undefined;
    confirmPassword?: string | undefined;
}> | z.ZodEffects<z.ZodObject<{
    name: z.ZodString;
    email: z.ZodEffects<z.ZodString, string, string>;
    username: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    password: z.ZodString;
    confirmPassword: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
    username?: string | undefined;
    confirmPassword?: string | undefined;
}, {
    name: string;
    email: string;
    password: string;
    username?: string | undefined;
    confirmPassword?: string | undefined;
}>, {
    name: string;
    email: string;
    password: string;
    username?: string | undefined;
    confirmPassword?: string | undefined;
}, {
    name: string;
    email: string;
    password: string;
    username?: string | undefined;
    confirmPassword?: string | undefined;
}>;
export {};
//# sourceMappingURL=validation.d.ts.map