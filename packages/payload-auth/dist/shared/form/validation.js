import { z } from "zod";
import { emailRegex, usernameRegex } from "../utils/regex";
// ---------------------------------------------------------------------------
// Field builders
// ---------------------------------------------------------------------------
export const emailField = ({ t, required = true })=>{
    let schema = z.string();
    if (required) schema = schema.min(1, t('validation:required'));
    return schema.refine((val)=>emailRegex.test(val), {
        message: t('authentication:emailNotValid') || 'Email is not valid'
    });
};
export const usernameField = ({ t, required = true })=>{
    let schema = z.string();
    if (required) schema = schema.min(1, t('validation:required'));
    return schema.refine((val)=>usernameRegex.test(val), {
        message: t('authentication:usernameNotValid') || 'Username is not valid'
    });
};
export const passwordField = ({ t, required = true, minLength = 1 })=>{
    let schema = z.string();
    if (required) schema = schema.min(minLength, t('validation:required') || 'Password is required');
    return schema;
};
export const confirmPasswordField = ({ t, required = true })=>{
    let schema = z.string();
    if (required) schema = schema.min(1, t('validation:required') || 'Confirm password is required');
    return schema;
};
// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
/**
 * Returns a Zod object schema with `password` and `confirmPassword` fields
 * and a refinement that ensures they match.
 */ export const passwordWithConfirmation = ({ t, minLength = 1 })=>z.object({
        password: passwordField({
            t,
            minLength
        }),
        confirmPassword: confirmPasswordField({
            t
        })
    }).refine((data)=>data.password === data.confirmPassword, {
        path: [
            'confirmPassword'
        ],
        message: t('fields:passwordsDoNotMatch') || 'Passwords do not match'
    });
// ---------------------------------------------------------------------------
// Utility validators (non‑Zod) — handy for dynamic login field checks
// ---------------------------------------------------------------------------
export const isValidEmail = (val)=>emailRegex.test(val);
export const isValidUsername = (val, { minLength = 5, maxLength = 128 } = {})=>usernameRegex.test(val) && val.length >= minLength && val.length <= maxLength;
export const createLoginSchema = ({ t, loginType, canLoginWithUsername = false, usernameSettings = {
    minLength: 5,
    maxLength: 128
} })=>z.object({
        login: z.string().superRefine((val, ctx)=>{
            if (!val) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: t('validation:required')
                });
                return;
            }
            let isValid = false;
            if (loginType === 'email') {
                isValid = isValidEmail(val);
            } else if (loginType === 'username') {
                isValid = isValidUsername(val, usernameSettings);
            } else {
                isValid = isValidEmail(val) || isValidUsername(val, usernameSettings);
            }
            if (!isValid) {
                const isProbablyEmail = val.includes('@') || !canLoginWithUsername;
                let message = '';
                if (loginType === 'email') {
                    message = t('authentication:emailNotValid') || 'Email is not valid';
                } else if (loginType === 'username') {
                    message = t('authentication:usernameNotValid') || 'Username is not valid';
                } else {
                    message = isProbablyEmail ? t('authentication:emailNotValid') || 'Email is not valid' : t('authentication:usernameNotValid') || 'Username is not valid';
                }
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message
                });
            }
        }),
        password: passwordField({
            t
        })
    });
