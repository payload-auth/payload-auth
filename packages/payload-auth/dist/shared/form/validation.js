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
            if (loginType === 'email') isValid = isValidEmail(val);
            else if (loginType === 'username') isValid = isValidUsername(val, usernameSettings);
            else isValid = isValidEmail(val) || isValidUsername(val, usernameSettings);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zaGFyZWQvZm9ybS92YWxpZGF0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuXG5pbXBvcnQgeyBlbWFpbFJlZ2V4LCB1c2VybmFtZVJlZ2V4IH0gZnJvbSAnQC9zaGFyZWQvdXRpbHMvcmVnZXgnO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFR5cGVzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBNaW5pbWFsIHRyYW5zbGF0aW9uIGZ1bmN0aW9uIHR5cGUgZXh0cmFjdGVkIGZyb20gYGkxOG5leHRgLlxuICogQWNjZXB0cyBhIGtleSBhbmQgcmV0dXJucyB0aGUgdHJhbnNsYXRlZCBzdHJpbmcuXG4gKi9cbmV4cG9ydCB0eXBlIFRyYW5zbGF0ZSA9ICguLi5hcmdzOiBhbnlbXSkgPT4gc3RyaW5nXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRmllbGQgYnVpbGRlcnNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5leHBvcnQgY29uc3QgZW1haWxGaWVsZCA9ICh7IHQsIHJlcXVpcmVkID0gdHJ1ZSB9OiB7IHQ6IFRyYW5zbGF0ZTsgcmVxdWlyZWQ/OiBib29sZWFuIH0pID0+IHtcbiAgbGV0IHNjaGVtYSA9IHouc3RyaW5nKClcbiAgaWYgKHJlcXVpcmVkKSBzY2hlbWEgPSBzY2hlbWEubWluKDEsIHQoJ3ZhbGlkYXRpb246cmVxdWlyZWQnKSlcbiAgcmV0dXJuIHNjaGVtYS5yZWZpbmUoKHZhbCkgPT4gZW1haWxSZWdleC50ZXN0KHZhbCksIHtcbiAgICBtZXNzYWdlOiB0KCdhdXRoZW50aWNhdGlvbjplbWFpbE5vdFZhbGlkJykgfHwgJ0VtYWlsIGlzIG5vdCB2YWxpZCdcbiAgfSlcbn1cblxuZXhwb3J0IGNvbnN0IHVzZXJuYW1lRmllbGQgPSAoeyB0LCByZXF1aXJlZCA9IHRydWUgfTogeyB0OiBUcmFuc2xhdGU7IHJlcXVpcmVkPzogYm9vbGVhbiB9KSA9PiB7XG4gIGxldCBzY2hlbWEgPSB6LnN0cmluZygpXG4gIGlmIChyZXF1aXJlZCkgc2NoZW1hID0gc2NoZW1hLm1pbigxLCB0KCd2YWxpZGF0aW9uOnJlcXVpcmVkJykpXG4gIHJldHVybiBzY2hlbWEucmVmaW5lKCh2YWwpID0+IHVzZXJuYW1lUmVnZXgudGVzdCh2YWwpLCB7XG4gICAgbWVzc2FnZTogdCgnYXV0aGVudGljYXRpb246dXNlcm5hbWVOb3RWYWxpZCcpIHx8ICdVc2VybmFtZSBpcyBub3QgdmFsaWQnXG4gIH0pXG59XG5cbmV4cG9ydCBjb25zdCBwYXNzd29yZEZpZWxkID0gKHsgdCwgcmVxdWlyZWQgPSB0cnVlLCBtaW5MZW5ndGggPSAxIH06IHsgdDogVHJhbnNsYXRlOyByZXF1aXJlZD86IGJvb2xlYW47IG1pbkxlbmd0aD86IG51bWJlciB9KSA9PiB7XG4gIGxldCBzY2hlbWEgPSB6LnN0cmluZygpXG4gIGlmIChyZXF1aXJlZCkgc2NoZW1hID0gc2NoZW1hLm1pbihtaW5MZW5ndGgsIHQoJ3ZhbGlkYXRpb246cmVxdWlyZWQnKSB8fCAnUGFzc3dvcmQgaXMgcmVxdWlyZWQnKVxuICByZXR1cm4gc2NoZW1hXG59XG5cbmV4cG9ydCBjb25zdCBjb25maXJtUGFzc3dvcmRGaWVsZCA9ICh7IHQsIHJlcXVpcmVkID0gdHJ1ZSB9OiB7IHQ6IFRyYW5zbGF0ZTsgcmVxdWlyZWQ/OiBib29sZWFuIH0pID0+IHtcbiAgbGV0IHNjaGVtYSA9IHouc3RyaW5nKClcbiAgaWYgKHJlcXVpcmVkKSBzY2hlbWEgPSBzY2hlbWEubWluKDEsIHQoJ3ZhbGlkYXRpb246cmVxdWlyZWQnKSB8fCAnQ29uZmlybSBwYXNzd29yZCBpcyByZXF1aXJlZCcpXG4gIHJldHVybiBzY2hlbWFcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBDb21wb3NhYmxlc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogUmV0dXJucyBhIFpvZCBvYmplY3Qgc2NoZW1hIHdpdGggYHBhc3N3b3JkYCBhbmQgYGNvbmZpcm1QYXNzd29yZGAgZmllbGRzXG4gKiBhbmQgYSByZWZpbmVtZW50IHRoYXQgZW5zdXJlcyB0aGV5IG1hdGNoLlxuICovXG5leHBvcnQgY29uc3QgcGFzc3dvcmRXaXRoQ29uZmlybWF0aW9uID0gKHsgdCwgbWluTGVuZ3RoID0gMSB9OiB7IHQ6IFRyYW5zbGF0ZTsgbWluTGVuZ3RoPzogbnVtYmVyIH0pID0+XG4gIHpcbiAgICAub2JqZWN0KHtcbiAgICAgIHBhc3N3b3JkOiBwYXNzd29yZEZpZWxkKHsgdCwgbWluTGVuZ3RoIH0pLFxuICAgICAgY29uZmlybVBhc3N3b3JkOiBjb25maXJtUGFzc3dvcmRGaWVsZCh7IHQgfSlcbiAgICB9KVxuICAgIC5yZWZpbmUoKGRhdGEpID0+IGRhdGEucGFzc3dvcmQgPT09IGRhdGEuY29uZmlybVBhc3N3b3JkLCB7XG4gICAgICBwYXRoOiBbJ2NvbmZpcm1QYXNzd29yZCddLFxuICAgICAgbWVzc2FnZTogdCgnZmllbGRzOnBhc3N3b3Jkc0RvTm90TWF0Y2gnKSB8fCAnUGFzc3dvcmRzIGRvIG5vdCBtYXRjaCdcbiAgICB9KVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFV0aWxpdHkgdmFsaWRhdG9ycyAobm9u4oCRWm9kKSDigJQgaGFuZHkgZm9yIGR5bmFtaWMgbG9naW4gZmllbGQgY2hlY2tzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZXhwb3J0IGNvbnN0IGlzVmFsaWRFbWFpbCA9ICh2YWw6IHN0cmluZykgPT4gZW1haWxSZWdleC50ZXN0KHZhbClcbmV4cG9ydCBjb25zdCBpc1ZhbGlkVXNlcm5hbWUgPSAodmFsOiBzdHJpbmcsIHsgbWluTGVuZ3RoID0gNSwgbWF4TGVuZ3RoID0gMTI4IH06IHsgbWluTGVuZ3RoPzogbnVtYmVyOyBtYXhMZW5ndGg/OiBudW1iZXIgfSA9IHt9KSA9PlxuICB1c2VybmFtZVJlZ2V4LnRlc3QodmFsKSAmJiB2YWwubGVuZ3RoID49IG1pbkxlbmd0aCAmJiB2YWwubGVuZ3RoIDw9IG1heExlbmd0aFxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFNjaGVtYSBidWlsZGVyc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnR5cGUgVXNlcm5hbWVTZXR0aW5ncyA9IHsgbWluTGVuZ3RoOiBudW1iZXI7IG1heExlbmd0aDogbnVtYmVyIH1cblxuZXhwb3J0IGNvbnN0IGNyZWF0ZUxvZ2luU2NoZW1hID0gKHtcbiAgdCxcbiAgbG9naW5UeXBlLFxuICBjYW5Mb2dpbldpdGhVc2VybmFtZSA9IGZhbHNlLFxuICB1c2VybmFtZVNldHRpbmdzID0geyBtaW5MZW5ndGg6IDUsIG1heExlbmd0aDogMTI4IH1cbn06IHtcbiAgdDogVHJhbnNsYXRlXG4gIGxvZ2luVHlwZTogJ2VtYWlsJyB8ICd1c2VybmFtZScgfCAnZW1haWxPclVzZXJuYW1lJ1xuICBjYW5Mb2dpbldpdGhVc2VybmFtZT86IGJvb2xlYW5cbiAgdXNlcm5hbWVTZXR0aW5ncz86IFVzZXJuYW1lU2V0dGluZ3Ncbn0pID0+XG4gIHoub2JqZWN0KHtcbiAgICBsb2dpbjogei5zdHJpbmcoKS5zdXBlclJlZmluZSgodmFsLCBjdHgpID0+IHtcbiAgICAgIGlmICghdmFsKSB7XG4gICAgICAgIGN0eC5hZGRJc3N1ZSh7XG4gICAgICAgICAgY29kZTogei5ab2RJc3N1ZUNvZGUuY3VzdG9tLFxuICAgICAgICAgIG1lc3NhZ2U6IHQoJ3ZhbGlkYXRpb246cmVxdWlyZWQnKVxuICAgICAgICB9KVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgbGV0IGlzVmFsaWQgPSBmYWxzZVxuICAgICAgaWYgKGxvZ2luVHlwZSA9PT0gJ2VtYWlsJykgaXNWYWxpZCA9IGlzVmFsaWRFbWFpbCh2YWwpXG4gICAgICBlbHNlIGlmIChsb2dpblR5cGUgPT09ICd1c2VybmFtZScpIGlzVmFsaWQgPSBpc1ZhbGlkVXNlcm5hbWUodmFsLCB1c2VybmFtZVNldHRpbmdzKVxuICAgICAgZWxzZSBpc1ZhbGlkID0gaXNWYWxpZEVtYWlsKHZhbCkgfHwgaXNWYWxpZFVzZXJuYW1lKHZhbCwgdXNlcm5hbWVTZXR0aW5ncylcblxuICAgICAgaWYgKCFpc1ZhbGlkKSB7XG4gICAgICAgIGNvbnN0IGlzUHJvYmFibHlFbWFpbCA9IHZhbC5pbmNsdWRlcygnQCcpIHx8ICFjYW5Mb2dpbldpdGhVc2VybmFtZVxuICAgICAgICBsZXQgbWVzc2FnZSA9ICcnXG5cbiAgICAgICAgaWYgKGxvZ2luVHlwZSA9PT0gJ2VtYWlsJykge1xuICAgICAgICAgIG1lc3NhZ2UgPSB0KCdhdXRoZW50aWNhdGlvbjplbWFpbE5vdFZhbGlkJykgfHwgJ0VtYWlsIGlzIG5vdCB2YWxpZCdcbiAgICAgICAgfSBlbHNlIGlmIChsb2dpblR5cGUgPT09ICd1c2VybmFtZScpIHtcbiAgICAgICAgICBtZXNzYWdlID0gdCgnYXV0aGVudGljYXRpb246dXNlcm5hbWVOb3RWYWxpZCcpIHx8ICdVc2VybmFtZSBpcyBub3QgdmFsaWQnXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWVzc2FnZSA9IGlzUHJvYmFibHlFbWFpbFxuICAgICAgICAgICAgPyB0KCdhdXRoZW50aWNhdGlvbjplbWFpbE5vdFZhbGlkJykgfHwgJ0VtYWlsIGlzIG5vdCB2YWxpZCdcbiAgICAgICAgICAgIDogdCgnYXV0aGVudGljYXRpb246dXNlcm5hbWVOb3RWYWxpZCcpIHx8ICdVc2VybmFtZSBpcyBub3QgdmFsaWQnXG4gICAgICAgIH1cblxuICAgICAgICBjdHguYWRkSXNzdWUoe1xuICAgICAgICAgIGNvZGU6IHouWm9kSXNzdWVDb2RlLmN1c3RvbSxcbiAgICAgICAgICBtZXNzYWdlXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSksXG4gICAgcGFzc3dvcmQ6IHBhc3N3b3JkRmllbGQoeyB0IH0pXG4gIH0pXG5cbmV4cG9ydCBjb25zdCBjcmVhdGVTaWdudXBTY2hlbWEgPSAoeyB0LCByZXF1aXJlVXNlcm5hbWUgPSBmYWxzZSwgcmVxdWlyZUNvbmZpcm1QYXNzd29yZCA9IGZhbHNlIH06IHsgdDogVHJhbnNsYXRlOyByZXF1aXJlVXNlcm5hbWU/OiBib29sZWFuOyByZXF1aXJlQ29uZmlybVBhc3N3b3JkPzogYm9vbGVhbiB9KSA9PiB7XG4gIGNvbnN0IHNjaGVtYSA9IHoub2JqZWN0KHtcbiAgICBuYW1lOiB6LnN0cmluZyh7IG1lc3NhZ2U6ICdOYW1lIGlzIHJlcXVpcmVkJyB9KS5taW4oMSksXG4gICAgZW1haWw6IGVtYWlsRmllbGQoeyB0IH0pLFxuICAgIHVzZXJuYW1lOiB1c2VybmFtZUZpZWxkKHsgdCwgcmVxdWlyZWQ6IHJlcXVpcmVVc2VybmFtZSB9KS5vcHRpb25hbCgpLFxuICAgIHBhc3N3b3JkOiBwYXNzd29yZEZpZWxkKHsgdCB9KSxcbiAgICBjb25maXJtUGFzc3dvcmQ6IGNvbmZpcm1QYXNzd29yZEZpZWxkKHsgdCwgcmVxdWlyZWQ6IHJlcXVpcmVDb25maXJtUGFzc3dvcmQgfSkub3B0aW9uYWwoKVxuICB9KVxuXG4gIGlmICghcmVxdWlyZUNvbmZpcm1QYXNzd29yZCkgcmV0dXJuIHNjaGVtYVxuXG4gIHJldHVybiBzY2hlbWEucmVmaW5lKChkYXRhKSA9PiBkYXRhLnBhc3N3b3JkID09PSBkYXRhLmNvbmZpcm1QYXNzd29yZCwge1xuICAgIHBhdGg6IFsnY29uZmlybVBhc3N3b3JkJ10sXG4gICAgbWVzc2FnZTogdCgnZmllbGRzOnBhc3N3b3Jkc0RvTm90TWF0Y2gnKSB8fCAnUGFzc3dvcmRzIGRvIG5vdCBtYXRjaCdcbiAgfSlcbn1cbiJdLCJuYW1lcyI6WyJ6IiwiZW1haWxSZWdleCIsInVzZXJuYW1lUmVnZXgiLCJlbWFpbEZpZWxkIiwidCIsInJlcXVpcmVkIiwic2NoZW1hIiwic3RyaW5nIiwibWluIiwicmVmaW5lIiwidmFsIiwidGVzdCIsIm1lc3NhZ2UiLCJ1c2VybmFtZUZpZWxkIiwicGFzc3dvcmRGaWVsZCIsIm1pbkxlbmd0aCIsImNvbmZpcm1QYXNzd29yZEZpZWxkIiwicGFzc3dvcmRXaXRoQ29uZmlybWF0aW9uIiwib2JqZWN0IiwicGFzc3dvcmQiLCJjb25maXJtUGFzc3dvcmQiLCJkYXRhIiwicGF0aCIsImlzVmFsaWRFbWFpbCIsImlzVmFsaWRVc2VybmFtZSIsIm1heExlbmd0aCIsImxlbmd0aCIsImNyZWF0ZUxvZ2luU2NoZW1hIiwibG9naW5UeXBlIiwiY2FuTG9naW5XaXRoVXNlcm5hbWUiLCJ1c2VybmFtZVNldHRpbmdzIiwibG9naW4iLCJzdXBlclJlZmluZSIsImN0eCIsImFkZElzc3VlIiwiY29kZSIsIlpvZElzc3VlQ29kZSIsImN1c3RvbSIsImlzVmFsaWQiLCJpc1Byb2JhYmx5RW1haWwiLCJpbmNsdWRlcyIsImNyZWF0ZVNpZ251cFNjaGVtYSIsInJlcXVpcmVVc2VybmFtZSIsInJlcXVpcmVDb25maXJt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