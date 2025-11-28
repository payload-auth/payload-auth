import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { passkey } from "@better-auth/passkey";
import { sso } from "@better-auth/sso";
import { stripe } from "@better-auth/stripe";
import { checkout, polar } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { getSchema } from "better-auth/db";
import { nextCookies } from "better-auth/next-js";
import { admin, anonymous, apiKey, bearer, customSession, deviceAuthorization, emailOTP, genericOAuth, jwt, lastLoginMethod, magicLink, mcp, multiSession, oidcProvider, oneTap, oneTimeToken, openAPI, organization, phoneNumber, twoFactor, username } from "better-auth/plugins";
import { emailHarmony, phoneHarmony } from "better-auth-harmony";
import Stripe from "stripe";
const client = new Polar({
    accessToken: 'pk_test_1234567890',
    server: 'sandbox'
});
const plugins = [
    username(),
    admin(),
    apiKey(),
    passkey(),
    emailHarmony(),
    phoneHarmony(),
    bearer(),
    emailOTP({
        sendVerificationOTP: async ()=>{}
    }),
    magicLink({
        sendMagicLink: async ()=>{}
    }),
    phoneNumber({
        sendOTP: async ()=>{}
    }),
    oneTap(),
    anonymous(),
    multiSession(),
    oneTimeToken(),
    oidcProvider({
        loginPage: ''
    }),
    sso(),
    genericOAuth({
        config: [
            {
                providerId: 'typescript',
                clientId: 'typescript',
                clientSecret: 'typescript'
            }
        ]
    }),
    openAPI(),
    organization({
        teams: {
            enabled: true
        }
    }),
    jwt(),
    twoFactor(),
    phoneNumber(),
    nextCookies(),
    customSession(async ()=>({})),
    mcp({
        loginPage: ''
    }),
    deviceAuthorization(),
    lastLoginMethod({
        storeInDatabase: true
    }),
    stripe({
        stripeClient: new Stripe('typescript'),
        stripeWebhookSecret: 'typescript',
        subscription: {
            enabled: true,
            plans: [
                {
                    name: 'Basic',
                    priceId: 'basic'
                },
                {
                    name: 'Pro',
                    priceId: 'pro'
                },
                {
                    name: 'Enterprise',
                    priceId: 'enterprise'
                }
            ]
        }
    }),
    // As of writing this, Polar don't create schema fields, but just in case in the future we leave this here.
    polar({
        client,
        use: [
            checkout({
                products: [
                    {
                        productId: '123-456-789',
                        slug: 'pro' // Custom slug for easy reference in Checkout URL, e.g. /checkout/pro
                    }
                ],
                successUrl: '/success?checkout_id={CHECKOUT_ID}',
                authenticatedUsersOnly: true
            })
        ]
    })
];
const betterAuthConfig = {
    emailAndPassword: {
        enabled: true
    },
    user: {
        additionalFields: {
            role: {
                type: 'string',
                defaultValue: 'user',
                input: false
            }
        }
    },
    plugins
};
const baseSchema = getSchema({
    ...betterAuthConfig,
    plugins: []
});
const map = (t)=>{
    if (t === 'boolean') return 'boolean';
    if (t === 'date') return 'Date';
    if (t === 'number') return 'number';
    if (t === 'string') return 'string';
    if (t === 'number[]') return 'number[]';
    if (t === 'string[]') return 'string[]';
    return 'unknown';
};
const pascal = (s)=>s.split(/[-_]/g).map((p)=>p.charAt(0).toUpperCase() + p.slice(1)).join('');
const diff = (base, target)=>{
    const d = {};
    for (const [m, { fields }] of Object.entries(target)){
        const added = Object.entries(fields).filter(([k])=>!(k in (base[m]?.fields ?? {})));
        if (added.length) d[m] = Object.fromEntries(added);
    }
    return d;
};
const gen = ()=>{
    let out = '// Auto-generated types. Do not edit.\n\n';
    const pluginAdds = {};
    const seen = new Set();
    for (const pl of plugins){
        const id = pl.id;
        if (!id || seen.has(id)) continue;
        seen.add(id);
        const adds = diff(baseSchema, getSchema({
            ...betterAuthConfig,
            plugins: [
                pl
            ]
        }));
        for (const [m, f] of Object.entries(adds)){
            pluginAdds[m] ??= {};
            pluginAdds[m][id] = f;
        }
    }
    const models = new Set([
        ...Object.keys(baseSchema),
        ...Object.keys(pluginAdds)
    ]);
    for (const model of models){
        const P = pascal(model);
        const base = baseSchema[model]?.fields ?? {};
        const pluginsForModel = pluginAdds[model] ?? {};
        const pluginIds = Object.keys(pluginsForModel);
        if (Object.keys(base).length) {
            out += `export type Base${P}Fields = {\n`;
            for (const [k, f] of Object.entries(base))out += `  ${f.fieldName ?? k}${f.required ? '' : '?'}: ${map(f.type)}\n`;
            out += '}\n\n';
        }
        const needPluginMap = pluginIds.length > 1 || Object.keys(base).length;
        if (needPluginMap && pluginIds.length) {
            out += `export type ${P}PluginFields = {\n`;
            for (const [pid, flds] of Object.entries(pluginsForModel)){
                out += `  ${JSON.stringify(pid)}: {\n`;
                for (const [k, f] of Object.entries(flds))out += `    ${f.fieldName ?? k}${f.required ? '' : '?'}: ${map(f.type)}\n`;
                out += '  }\n';
            }
            out += '}\n\n';
        }
        if (!Object.keys(base).length && pluginIds.length === 1) {
            const only = pluginIds[0];
            out += `export type ${P}Fields = {\n`;
            for (const [k, f] of Object.entries(pluginsForModel[only]))out += `  ${f.fieldName ?? k}${f.required ? '' : '?'}: ${map(f.type)}\n`;
            out += '}\n\n';
            out += `export type ${P} = ${P}Fields\n\n`;
            continue;
        }
        const parts = [];
        if (Object.keys(base).length) parts.push(`Base${P}Fields`);
        if (pluginIds.length) {
            const mapName = needPluginMap ? `${P}PluginFields` : undefined;
            parts.push(...pluginIds.map((id)=>mapName ? `${mapName}[${JSON.stringify(id)}]` : 'never'));
        }
        out += `export type ${P} = ${parts.join(' & ')}\n\n`;
    }
    // Generate union type of plugin identifiers
    const pluginIdUnion = [
        ...seen
    ].map((id)=>JSON.stringify(id)).join(' | ');
    out += `export type PluginId = ${pluginIdUnion}\n\n`;
    // Generate full schema mapping
    out += `export type BetterAuthFullSchema = {\n`;
    for (const model of models){
        const P = pascal(model);
        out += `  ${JSON.stringify(model)}: ${P}\n`;
    }
    out += `}\n\n`;
    // Generate union type of all model names
    out += `export type ModelKey = keyof BetterAuthFullSchema`;
    return out;
};
const generated = gen();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
(async ()=>{
    const file = path.resolve(__dirname, '../generated-types.ts');
    await fs.writeFile(file, generated, 'utf8');
    console.log(`Generated types written to ${file}`);
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9zY3JpcHRzL2dlbmVyYXRlLXR5cGVzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdub2RlOmZzL3Byb21pc2VzJ1xuaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJ1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ25vZGU6dXJsJ1xuaW1wb3J0IHsgcGFzc2tleSB9IGZyb20gJ0BiZXR0ZXItYXV0aC9wYXNza2V5J1xuaW1wb3J0IHsgc3NvIH0gZnJvbSAnQGJldHRlci1hdXRoL3NzbydcbmltcG9ydCB7IHN0cmlwZSB9IGZyb20gJ0BiZXR0ZXItYXV0aC9zdHJpcGUnXG5pbXBvcnQgeyBjaGVja291dCwgcG9sYXIgfSBmcm9tICdAcG9sYXItc2gvYmV0dGVyLWF1dGgnXG5pbXBvcnQgeyBQb2xhciB9IGZyb20gJ0Bwb2xhci1zaC9zZGsnXG5pbXBvcnQgdHlwZSB7IERCRmllbGRBdHRyaWJ1dGUgfSBmcm9tICdiZXR0ZXItYXV0aC9kYidcbmltcG9ydCB7IGdldFNjaGVtYSB9IGZyb20gJ2JldHRlci1hdXRoL2RiJ1xuaW1wb3J0IHsgbmV4dENvb2tpZXMgfSBmcm9tICdiZXR0ZXItYXV0aC9uZXh0LWpzJ1xuaW1wb3J0IHtcbiAgYWRtaW4sXG4gIGFub255bW91cyxcbiAgYXBpS2V5LFxuICBiZWFyZXIsXG4gIGN1c3RvbVNlc3Npb24sXG4gIGRldmljZUF1dGhvcml6YXRpb24sXG4gIGVtYWlsT1RQLFxuICBnZW5lcmljT0F1dGgsXG4gIGp3dCxcbiAgbGFzdExvZ2luTWV0aG9kLFxuICBtYWdpY0xpbmssXG4gIG1jcCxcbiAgbXVsdGlTZXNzaW9uLFxuICBvaWRjUHJvdmlkZXIsXG4gIG9uZVRhcCxcbiAgb25lVGltZVRva2VuLFxuICBvcGVuQVBJLFxuICBvcmdhbml6YXRpb24sXG4gIHBob25lTnVtYmVyLFxuICB0d29GYWN0b3IsXG4gIHVzZXJuYW1lXG59IGZyb20gJ2JldHRlci1hdXRoL3BsdWdpbnMnXG5pbXBvcnQgeyBlbWFpbEhhcm1vbnksIHBob25lSGFybW9ueSB9IGZyb20gJ2JldHRlci1hdXRoLWhhcm1vbnknXG5pbXBvcnQgU3RyaXBlIGZyb20gJ3N0cmlwZSdcbmltcG9ydCB0eXBlIHsgU2FuaXRpemVkQmV0dGVyQXV0aE9wdGlvbnMgfSBmcm9tICcuLi90eXBlcydcblxuY29uc3QgY2xpZW50ID0gbmV3IFBvbGFyKHtcbiAgYWNjZXNzVG9rZW46ICdwa190ZXN0XzEyMzQ1Njc4OTAnLFxuICBzZXJ2ZXI6ICdzYW5kYm94J1xufSlcblxuY29uc3QgcGx1Z2lucyA9IFtcbiAgdXNlcm5hbWUoKSxcbiAgYWRtaW4oKSxcbiAgYXBpS2V5KCksXG4gIHBhc3NrZXkoKSxcbiAgZW1haWxIYXJtb255KCksXG4gIHBob25lSGFybW9ueSgpLFxuICBiZWFyZXIoKSxcbiAgZW1haWxPVFAoeyBzZW5kVmVyaWZpY2F0aW9uT1RQOiBhc3luYyAoKSA9PiB7IH0gfSksXG4gIG1hZ2ljTGluayh7IHNlbmRNYWdpY0xpbms6IGFzeW5jICgpID0+IHsgfSB9KSxcbiAgcGhvbmVOdW1iZXIoeyBzZW5kT1RQOiBhc3luYyAoKSA9PiB7IH0gfSksXG4gIG9uZVRhcCgpLFxuICBhbm9ueW1vdXMoKSxcbiAgbXVsdGlTZXNzaW9uKCksXG4gIG9uZVRpbWVUb2tlbigpLFxuICBvaWRjUHJvdmlkZXIoeyBsb2dpblBhZ2U6ICcnIH0pLFxuICBzc28oKSxcbiAgZ2VuZXJpY09BdXRoKHsgY29uZmlnOiBbeyBwcm92aWRlcklkOiAndHlwZXNjcmlwdCcsIGNsaWVudElkOiAndHlwZXNjcmlwdCcsIGNsaWVudFNlY3JldDogJ3R5cGVzY3JpcHQnIH1dIH0pLFxuICBvcGVuQVBJKCksXG4gIG9yZ2FuaXphdGlvbih7IHRlYW1zOiB7IGVuYWJsZWQ6IHRydWUgfSB9KSxcbiAgand0KCksXG4gIHR3b0ZhY3RvcigpLFxuICBwaG9uZU51bWJlcigpLFxuICBuZXh0Q29va2llcygpLFxuICBjdXN0b21TZXNzaW9uKGFzeW5jICgpID0+ICh7fSkpLFxuICBtY3AoeyBsb2dpblBhZ2U6ICcnIH0pLFxuICBkZXZpY2VBdXRob3JpemF0aW9uKCksXG4gIGxhc3RMb2dpbk1ldGhvZCh7IHN0b3JlSW5EYXRhYmFzZTogdHJ1ZSB9KSxcbiAgc3RyaXBlKHtcbiAgICBzdHJpcGVDbGllbnQ6IG5ldyBTdHJpcGUoJ3R5cGVzY3JpcHQnKSxcbiAgICBzdHJpcGVXZWJob29rU2VjcmV0OiAndHlwZXNjcmlwdCcsXG4gICAgc3Vic2NyaXB0aW9uOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgcGxhbnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdCYXNpYycsXG4gICAgICAgICAgcHJpY2VJZDogJ2Jhc2ljJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ1BybycsXG4gICAgICAgICAgcHJpY2VJZDogJ3BybydcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdFbnRlcnByaXNlJyxcbiAgICAgICAgICBwcmljZUlkOiAnZW50ZXJwcmlzZSdcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH1cbiAgfSksXG4gIC8vIEFzIG9mIHdyaXRpbmcgdGhpcywgUG9sYXIgZG9uJ3QgY3JlYXRlIHNjaGVtYSBmaWVsZHMsIGJ1dCBqdXN0IGluIGNhc2UgaW4gdGhlIGZ1dHVyZSB3ZSBsZWF2ZSB0aGlzIGhlcmUuXG4gIHBvbGFyKHtcbiAgICBjbGllbnQsXG4gICAgdXNlOiBbXG4gICAgICBjaGVja291dCh7XG4gICAgICAgIHByb2R1Y3RzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgcHJvZHVjdElkOiAnMTIzLTQ1Ni03ODknLCAvLyBJRCBvZiBQcm9kdWN0IGZyb20gUG9sYXIgRGFzaGJvYXJkXG4gICAgICAgICAgICBzbHVnOiAncHJvJyAvLyBDdXN0b20gc2x1ZyBmb3IgZWFzeSByZWZlcmVuY2UgaW4gQ2hlY2tvdXQgVVJMLCBlLmcuIC9jaGVja291dC9wcm9cbiAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIHN1Y2Nlc3NVcmw6ICcvc3VjY2Vzcz9jaGVja291dF9pZD17Q0hFQ0tPVVRfSUR9JyxcbiAgICAgICAgYXV0aGVudGljYXRlZFVzZXJzT25seTogdHJ1ZVxuICAgICAgfSlcbiAgICBdXG4gIH0pXG5dXG5cbmNvbnN0IGJldHRlckF1dGhDb25maWc6IFNhbml0aXplZEJldHRlckF1dGhPcHRpb25zID0ge1xuICBlbWFpbEFuZFBhc3N3b3JkOiB7IGVuYWJsZWQ6IHRydWUgfSxcbiAgdXNlcjogeyBhZGRpdGlvbmFsRmllbGRzOiB7IHJvbGU6IHsgdHlwZTogJ3N0cmluZycsIGRlZmF1bHRWYWx1ZTogJ3VzZXInLCBpbnB1dDogZmFsc2UgfSB9IH0sXG4gIHBsdWdpbnNcbn1cblxuY29uc3QgYmFzZVNjaGVtYSA9IGdldFNjaGVtYSh7IC4uLmJldHRlckF1dGhDb25maWcsIHBsdWdpbnM6IFtdIH0pXG5cbnR5cGUgU2NoZW1hID0gUmVjb3JkPHN0cmluZywgeyBmaWVsZHM6IFJlY29yZDxzdHJpbmcsIERCRmllbGRBdHRyaWJ1dGU+IH0+XG5cbmNvbnN0IG1hcCA9ICh0OiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICBpZiAodCA9PT0gJ2Jvb2xlYW4nKSByZXR1cm4gJ2Jvb2xlYW4nXG4gIGlmICh0ID09PSAnZGF0ZScpIHJldHVybiAnRGF0ZSdcbiAgaWYgKHQgPT09ICdudW1iZXInKSByZXR1cm4gJ251bWJlcidcbiAgaWYgKHQgPT09ICdzdHJpbmcnKSByZXR1cm4gJ3N0cmluZydcbiAgaWYgKHQgPT09ICdudW1iZXJbXScpIHJldHVybiAnbnVtYmVyW10nXG4gIGlmICh0ID09PSAnc3RyaW5nW10nKSByZXR1cm4gJ3N0cmluZ1tdJ1xuICByZXR1cm4gJ3Vua25vd24nXG59XG5cbmNvbnN0IHBhc2NhbCA9IChzOiBzdHJpbmcpOiBzdHJpbmcgPT5cbiAgc1xuICAgIC5zcGxpdCgvWy1fXS9nKVxuICAgIC5tYXAoKHApID0+IHAuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwLnNsaWNlKDEpKVxuICAgIC5qb2luKCcnKVxuXG5jb25zdCBkaWZmID0gKGJhc2U6IFNjaGVtYSwgdGFyZ2V0OiBTY2hlbWEpOiBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCBEQkZpZWxkQXR0cmlidXRlPj4gPT4ge1xuICBjb25zdCBkOiBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCBEQkZpZWxkQXR0cmlidXRlPj4gPSB7fVxuICBmb3IgKGNvbnN0IFttLCB7IGZpZWxkcyB9XSBvZiBPYmplY3QuZW50cmllcyh0YXJnZXQpKSB7XG4gICAgY29uc3QgYWRkZWQgPSBPYmplY3QuZW50cmllcyhmaWVsZHMpLmZpbHRlcigoW2tdKSA9PiAhKGsgaW4gKGJhc2VbbV0/LmZpZWxkcyA/PyB7fSkpKVxuICAgIGlmIChhZGRlZC5sZW5ndGgpIGRbbV0gPSBPYmplY3QuZnJvbUVudHJpZXMoYWRkZWQpXG4gIH1cbiAgcmV0dXJuIGRcbn1cblxuY29uc3QgZ2VuID0gKCk6IHN0cmluZyA9PiB7XG4gIGxldCBvdXQgPSAnLy8gQXV0by1nZW5lcmF0ZWQgdHlwZXMuIERvIG5vdCBlZGl0LlxcblxcbidcblxuICBjb25zdCBwbHVnaW5BZGRzOiBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCBEQkZpZWxkQXR0cmlidXRlPj4+ID0ge31cbiAgY29uc3Qgc2VlbiA9IG5ldyBTZXQ8c3RyaW5nPigpXG5cbiAgZm9yIChjb25zdCBwbCBvZiBwbHVnaW5zKSB7XG4gICAgY29uc3QgaWQgPSAocGwgYXMgYW55KS5pZCBhcyBzdHJpbmcgfCB1bmRlZmluZWRcbiAgICBpZiAoIWlkIHx8IHNlZW4uaGFzKGlkKSkgY29udGludWVcbiAgICBzZWVuLmFkZChpZClcbiAgICBjb25zdCBhZGRzID0gZGlmZihiYXNlU2NoZW1hLCBnZXRTY2hlbWEoeyAuLi5iZXR0ZXJBdXRoQ29uZmlnLCBwbHVnaW5zOiBbcGxdIH0pKVxuICAgIGZvciAoY29uc3QgW20sIGZdIG9mIE9iamVjdC5lbnRyaWVzKGFkZHMpKSB7XG4gICAgICBwbHVnaW5BZGRzW21dID8/PSB7fVxuICAgICAgcGx1Z2luQWRkc1ttXVtpZF0gPSBmXG4gICAgfVxuICB9XG5cbiAgY29uc3QgbW9kZWxzID0gbmV3IFNldDxzdHJpbmc+KFsuLi5PYmplY3Qua2V5cyhiYXNlU2NoZW1hKSwgLi4uT2JqZWN0LmtleXMocGx1Z2luQWRkcyldKVxuXG4gIGZvciAoY29uc3QgbW9kZWwgb2YgbW9kZWxzKSB7XG4gICAgY29uc3QgUCA9IHBhc2NhbChtb2RlbClcbiAgICBjb25zdCBiYXNlID0gYmFzZVNjaGVtYVttb2RlbF0/LmZpZWxkcyA/PyB7fVxuICAgIGNvbnN0IHBsdWdpbnNGb3JNb2RlbCA9IHBsdWdpbkFkZHNbbW9kZWxdID8/IHt9XG4gICAgY29uc3QgcGx1Z2luSWRzID0gT2JqZWN0LmtleXMocGx1Z2luc0Zvck1vZGVsKVxuXG4gICAgaWYgKE9iamVjdC5rZXlzKGJhc2UpLmxlbmd0aCkge1xuICAgICAgb3V0ICs9IGBleHBvcnQgdHlwZSBCYXNlJHtQfUZpZWxkcyA9IHtcXG5gXG4gICAgICBmb3IgKGNvbnN0IFtrLCBmXSBvZiBPYmplY3QuZW50cmllcyhiYXNlKSkgb3V0ICs9IGAgICR7Zi5maWVsZE5hbWUgPz8ga30ke2YucmVxdWlyZWQgPyAnJyA6ICc/J306ICR7bWFwKGYudHlwZSBhcyBzdHJpbmcpfVxcbmBcbiAgICAgIG91dCArPSAnfVxcblxcbidcbiAgICB9XG5cbiAgICBjb25zdCBuZWVkUGx1Z2luTWFwID0gcGx1Z2luSWRzLmxlbmd0aCA+IDEgfHwgT2JqZWN0LmtleXMoYmFzZSkubGVuZ3RoXG4gICAgaWYgKG5lZWRQbHVnaW5NYXAgJiYgcGx1Z2luSWRzLmxlbmd0aCkge1xuICAgICAgb3V0ICs9IGBleHBvcnQgdHlwZSAke1B9UGx1Z2luRmllbGRzID0ge1xcbmBcbiAgICAgIGZvciAoY29uc3QgW3BpZCwgZmxkc10gb2YgT2JqZWN0LmVudHJpZXMocGx1Z2luc0Zvck1vZGVsKSkge1xuICAgICAgICBvdXQgKz0gYCAgJHtKU09OLnN0cmluZ2lmeShwaWQpfToge1xcbmBcbiAgICAgICAgZm9yIChjb25zdCBbaywgZl0gb2YgT2JqZWN0LmVudHJpZXMoZmxkcykpIG91dCArPSBgICAgICR7Zi5maWVsZE5hbWUgPz8ga30ke2YucmVxdWlyZWQgPyAnJyA6ICc/J306ICR7bWFwKGYudHlwZSBhcyBzdHJpbmcpfVxcbmBcbiAgICAgICAgb3V0ICs9ICcgIH1cXG4nXG4gICAgICB9XG4gICAgICBvdXQgKz0gJ31cXG5cXG4nXG4gICAgfVxuXG4gICAgaWYgKCFPYmplY3Qua2V5cyhiYXNlKS5sZW5ndGggJiYgcGx1Z2luSWRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgY29uc3Qgb25seSA9IHBsdWdpbklkc1swXVxuICAgICAgb3V0ICs9IGBleHBvcnQgdHlwZSAke1B9RmllbGRzID0ge1xcbmBcbiAgICAgIGZvciAoY29uc3QgW2ssIGZdIG9mIE9iamVjdC5lbnRyaWVzKHBsdWdpbnNGb3JNb2RlbFtvbmx5XSkpXG4gICAgICAgIG91dCArPSBgICAke2YuZmllbGROYW1lID8/IGt9JHtmLnJlcXVpcmVkID8gJycgOiAnPyd9OiAke21hcChmLnR5cGUgYXMgc3RyaW5nKX1cXG5gXG4gICAgICBvdXQgKz0gJ31cXG5cXG4nXG4gICAgICBvdXQgKz0gYGV4cG9ydCB0eXBlICR7UH0gPSAke1B9RmllbGRzXFxuXFxuYFxuICAgICAgY29udGludWVcbiAgICB9XG5cbiAgICBjb25zdCBwYXJ0czogc3RyaW5nW10gPSBbXVxuICAgIGlmIChPYmplY3Qua2V5cyhiYXNlKS5sZW5ndGgpIHBhcnRzLnB1c2goYEJhc2Uke1B9RmllbGRzYClcbiAgICBpZiAocGx1Z2luSWRzLmxlbmd0aCkge1xuICAgICAgY29uc3QgbWFwTmFtZSA9IG5lZWRQbHVnaW5NYXAgPyBgJHtQfVBsdWdpbkZpZWxkc2AgOiB1bmRlZmluZWRcbiAgICAgIHBhcnRzLnB1c2goLi4ucGx1Z2luSWRzLm1hcCgoaWQpID0+IChtYXBOYW1lID8gYCR7bWFwTmFtZX1bJHtKU09OLnN0cmluZ2lmeShpZCl9XWAgOiAnbmV2ZXInKSAvKiBub3QgcmVhY2hhYmxlICovKSlcbiAgICB9XG4gICAgb3V0ICs9IGBleHBvcnQgdHlwZSAke1B9ID0gJHtwYXJ0cy5qb2luKCcgJiAnKX1cXG5cXG5gXG4gIH1cblxuICAvLyBHZW5lcmF0ZSB1bmlvbiB0eXBlIG9mIHBsdWdpbiBpZGVudGlmaWVyc1xuICBjb25zdCBwbHVnaW5JZFVuaW9uID0gWy4uLnNlZW5dLm1hcCgoaWQpID0+IEpTT04uc3RyaW5naWZ5KGlkKSkuam9pbignIHwgJylcbiAgb3V0ICs9IGBleHBvcnQgdHlwZSBQbHVnaW5JZCA9ICR7cGx1Z2luSWRVbmlvbn1cXG5cXG5gXG5cbiAgLy8gR2VuZXJhdGUgZnVsbCBzY2hlbWEgbWFwcGluZ1xuICBvdXQgKz0gYGV4cG9ydCB0eXBlIEJldHRlckF1dGhGdWxsU2NoZW1hID0ge1xcbmBcbiAgZm9yIChjb25zdCBtb2RlbCBvZiBtb2RlbHMpIHtcbiAgICBjb25zdCBQID0gcGFzY2FsKG1vZGVsKVxuICAgIG91dCArPSBgICAke0pTT04uc3RyaW5naWZ5KG1vZGVsKX06ICR7UH1cXG5gXG4gIH1cbiAgb3V0ICs9IGB9XFxuXFxuYFxuXG4gIC8vIEdlbmVyYXRlIHVuaW9uIHR5cGUgb2YgYWxsIG1vZGVsIG5hbWVzXG4gIG91dCArPSBgZXhwb3J0IHR5cGUgTW9kZWxLZXkgPSBrZXlvZiBCZXR0ZXJBdXRoRnVsbFNjaGVtYWBcblxuICByZXR1cm4gb3V0XG59XG5cbmNvbnN0IGdlbmVyYXRlZCA9IGdlbigpXG5cbmNvbnN0IF9fZGlybmFtZSA9IHBhdGguZGlybmFtZShmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCkpXG4gIDsgKGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBmaWxlID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL2dlbmVyYXRlZC10eXBlcy50cycpXG4gICAgYXdhaXQgZnMud3JpdGVGaWxlKGZpbGUsIGdlbmVyYXRlZCwgJ3V0ZjgnKVxuICAgIGNvbnNvbGUubG9nKGBHZW5lcmF0ZWQgdHlwZXMgd3JpdHRlbiB0byAke2ZpbGV9YClcbiAgfSkoKVxuIl0sIm5hbWVzIjpbImZzIiwicGF0aCIsImZpbGVVUkxUb1BhdGgiLCJwYXNza2V5Iiwic3NvIiwic3RyaXBlIiwiY2hlY2tvdXQiLCJwb2xhciIsIlBvbGFyIiwiZ2V0U2NoZW1hIiwibmV4dENvb2tpZXMiLCJhZG1pbiIsImFub255bW91cyIsImFwaUtleSIsImJlYXJlciIsImN1c3RvbVNlc3Npb24iLCJkZXZpY2VBdXRob3JpemF0aW9uIiwiZW1haWxPVFAiLCJnZW5lcmljT0F1dGgiLCJqd3QiLCJsYXN0TG9naW5NZXRob2QiLCJtYWdpY0xpbmsiLCJtY3AiLCJtdWx0aVNlc3Npb24iLCJvaWRjUHJvdmlkZXIiLCJvbmVUYXAiLCJvbmVUaW1lVG9rZW4iLCJvcGVuQVBJIiwib3JnYW5pemF0aW9uIiwicGhvbmVOdW1iZXIiLCJ0d29GYWN0b3IiLCJ1c2VybmFtZSIsImVtYWlsSGFybW9ueSIsInBob25lSGFybW9ueSIsIlN0cmlwZSIsImNsaWVudCIsImFjY2Vzc1Rva2VuIiwic2VydmVyIiwicGx1Z2lucyIsInNlbmRWZXJpZmljYXRpb25PVFAiLCJzZW5kTWFnaWNMaW5rIiwic2VuZE9UUCIsImxvZ2luUGFnZSIsImNvbmZpZyIsInByb3ZpZGVySWQiLCJjbGllbnRJZCIsImNsaWVudFNlY3JldCIsInRlYW1zIiwiZW5hYmxlZCIsInN0b3JlSW5EYXRhYmFzZSIsInN0cmlwZUNsaWVudCIsInN0cmlwZVdlYmhvb2tTZWNyZXQiLCJzdWJzY3JpcHRpb24iLCJwbGFucyIsIm5hbWUiLCJwcmljZUlkIiwidXNlIiwicHJvZHVjdHMiLCJwcm9kdWN0SWQiLCJzbHVnIiwic3VjY2Vzc1VybCIsImF1dGhlbnRpY2F0ZWRVc2Vyc09ubHkiLCJiZXR0ZXJBdXRoQ29uZmlnIiwiZW1haWxBbmRQYXNzd29yZCIsInVzZXIiLCJhZGRpdGlvbmFsRmllbGRzIiwicm9sZSIsInR5cGUiLCJkZWZhdWx0VmFsdWUiLCJpbnB1dCIsImJhc2VTY2hlbWEiLCJtYXAiLCJ0IiwicGFzY2FsIiwicyIsInNwbGl0IiwicCIsImNoYXJBdCIsInRvVXBwZXJDYXNlIiwic2xpY2UiLCJqb2luIiwiZGlmZiIsImJhc2UiLCJ0YXJnZXQiLCJkIiwibSIsImZpZWxkcyIsIk9iamVjdCIsImVudHJpZXMiLCJhZGRlZCIsImZpbHRlciIsImsiLCJsZW5ndGgiLCJmcm9tRW50cmllcyIsImdlbiIsIm91dCIsInBsdWdpbkFkZHMiLCJzZWVuIiwiU2V0IiwicGwiLCJpZCIsImhhcyIsImFkZCIsImFkZHMiLCJmIiwibW9kZWxzIiwia2V5cyIsIm1vZGVsIiwiUCIsInBsdWdpbnNGb3JNb2RlbCIsInBsdWdpbklkcyIsImZpZWxkTmFtZSIsInJlcXVpcmVkIiwibmVlZFBsdWdpbk1hcCIsInBpZCIsImZsZHMiLCJKU09OIiwic3RyaW5naWZ5Iiwib25seSIsInBhcnRzIiwicHVzaCIsIm1hcE5hbWUiLCJ1bmRlZmluZWQiLCJwbHVnaW5JZFVuaW9uIiwiZ2VuZXJhdGVkIiwiX19kaXJuYW1lIiwiZGlybmFtZSIsInVybCIsImZpbGUiLCJyZXNvbHZlIiwid3JpdGVGaWxlIiwiY29uc29sZSIsImxvZyJdLCJtYXBwaW5ncyI6IkFBQUEsT0FBT0EsUUFBUSxtQkFBa0I7QUFDakMsT0FBT0MsVUFBVSxZQUFXO0FBQzVCLFNBQVNDLGFBQWEsUUFBUSxXQUFVO0FBQ3hDLFNBQVNDLE9BQU8sUUFBUSx1QkFBc0I7QUFDOUMsU0FBU0MsR0FBRyxRQUFRLG1CQUFrQjtBQUN0QyxTQUFTQyxNQUFNLFFBQVEsc0JBQXFCO0FBQzVDLFNBQVNDLFFBQVEsRUFBRUMsS0FBSyxRQUFRLHdCQUF1QjtBQUN2RCxTQUFTQyxLQUFLLFFBQVEsZ0JBQWU7QUFFckMsU0FBU0MsU0FBUyxRQUFRLGlCQUFnQjtBQUMxQyxTQUFTQyxXQUFXLFFBQVEs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