export const createSignupSchema = ({ t, requireUsername = false, requireConfirmPassword = false })=>{
    const schema = z.object({
        name: z.string({
            message: 'Name is required'
        }).min(1),
        email: emailField({
            t
        }),
        username: usernameField({
            t,
            required: requireUsername
        }).optional(),
        password: passwordField({
            t
        }),
        confirmPassword: confirmPasswordField({
            t,
            required: requireConfirmPassword
        }).optional()
    });
    if (!requireConfirmPassword) return schema;
    return schema.refine((data)=>data.password === data.confirmPassword, {
        path: [
            'confirmPassword'
        ],
        message: t('fields:passwordsDoNotMatch') || 'Passwords do not match'
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zaGFyZWQvZm9ybS92YWxpZGF0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHogfSBmcm9tICd6b2QnXG5cbmltcG9ydCB7IGVtYWlsUmVnZXgsIHVzZXJuYW1lUmVnZXggfSBmcm9tICdAL3NoYXJlZC91dGlscy9yZWdleCdcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBUeXBlc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogTWluaW1hbCB0cmFuc2xhdGlvbiBmdW5jdGlvbiB0eXBlIGV4dHJhY3RlZCBmcm9tIGBpMThuZXh0YC5cbiAqIEFjY2VwdHMgYSBrZXkgYW5kIHJldHVybnMgdGhlIHRyYW5zbGF0ZWQgc3RyaW5nLlxuICovXG5leHBvcnQgdHlwZSBUcmFuc2xhdGUgPSAoLi4uYXJnczogYW55W10pID0+IHN0cmluZ1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZpZWxkIGJ1aWxkZXJzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZXhwb3J0IGNvbnN0IGVtYWlsRmllbGQgPSAoeyB0LCByZXF1aXJlZCA9IHRydWUgfTogeyB0OiBUcmFuc2xhdGU7IHJlcXVpcmVkPzogYm9vbGVhbiB9KSA9PiB7XG4gIGxldCBzY2hlbWEgPSB6LnN0cmluZygpXG4gIGlmIChyZXF1aXJlZCkgc2NoZW1hID0gc2NoZW1hLm1pbigxLCB0KCd2YWxpZGF0aW9uOnJlcXVpcmVkJykpXG4gIHJldHVybiBzY2hlbWEucmVmaW5lKCh2YWwpID0+IGVtYWlsUmVnZXgudGVzdCh2YWwpLCB7XG4gICAgbWVzc2FnZTogdCgnYXV0aGVudGljYXRpb246ZW1haWxOb3RWYWxpZCcpIHx8ICdFbWFpbCBpcyBub3QgdmFsaWQnXG4gIH0pXG59XG5cbmV4cG9ydCBjb25zdCB1c2VybmFtZUZpZWxkID0gKHsgdCwgcmVxdWlyZWQgPSB0cnVlIH06IHsgdDogVHJhbnNsYXRlOyByZXF1aXJlZD86IGJvb2xlYW4gfSkgPT4ge1xuICBsZXQgc2NoZW1hID0gei5zdHJpbmcoKVxuICBpZiAocmVxdWlyZWQpIHNjaGVtYSA9IHNjaGVtYS5taW4oMSwgdCgndmFsaWRhdGlvbjpyZXF1aXJlZCcpKVxuICByZXR1cm4gc2NoZW1hLnJlZmluZSgodmFsKSA9PiB1c2VybmFtZVJlZ2V4LnRlc3QodmFsKSwge1xuICAgIG1lc3NhZ2U6IHQoJ2F1dGhlbnRpY2F0aW9uOnVzZXJuYW1lTm90VmFsaWQnKSB8fCAnVXNlcm5hbWUgaXMgbm90IHZhbGlkJ1xuICB9KVxufVxuXG5leHBvcnQgY29uc3QgcGFzc3dvcmRGaWVsZCA9ICh7IHQsIHJlcXVpcmVkID0gdHJ1ZSwgbWluTGVuZ3RoID0gMSB9OiB7IHQ6IFRyYW5zbGF0ZTsgcmVxdWlyZWQ/OiBib29sZWFuOyBtaW5MZW5ndGg/OiBudW1iZXIgfSkgPT4ge1xuICBsZXQgc2NoZW1hID0gei5zdHJpbmcoKVxuICBpZiAocmVxdWlyZWQpIHNjaGVtYSA9IHNjaGVtYS5taW4obWluTGVuZ3RoLCB0KCd2YWxpZGF0aW9uOnJlcXVpcmVkJykgfHwgJ1Bhc3N3b3JkIGlzIHJlcXVpcmVkJylcbiAgcmV0dXJuIHNjaGVtYVxufVxuXG5leHBvcnQgY29uc3QgY29uZmlybVBhc3N3b3JkRmllbGQgPSAoeyB0LCByZXF1aXJlZCA9IHRydWUgfTogeyB0OiBUcmFuc2xhdGU7IHJlcXVpcmVkPzogYm9vbGVhbiB9KSA9PiB7XG4gIGxldCBzY2hlbWEgPSB6LnN0cmluZygpXG4gIGlmIChyZXF1aXJlZCkgc2NoZW1hID0gc2NoZW1hLm1pbigxLCB0KCd2YWxpZGF0aW9uOnJlcXVpcmVkJykgfHwgJ0NvbmZpcm0gcGFzc3dvcmQgaXMgcmVxdWlyZWQnKVxuICByZXR1cm4gc2NoZW1hXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQ29tcG9zYWJsZXNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFJldHVybnMgYSBab2Qgb2JqZWN0IHNjaGVtYSB3aXRoIGBwYXNzd29yZGAgYW5kIGBjb25maXJtUGFzc3dvcmRgIGZpZWxkc1xuICogYW5kIGEgcmVmaW5lbWVudCB0aGF0IGVuc3VyZXMgdGhleSBtYXRjaC5cbiAqL1xuZXhwb3J0IGNvbnN0IHBhc3N3b3JkV2l0aENvbmZpcm1hdGlvbiA9ICh7IHQsIG1pbkxlbmd0aCA9IDEgfTogeyB0OiBUcmFuc2xhdGU7IG1pbkxlbmd0aD86IG51bWJlciB9KSA9PlxuICB6XG4gICAgLm9iamVjdCh7XG4gICAgICBwYXNzd29yZDogcGFzc3dvcmRGaWVsZCh7IHQsIG1pbkxlbmd0aCB9KSxcbiAgICAgIGNvbmZpcm1QYXNzd29yZDogY29uZmlybVBhc3N3b3JkRmllbGQoeyB0IH0pXG4gICAgfSlcbiAgICAucmVmaW5lKChkYXRhKSA9PiBkYXRhLnBhc3N3b3JkID09PSBkYXRhLmNvbmZpcm1QYXNzd29yZCwge1xuICAgICAgcGF0aDogWydjb25maXJtUGFzc3dvcmQnXSxcbiAgICAgIG1lc3NhZ2U6IHQoJ2ZpZWxkczpwYXNzd29yZHNEb05vdE1hdGNoJykgfHwgJ1Bhc3N3b3JkcyBkbyBub3QgbWF0Y2gnXG4gICAgfSlcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBVdGlsaXR5IHZhbGlkYXRvcnMgKG5vbuKAkVpvZCkg4oCUIGhhbmR5IGZvciBkeW5hbWljIGxvZ2luIGZpZWxkIGNoZWNrc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmV4cG9ydCBjb25zdCBpc1ZhbGlkRW1haWwgPSAodmFsOiBzdHJpbmcpID0+IGVtYWlsUmVnZXgudGVzdCh2YWwpXG5leHBvcnQgY29uc3QgaXNWYWxpZFVzZXJuYW1lID0gKHZhbDogc3RyaW5nLCB7IG1pbkxlbmd0aCA9IDUsIG1heExlbmd0aCA9IDEyOCB9OiB7IG1pbkxlbmd0aD86IG51bWJlcjsgbWF4TGVuZ3RoPzogbnVtYmVyIH0gPSB7fSkgPT5cbiAgdXNlcm5hbWVSZWdleC50ZXN0KHZhbCkgJiYgdmFsLmxlbmd0aCA+PSBtaW5MZW5ndGggJiYgdmFsLmxlbmd0aCA8PSBtYXhMZW5ndGhcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBTY2hlbWEgYnVpbGRlcnNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG50eXBlIFVzZXJuYW1lU2V0dGluZ3MgPSB7IG1pbkxlbmd0aDogbnVtYmVyOyBtYXhMZW5ndGg6IG51bWJlciB9XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVMb2dpblNjaGVtYSA9ICh7XG4gIHQsXG4gIGxvZ2luVHlwZSxcbiAgY2FuTG9naW5XaXRoVXNlcm5hbWUgPSBmYWxzZSxcbiAgdXNlcm5hbWVTZXR0aW5ncyA9IHsgbWluTGVuZ3RoOiA1LCBtYXhMZW5ndGg6IDEyOCB9XG59OiB7XG4gIHQ6IFRyYW5zbGF0ZVxuICBsb2dpblR5cGU6ICdlbWFpbCcgfCAndXNlcm5hbWUnIHwgJ2VtYWlsT3JVc2VybmFtZSdcbiAgY2FuTG9naW5XaXRoVXNlcm5hbWU/OiBib29sZWFuXG4gIHVzZXJuYW1lU2V0dGluZ3M/OiBVc2VybmFtZVNldHRpbmdzXG59KSA9PlxuICB6Lm9iamVjdCh7XG4gICAgbG9naW46IHouc3RyaW5nKCkuc3VwZXJSZWZpbmUoKHZhbCwgY3R4KSA9PiB7XG4gICAgICBpZiAoIXZhbCkge1xuICAgICAgICBjdHguYWRkSXNzdWUoe1xuICAgICAgICAgIGNvZGU6IHouWm9kSXNzdWVDb2RlLmN1c3RvbSxcbiAgICAgICAgICBtZXNzYWdlOiB0KCd2YWxpZGF0aW9uOnJlcXVpcmVkJylcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGxldCBpc1ZhbGlkID0gZmFsc2VcbiAgICAgIGlmIChsb2dpblR5cGUgPT09ICdlbWFpbCcpIHtcbiAgICAgICAgaXNWYWxpZCA9IGlzVmFsaWRFbWFpbCh2YWwpXG4gICAgICB9IGVsc2UgaWYgKGxvZ2luVHlwZSA9PT0gJ3VzZXJuYW1lJykge1xuICAgICAgICBpc1ZhbGlkID0gaXNWYWxpZFVzZXJuYW1lKHZhbCwgdXNlcm5hbWVTZXR0aW5ncylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlzVmFsaWQgPSBpc1ZhbGlkRW1haWwodmFsKSB8fCBpc1ZhbGlkVXNlcm5hbWUodmFsLCB1c2VybmFtZVNldHRpbmdzKVxuICAgICAgfVxuXG4gICAgICBpZiAoIWlzVmFsaWQpIHtcbiAgICAgICAgY29uc3QgaXNQcm9iYWJseUVtYWlsID0gdmFsLmluY2x1ZGVzKCdAJykgfHwgIWNhbkxvZ2luV2l0aFVzZXJuYW1lXG4gICAgICAgIGxldCBtZXNzYWdlID0gJydcblxuICAgICAgICBpZiAobG9naW5UeXBlID09PSAnZW1haWwnKSB7XG4gICAgICAgICAgbWVzc2FnZSA9IHQoJ2F1dGhlbnRpY2F0aW9uOmVtYWlsTm90VmFsaWQnKSB8fCAnRW1haWwgaXMgbm90IHZhbGlkJ1xuICAgICAgICB9IGVsc2UgaWYgKGxvZ2luVHlwZSA9PT0gJ3VzZXJuYW1lJykge1xuICAgICAgICAgIG1lc3NhZ2UgPSB0KCdhdXRoZW50aWNhdGlvbjp1c2VybmFtZU5vdFZhbGlkJykgfHwgJ1VzZXJuYW1lIGlzIG5vdCB2YWxpZCdcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtZXNzYWdlID0gaXNQcm9iYWJseUVtYWlsXG4gICAgICAgICAgICA/IHQoJ2F1dGhlbnRpY2F0aW9uOmVtYWlsTm90VmFsaWQnKSB8fCAnRW1haWwgaXMgbm90IHZhbGlkJ1xuICAgICAgICAgICAgOiB0KCdhdXRoZW50aWNhdGlvbjp1c2VybmFtZU5vdFZhbGlkJykgfHwgJ1VzZXJuYW1lIGlzIG5vdCB2YWxpZCdcbiAgICAgICAgfVxuXG4gICAgICAgIGN0eC5hZGRJc3N1ZSh7XG4gICAgICAgICAgY29kZTogei5ab2RJc3N1ZUNvZGUuY3VzdG9tLFxuICAgICAgICAgIG1lc3NhZ2VcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KSxcbiAgICBwYXNzd29yZDogcGFzc3dvcmRGaWVsZCh7IHQgfSlcbiAgfSlcblxuZXhwb3J0IGNvbnN0IGNyZWF0ZVNpZ251cFNjaGVtYSA9ICh7IHQsIHJlcXVpcmVVc2VybmFtZSA9IGZhbHNlLCByZXF1aXJlQ29uZmlybVBhc3N3b3JkID0gZmFsc2UgfTogeyB0OiBUcmFuc2xhdGU7IHJlcXVpcmVVc2VybmFtZT86IGJvb2xlYW47IHJlcXVpcmVDb25maXJtUGFzc3dvcmQ/OiBib29sZWFuIH0pID0+IHtcbiAgY29uc3Qgc2NoZW1hID0gei5vYmplY3Qoe1xuICAgIG5hbWU6IHouc3RyaW5nKHsgbWVzc2FnZTogJ05hbWUgaXMgcmVxdWlyZWQnIH0pLm1pbigxKSxcbiAgICBlbWFpbDogZW1haWxGaWVsZCh7IHQgfSksXG4gICAgdXNlcm5hbWU6IHVzZXJuYW1lRmllbGQoeyB0LCByZXF1aXJlZDogcmVxdWlyZVVzZXJuYW1lIH0pLm9wdGlvbmFsKCksXG4gICAgcGFzc3dvcmQ6IHBhc3N3b3JkRmllbGQoeyB0IH0pLFxuICAgIGNvbmZpcm1QYXNzd29yZDogY29uZmlybVBhc3N3b3JkRmllbGQoeyB0LCByZXF1aXJlZDogcmVxdWlyZUNvbmZpcm1QYXNzd29yZCB9KS5vcHRpb25hbCgpXG4gIH0pXG5cbiAgaWYgKCFyZXF1aXJlQ29uZmlybVBhc3N3b3JkKSByZXR1cm4gc2NoZW1hXG5cbiAgcmV0dXJuIHNjaGVtYS5yZWZpbmUoKGRhdGEpID0+IGRhdGEucGFzc3dvcmQgPT09IGRhdGEuY29uZmlybVBhc3N3b3JkLCB7XG4gICAgcGF0aDogWydjb25maXJtUGFzc3dvcmQnXSxcbiAgICBtZXNzYWdlOiB0KCdmaWVsZHM6cGFzc3dvcmRzRG9Ob3RNYXRjaCcpIHx8ICdQYXNzd29yZHMgZG8gbm90IG1hdGNoJ1xuICB9KVxufVxuIl0sIm5hbWVzIjpbInoiLCJlbWFpbFJlZ2V4IiwidXNlcm5hbWVSZWdleCIsImVtYWlsRmllbGQiLCJ0IiwicmVxdWlyZWQiLCJzY2hlbWEiLCJzdHJpbmciLCJtaW4iLCJyZWZpbmUiLCJ2YWwiLCJ0ZXN0IiwibWVzc2FnZSIsInVzZXJuYW1lRmllbGQiLCJwYXNzd29yZEZpZWxkIiwibWluTGVuZ3RoIiwiY29uZmlybVBhc3N3b3JkRmllbGQiLCJwYXNzd29yZFdpdGhDb25maXJtYXRpb24iLCJvYmplY3QiLCJwYXNzd29yZCIsImNvbmZpcm1QYXNzd29yZCIsImRhdGEiLCJwYXRoIiwiaXNWYWxpZEVtYWlsIiwiaXNWYWxpZFVzZXJuYW1lIiwibWF4TGVuZ3RoIiwibGVuZ3RoIiwiY3JlYXRlTG9naW5TY2hlbWEiLCJsb2dpblR5cGUiLCJjYW5Mb2dpbldpdGhVc2VybmFtZSIsInVzZXJuYW1lU2V0dGluZ3MiLCJsb2dpbiIsInN1cGVyUmVmaW5lIiwiY3R4IiwiYWRkSXNzdWUiLCJjb2RlIiwiWm9kSXNzdWVDb2RlIiwiY3VzdG9tIiwiaXNWYWxpZCIsImlzUHJvYmFibHlFbWFpbCIsImluY2x1ZGVzIiwiY3JlYXRlU2lnbnVwU2NoZW1hIiwicmVxdWlyZVVzZXJuYW1lIiwicmVxdWlyZUNvbmZpcm1QYXNzd29yZCIsIm5hbWUiLCJlbWFpbCIsInVzZXJuYW1lIiwib3B0aW9uYWwiXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLENBQUMsUUFBUSxNQUFLO0FBRXZCLFNBQVNDLFVBQVUsRUFBRUMsYUFBYSxRQUFRLGlCQUFzQjtBQVloRSw4RUFBOEU7QUFDOUUsaUJBQWlCO0FBQ2pCLDhFQUE4RTtBQUU5RSxPQUFPLE1BQU1DLGFBQWEsQ0FBQyxFQUFFQyxDQUFDLEVBQUVDLFdBQVcsSUFBSSxFQUF3QztJQUNyRixJQUFJQyxTQUFTTixFQUFFTyxNQUFNO0lBQ3JCLElBQUlGLFVBQVVDLFNBQVNBLE9BQU9FLEdBQUcsQ0FBQyxHQUFHSixFQUFFO0lBQ3ZDLE9BQU9FLE9BQU9HLE1BQU0sQ0FBQyxDQUFDQyxNQUFRVCxXQUFXVSxJQUFJLENBQUNELE1BQU07UUFDbERFLFNBQVNSLEVBQUUsbUNBQW1DO0lBQ2hEO0FBQ0YsRUFBQztBQUVELE9BQU8sTUFBTVMsZ0JBQWdCLENBQUMsRUFBRVQsQ0FBQyxFQUFFQyxXQUFXLElBQUksRUFBd0M7SUFDeEYsSUFBSUMsU0FBU04sRUFBRU8sTUFBTTtJQUNyQixJQUFJRixVQUFVQyxTQUFTQSxPQUFPRSxHQUFHLENBQUMsR0FBR0osRUFBRTtJQUN2QyxPQUFPRSxPQUFPRyxNQUFNLENBQUMsQ0FBQ0MsTUFBUVIsY0FBY1MsSUFBSSxDQUFDRCxNQUFNO1FBQ3JERSxTQUFTUixFQUFFLHNDQUFzQztJQUNuRDtBQUNGLEVBQUM7QUFFRCxPQUFPLE1BQU1VLGdCQUFnQixDQUFDLEVBQUVWLENBQUMsRUFBRUMsV0FBVyxJQUFJLEVBQUVVLFlBQVksQ0FBQyxFQUE0RDtJQUMzSCxJQUFJVCxTQUFTTixFQUFFTyxNQUFNO0lBQ3JCLElBQUlGLFVBQVVDLFNBQVNBLE9BQU9FLEdBQUcsQ0FBQ08sV0FBV1gsRUFBRSwwQkFBMEI7SUFDekUsT0FBT0U7QUFDVCxFQUFDO0FBRUQsT0FBTyxNQUFNVSx1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