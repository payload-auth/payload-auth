import { stripe } from "@better-auth/stripe";
import { emailHarmony, phoneHarmony } from "better-auth-harmony";
import { getSchema } from "better-auth/db";
import { admin, anonymous, apiKey, bearer, emailOTP, genericOAuth, jwt, magicLink, multiSession, oneTap, oneTimeToken, openAPI, organization, oidcProvider, phoneNumber, twoFactor, username, customSession } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { passkey } from "better-auth/plugins/passkey";
import { sso } from "better-auth/plugins/sso";
import { polar } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import Stripe from "stripe";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const polarClient = new Polar({
    accessToken: 'pk_test_1234567890',
    server: 'sandbox'
});
const stripeClient = new Stripe('sk_test_fake_key_for_types_generation', {
    apiVersion: '2025-08-27.basil'
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
    stripe({
        stripeClient,
        stripeWebhookSecret: 'whsec_test_fake_webhook_secret',
        subscription: {
            enabled: true,
            plans: [
                {
                    name: 'Basic',
                    priceId: 'price_basic',
                    lookupKey: 'basic'
                },
                {
                    name: 'Pro',
                    priceId: 'price_pro',
                    lookupKey: 'pro'
                },
                {
                    name: 'Enterprise',
                    priceId: 'price_enterprise',
                    lookupKey: 'enterprise'
                }
            ]
        }
    }),
    // As of writing this, Polar don't create schema fields, but just in case in the future we leave this here.
    polar({
        client: polarClient,
        checkout: {
            enabled: true,
            products: [
                {
                    productId: 'basic',
                    slug: 'basic'
                },
                {
                    productId: 'pro',
                    slug: 'pro'
                },
                {
                    productId: 'enterprise',
                    slug: 'enterprise'
                }
            ]
        }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9zY3JpcHRzL2dlbmVyYXRlLXR5cGVzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHN0cmlwZSB9IGZyb20gJ0BiZXR0ZXItYXV0aC9zdHJpcGUnXG5pbXBvcnQgeyBlbWFpbEhhcm1vbnksIHBob25lSGFybW9ueSB9IGZyb20gJ2JldHRlci1hdXRoLWhhcm1vbnknXG5pbXBvcnQgeyBnZXRTY2hlbWEgfSBmcm9tICdiZXR0ZXItYXV0aC9kYidcbmltcG9ydCB0eXBlIHsgRmllbGRBdHRyaWJ1dGUgfSBmcm9tICdiZXR0ZXItYXV0aC9kYidcbmltcG9ydCB7XG4gIGFkbWluLFxuICBhbm9ueW1vdXMsXG4gIGFwaUtleSxcbiAgYmVhcmVyLFxuICBlbWFpbE9UUCxcbiAgZ2VuZXJpY09BdXRoLFxuICBqd3QsXG4gIG1hZ2ljTGluayxcbiAgbXVsdGlTZXNzaW9uLFxuICBvbmVUYXAsXG4gIG9uZVRpbWVUb2tlbixcbiAgb3BlbkFQSSxcbiAgb3JnYW5pemF0aW9uLFxuICBvaWRjUHJvdmlkZXIsXG4gIHBob25lTnVtYmVyLFxuICB0d29GYWN0b3IsXG4gIHVzZXJuYW1lLFxuICBjdXN0b21TZXNzaW9uXG59IGZyb20gJ2JldHRlci1hdXRoL3BsdWdpbnMnXG5pbXBvcnQgeyBuZXh0Q29va2llcyB9IGZyb20gJ2JldHRlci1hdXRoL25leHQtanMnXG5pbXBvcnQgeyBwYXNza2V5IH0gZnJvbSAnYmV0dGVyLWF1dGgvcGx1Z2lucy9wYXNza2V5J1xuaW1wb3J0IHsgc3NvIH0gZnJvbSAnYmV0dGVyLWF1dGgvcGx1Z2lucy9zc28nXG5pbXBvcnQgeyBwb2xhciB9IGZyb20gJ0Bwb2xhci1zaC9iZXR0ZXItYXV0aCdcbmltcG9ydCB7IFBvbGFyIH0gZnJvbSAnQHBvbGFyLXNoL3NkaydcbmltcG9ydCBTdHJpcGUgZnJvbSAnc3RyaXBlJ1xuaW1wb3J0IHR5cGUgeyBTYW5pdGl6ZWRCZXR0ZXJBdXRoT3B0aW9ucyB9IGZyb20gJy4uL3R5cGVzJ1xuaW1wb3J0IGZzIGZyb20gJ25vZGU6ZnMvcHJvbWlzZXMnXG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnXG5cbmNvbnN0IHBvbGFyQ2xpZW50ID0gbmV3IFBvbGFyKHtcbiAgYWNjZXNzVG9rZW46ICdwa190ZXN0XzEyMzQ1Njc4OTAnLFxuICBzZXJ2ZXI6ICdzYW5kYm94J1xufSk7XG5cbmNvbnN0IHN0cmlwZUNsaWVudCA9IG5ldyBTdHJpcGUoJ3NrX3Rlc3RfZmFrZV9rZXlfZm9yX3R5cGVzX2dlbmVyYXRpb24nLCB7XG4gIGFwaVZlcnNpb246ICcyMDI1LTA4LTI3LmJhc2lsJ1xufSk7XG5cbmNvbnN0IHBsdWdpbnMgPSBbXG4gIHVzZXJuYW1lKCksXG4gIGFkbWluKCksXG4gIGFwaUtleSgpLFxuICBwYXNza2V5KCksXG4gIGVtYWlsSGFybW9ueSgpLFxuICBwaG9uZUhhcm1vbnkoKSxcbiAgYmVhcmVyKCksXG4gIGVtYWlsT1RQKHsgc2VuZFZlcmlmaWNhdGlvbk9UUDogYXN5bmMgKCkgPT4ge30gfSksXG4gIG1hZ2ljTGluayh7IHNlbmRNYWdpY0xpbms6IGFzeW5jICgpID0+IHt9IH0pLFxuICBwaG9uZU51bWJlcih7IHNlbmRPVFA6IGFzeW5jICgpID0+IHt9IH0pLFxuICBvbmVUYXAoKSxcbiAgYW5vbnltb3VzKCksXG4gIG11bHRpU2Vzc2lvbigpLFxuICBvbmVUaW1lVG9rZW4oKSxcbiAgb2lkY1Byb3ZpZGVyKHsgbG9naW5QYWdlOiAnJyB9KSxcbiAgc3NvKCksXG4gIGdlbmVyaWNPQXV0aCh7IGNvbmZpZzogW3sgcHJvdmlkZXJJZDogJ3R5cGVzY3JpcHQnLCBjbGllbnRJZDogJ3R5cGVzY3JpcHQnLCBjbGllbnRTZWNyZXQ6ICd0eXBlc2NyaXB0JyB9XSB9KSxcbiAgb3BlbkFQSSgpLFxuICBvcmdhbml6YXRpb24oeyB0ZWFtczogeyBlbmFibGVkOiB0cnVlIH0gfSksXG4gIGp3dCgpLFxuICB0d29GYWN0b3IoKSxcbiAgcGhvbmVOdW1iZXIoKSxcbiAgbmV4dENvb2tpZXMoKSxcbiAgY3VzdG9tU2Vzc2lvbihhc3luYyAoKSA9PiAoe30pKSxcbiAgc3RyaXBlKHtcbiAgICBzdHJpcGVDbGllbnQsXG4gICAgc3RyaXBlV2ViaG9va1NlY3JldDogJ3doc2VjX3Rlc3RfZmFrZV93ZWJob29rX3NlY3JldCcsXG4gICAgc3Vic2NyaXB0aW9uOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgcGxhbnM6IFtcbiAgICAgICAgeyBuYW1lOiAnQmFzaWMnLCBwcmljZUlkOiAncHJpY2VfYmFzaWMnLCBsb29rdXBLZXk6ICdiYXNpYycgfSxcbiAgICAgICAgeyBuYW1lOiAnUHJvJywgcHJpY2VJZDogJ3ByaWNlX3BybycsIGxvb2t1cEtleTogJ3BybycgfSxcbiAgICAgICAgeyBuYW1lOiAnRW50ZXJwcmlzZScsIHByaWNlSWQ6ICdwcmljZV9lbnRlcnByaXNlJywgbG9va3VwS2V5OiAnZW50ZXJwcmlzZScgfVxuICAgICAgXVxuICAgIH1cbiAgfSksXG4gIC8vIEFzIG9mIHdyaXRpbmcgdGhpcywgUG9sYXIgZG9uJ3QgY3JlYXRlIHNjaGVtYSBmaWVsZHMsIGJ1dCBqdXN0IGluIGNhc2UgaW4gdGhlIGZ1dHVyZSB3ZSBsZWF2ZSB0aGlzIGhlcmUuXG4gIHBvbGFyKHtcbiAgICBjbGllbnQ6IHBvbGFyQ2xpZW50LFxuICAgIGNoZWNrb3V0OiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgcHJvZHVjdHM6IFtcbiAgICAgICAgeyBwcm9kdWN0SWQ6ICdiYXNpYycsIHNsdWc6ICdiYXNpYycgfSxcbiAgICAgICAgeyBwcm9kdWN0SWQ6ICdwcm8nLCBzbHVnOiAncHJvJyB9LFxuICAgICAgICB7IHByb2R1Y3RJZDogJ2VudGVycHJpc2UnLCBzbHVnOiAnZW50ZXJwcmlzZScgfVxuICAgICAgXVxuICAgIH1cbiAgfSlcbl1cblxuY29uc3QgYmV0dGVyQXV0aENvbmZpZzogU2FuaXRpemVkQmV0dGVyQXV0aE9wdGlvbnMgPSB7XG4gIGVtYWlsQW5kUGFzc3dvcmQ6IHsgZW5hYmxlZDogdHJ1ZSB9LFxuICB1c2VyOiB7IGFkZGl0aW9uYWxGaWVsZHM6IHsgcm9sZTogeyB0eXBlOiAnc3RyaW5nJywgZGVmYXVsdFZhbHVlOiAndXNlcicsIGlucHV0OiBmYWxzZSB9IH0gfSxcbiAgcGx1Z2luc1xufVxuXG5jb25zdCBiYXNlU2NoZW1hID0gZ2V0U2NoZW1hKHsgLi4uYmV0dGVyQXV0aENvbmZpZywgcGx1Z2luczogW10gfSlcblxudHlwZSBTY2hlbWEgPSBSZWNvcmQ8c3RyaW5nLCB7IGZpZWxkczogUmVjb3JkPHN0cmluZywgRmllbGRBdHRyaWJ1dGU+IH0+XG5cbmNvbnN0IG1hcCA9ICh0OiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICBpZiAodCA9PT0gJ2Jvb2xlYW4nKSByZXR1cm4gJ2Jvb2xlYW4nXG4gIGlmICh0ID09PSAnZGF0ZScpIHJldHVybiAnRGF0ZSdcbiAgaWYgKHQgPT09ICdudW1iZXInKSByZXR1cm4gJ251bWJlcidcbiAgaWYgKHQgPT09ICdzdHJpbmcnKSByZXR1cm4gJ3N0cmluZydcbiAgaWYgKHQgPT09ICdudW1iZXJbXScpIHJldHVybiAnbnVtYmVyW10nXG4gIGlmICh0ID09PSAnc3RyaW5nW10nKSByZXR1cm4gJ3N0cmluZ1tdJ1xuICByZXR1cm4gJ3Vua25vd24nXG59XG5cbmNvbnN0IHBhc2NhbCA9IChzOiBzdHJpbmcpOiBzdHJpbmcgPT5cbiAgc1xuICAgIC5zcGxpdCgvWy1fXS9nKVxuICAgIC5tYXAoKHApID0+IHAuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwLnNsaWNlKDEpKVxuICAgIC5qb2luKCcnKVxuXG5jb25zdCBkaWZmID0gKGJhc2U6IFNjaGVtYSwgdGFyZ2V0OiBTY2hlbWEpOiBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCBGaWVsZEF0dHJpYnV0ZT4+ID0+IHtcbiAgY29uc3QgZDogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgRmllbGRBdHRyaWJ1dGU+PiA9IHt9XG4gIGZvciAoY29uc3QgW20sIHsgZmllbGRzIH1dIG9mIE9iamVjdC5lbnRyaWVzKHRhcmdldCkpIHtcbiAgICBjb25zdCBhZGRlZCA9IE9iamVjdC5lbnRyaWVzKGZpZWxkcykuZmlsdGVyKChba10pID0+ICEoayBpbiAoYmFzZVttXT8uZmllbGRzID8/IHt9KSkpXG4gICAgaWYgKGFkZGVkLmxlbmd0aCkgZFttXSA9IE9iamVjdC5mcm9tRW50cmllcyhhZGRlZClcbiAgfVxuICByZXR1cm4gZFxufVxuXG5jb25zdCBnZW4gPSAoKTogc3RyaW5nID0+IHtcbiAgbGV0IG91dCA9ICcvLyBBdXRvLWdlbmVyYXRlZCB0eXBlcy4gRG8gbm90IGVkaXQuXFxuXFxuJ1xuXG4gIGNvbnN0IHBsdWdpbkFkZHM6IFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIEZpZWxkQXR0cmlidXRlPj4+ID0ge31cbiAgY29uc3Qgc2VlbiA9IG5ldyBTZXQ8c3RyaW5nPigpXG5cbiAgZm9yIChjb25zdCBwbCBvZiBwbHVnaW5zKSB7XG4gICAgY29uc3QgaWQgPSAocGwgYXMgYW55KS5pZCBhcyBzdHJpbmcgfCB1bmRlZmluZWRcbiAgICBpZiAoIWlkIHx8IHNlZW4uaGFzKGlkKSkgY29udGludWVcbiAgICBzZWVuLmFkZChpZClcbiAgICBjb25zdCBhZGRzID0gZGlmZihiYXNlU2NoZW1hLCBnZXRTY2hlbWEoeyAuLi5iZXR0ZXJBdXRoQ29uZmlnLCBwbHVnaW5zOiBbcGxdIH0pKVxuICAgIGZvciAoY29uc3QgW20sIGZdIG9mIE9iamVjdC5lbnRyaWVzKGFkZHMpKSB7XG4gICAgICBwbHVnaW5BZGRzW21dID8/PSB7fVxuICAgICAgcGx1Z2luQWRkc1ttXVtpZF0gPSBmXG4gICAgfVxuICB9XG5cbiAgY29uc3QgbW9kZWxzID0gbmV3IFNldDxzdHJpbmc+KFsuLi5PYmplY3Qua2V5cyhiYXNlU2NoZW1hKSwgLi4uT2JqZWN0LmtleXMocGx1Z2luQWRkcyldKVxuXG4gIGZvciAoY29uc3QgbW9kZWwgb2YgbW9kZWxzKSB7XG4gICAgY29uc3QgUCA9IHBhc2NhbChtb2RlbClcbiAgICBjb25zdCBiYXNlID0gYmFzZVNjaGVtYVttb2RlbF0/LmZpZWxkcyA/PyB7fVxuICAgIGNvbnN0IHBsdWdpbnNGb3JNb2RlbCA9IHBsdWdpbkFkZHNbbW9kZWxdID8/IHt9XG4gICAgY29uc3QgcGx1Z2luSWRzID0gT2JqZWN0LmtleXMocGx1Z2luc0Zvck1vZGVsKVxuXG4gICAgaWYgKE9iamVjdC5rZXlzKGJhc2UpLmxlbmd0aCkge1xuICAgICAgb3V0ICs9IGBleHBvcnQgdHlwZSBCYXNlJHtQfUZpZWxkcyA9IHtcXG5gXG4gICAgICBmb3IgKGNvbnN0IFtrLCBmXSBvZiBPYmplY3QuZW50cmllcyhiYXNlKSkgb3V0ICs9IGAgICR7Zi5maWVsZE5hbWUgPz8ga30ke2YucmVxdWlyZWQgPyAnJyA6ICc/J306ICR7bWFwKGYudHlwZSBhcyBzdHJpbmcpfVxcbmBcbiAgICAgIG91dCArPSAnfVxcblxcbidcbiAgICB9XG5cbiAgICBjb25zdCBuZWVkUGx1Z2luTWFwID0gcGx1Z2luSWRzLmxlbmd0aCA+IDEgfHwgT2JqZWN0LmtleXMoYmFzZSkubGVuZ3RoXG4gICAgaWYgKG5lZWRQbHVnaW5NYXAgJiYgcGx1Z2luSWRzLmxlbmd0aCkge1xuICAgICAgb3V0ICs9IGBleHBvcnQgdHlwZSAke1B9UGx1Z2luRmllbGRzID0ge1xcbmBcbiAgICAgIGZvciAoY29uc3QgW3BpZCwgZmxkc10gb2YgT2JqZWN0LmVudHJpZXMocGx1Z2luc0Zvck1vZGVsKSkge1xuICAgICAgICBvdXQgKz0gYCAgJHtKU09OLnN0cmluZ2lmeShwaWQpfToge1xcbmBcbiAgICAgICAgZm9yIChjb25zdCBbaywgZl0gb2YgT2JqZWN0LmVudHJpZXMoZmxkcykpIG91dCArPSBgICAgICR7Zi5maWVsZE5hbWUgPz8ga30ke2YucmVxdWlyZWQgPyAnJyA6ICc/J306ICR7bWFwKGYudHlwZSBhcyBzdHJpbmcpfVxcbmBcbiAgICAgICAgb3V0ICs9ICcgIH1cXG4nXG4gICAgICB9XG4gICAgICBvdXQgKz0gJ31cXG5cXG4nXG4gICAgfVxuXG4gICAgaWYgKCFPYmplY3Qua2V5cyhiYXNlKS5sZW5ndGggJiYgcGx1Z2luSWRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgY29uc3Qgb25seSA9IHBsdWdpbklkc1swXVxuICAgICAgb3V0ICs9IGBleHBvcnQgdHlwZSAke1B9RmllbGRzID0ge1xcbmBcbiAgICAgIGZvciAoY29uc3QgW2ssIGZdIG9mIE9iamVjdC5lbnRyaWVzKHBsdWdpbnNGb3JNb2RlbFtvbmx5XSkpXG4gICAgICAgIG91dCArPSBgICAke2YuZmllbGROYW1lID8/IGt9JHtmLnJlcXVpcmVkID8gJycgOiAnPyd9OiAke21hcChmLnR5cGUgYXMgc3RyaW5nKX1cXG5gXG4gICAgICBvdXQgKz0gJ31cXG5cXG4nXG4gICAgICBvdXQgKz0gYGV4cG9ydCB0eXBlICR7UH0gPSAke1B9RmllbGRzXFxuXFxuYFxuICAgICAgY29udGludWVcbiAgICB9XG5cbiAgICBjb25zdCBwYXJ0czogc3RyaW5nW10gPSBbXVxuICAgIGlmIChPYmplY3Qua2V5cyhiYXNlKS5sZW5ndGgpIHBhcnRzLnB1c2goYEJhc2Uke1B9RmllbGRzYClcbiAgICBpZiAocGx1Z2luSWRzLmxlbmd0aCkge1xuICAgICAgY29uc3QgbWFwTmFtZSA9IG5lZWRQbHVnaW5NYXAgPyBgJHtQfVBsdWdpbkZpZWxkc2AgOiB1bmRlZmluZWRcbiAgICAgIHBhcnRzLnB1c2goLi4ucGx1Z2luSWRzLm1hcCgoaWQpID0+IChtYXBOYW1lID8gYCR7bWFwTmFtZX1bJHtKU09OLnN0cmluZ2lmeShpZCl9XWAgOiAnbmV2ZXInKSAvKiBub3QgcmVhY2hhYmxlICovKSlcbiAgICB9XG4gICAgb3V0ICs9IGBleHBvcnQgdHlwZSAke1B9ID0gJHtwYXJ0cy5qb2luKCcgJiAnKX1cXG5cXG5gXG4gIH1cblxuICAvLyBHZW5lcmF0ZSB1bmlvbiB0eXBlIG9mIHBsdWdpbiBpZGVudGlmaWVyc1xuICBjb25zdCBwbHVnaW5JZFVuaW9uID0gWy4uLnNlZW5dXG4gICAgLm1hcCgoaWQpID0+IEpTT04uc3RyaW5naWZ5KGlkKSlcbiAgICAuam9pbignIHwgJylcbiAgb3V0ICs9IGBleHBvcnQgdHlwZSBQbHVnaW5JZCA9ICR7cGx1Z2luSWRVbmlvbn1cXG5cXG5gXG5cbiAgLy8gR2VuZXJhdGUgZnVsbCBzY2hlbWEgbWFwcGluZ1xuICBvdXQgKz0gYGV4cG9ydCB0eXBlIEJldHRlckF1dGhGdWxsU2NoZW1hID0ge1xcbmBcbiAgZm9yIChjb25zdCBtb2RlbCBvZiBtb2RlbHMpIHtcbiAgICBjb25zdCBQID0gcGFzY2FsKG1vZGVsKVxuICAgIG91dCArPSBgICAke0pTT04uc3RyaW5naWZ5KG1vZGVsKX06ICR7UH1cXG5gXG4gIH1cbiAgb3V0ICs9IGB9XFxuXFxuYFxuXG4gIC8vIEdlbmVyYXRlIHVuaW9uIHR5cGUgb2YgYWxsIG1vZGVsIG5hbWVzXG4gIG91dCArPSBgZXhwb3J0IHR5cGUgTW9kZWxLZXkgPSBrZXlvZiBCZXR0ZXJBdXRoRnVsbFNjaGVtYWBcblxuICByZXR1cm4gb3V0XG59XG5cbmNvbnN0IGdlbmVyYXRlZCA9IGdlbigpXG5cbmNvbnN0IF9fZGlybmFtZSA9IHBhdGguZGlybmFtZShmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCkpXG47KGFzeW5jICgpID0+IHtcbiAgY29uc3QgZmlsZSA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9nZW5lcmF0ZWQtdHlwZXMudHMnKVxuICBhd2FpdCBmcy53cml0ZUZpbGUoZmlsZSwgZ2VuZXJhdGVkLCAndXRmOCcpXG4gIGNvbnNvbGUubG9nKGBHZW5lcmF0ZWQgdHlwZXMgd3JpdHRlbiB0byAke2ZpbGV9YClcbn0pKClcbiJdLCJuYW1lcyI6WyJzdHJpcGUiLCJlbWFpbEhhcm1vbnkiLCJwaG9uZUhhcm1vbnkiLCJnZXRTY2hlbWEiLCJhZG1pbiIsImFub255bW91cyIsImFwaUtleSIsImJlYXJlciIsImVtYWlsT1RQIiwiZ2VuZXJpY09BdXRoIiwiand0IiwibWFnaWNMaW5rIiwibXVsdGlTZXNzaW9uIiwib25lVGFwIiwib25lVGltZVRva2VuIiwib3BlbkFQSSIsIm9yZ2FuaXphdGlvbiIsIm9pZGNQcm92aWRlciIsInBob25lTnVtYmVyIiwidHdvRmFjdG9yIiwidXNlcm5hbWUiLCJjdXN0b21TZXNzaW9uIiwibmV4dENvb2tpZXMiLCJwYXNza2V5Iiwic3NvIiwicG9sYXIiLCJQb2xhciIsIlN0cmlwZSIsImZzIiwicGF0aCIsImZpbGVVUkxUb1BhdGgiLCJwb2xhckNsaWVudCIsImFjY2Vzc1Rva2VuIiwic2VydmVyIiwic3RyaXBlQ2xpZW50IiwiYXBpVmVyc2lvbiIsInBsdWdpbnMiLCJzZW5kVmVyaWZpY2F0aW9uT1RQIiwic2VuZE1hZ2ljTGluayIsInNlbmRPVFAiLCJsb2dpblBhZ2UiLCJjb25maWciLCJwcm92aWRlcklkIiwiY2xpZW50SWQiLCJjbGllbnRTZWNyZXQiLCJ0ZWFtcyIsImVuYWJsZWQiLCJzdHJpcGVXZWJob29rU2VjcmV0Iiwic3Vic2NyaXB0aW9uIiwicGxhbnMiLCJuYW1lIiwicHJpY2VJZCIsImxvb2t1cEtleSIsImNsaWVudCIsImNoZWNrb3V0IiwicHJvZHVjdHMiLCJwcm9kdWN0SWQiLCJzbHVnIiwiYmV0dGVyQXV0aENvbmZpZyIsImVtYWlsQW5kUGFzc3dvcmQiLCJ1c2VyIiwiYWRkaXRpb25hbEZpZWxkcyIsInJvbGUiLCJ0eXBlIiwiZGVmYXVsdFZhbHVlIiwiaW5wdXQiLCJiYXNlU2NoZW1hIiwibWFwIiwidCIsInBhc2NhbCIsInMiLCJzcGxpdCIsInAiLCJjaGFyQXQiLCJ0b1VwcGVyQ2FzZSIsInNsaWNlIiwiam9pbiIsImRpZmYiLCJiYXNlIiwidGFyZ2V0IiwiZCIsIm0iLCJmaWVsZHMiLCJPYmplY3QiLCJlbnRyaWVzIiwiYWRkZWQiLCJmaWx0ZXIiLCJrIiwibGVuZ3RoIiwiZnJvbUVudHJpZXMiLCJnZW4iLCJvdXQiLCJwbHVnaW5BZGRzIiwic2VlbiIsIlNldCIsInBsIiwiaWQiLCJoYXMiLCJhZGQiLCJhZGRzIiwiZiIsIm1vZGVscyIsImtleXMiLCJtb2RlbCIsIlAiLCJwbHVnaW5zRm9yTW9kZWwiLCJwbHVnaW5JZHMiLCJmaWVsZE5hbWUiLCJyZXF1aXJlZCIsIm5lZWRQbHVnaW5NYXAiLCJwaWQiLCJmbGRzIiwiSlNPTiIsInN0cmluZ2lmeSIsIm9ubHkiLCJwYXJ0cyIsInB1c2giLCJtYXBOYW1lIiwidW5kZWZpbmVkIiwicGx1Z2luSWRVbmlvbiIsImdlbmVyYXRlZCIsIl9fZGlybmFtZSIsImRpcm5hbWUiLCJ1cmwiLCJmaWxlIiwicmVzb2x2ZSIsIndyaXRlRmlsZSIsImNvbnNvbGUiLCJsb2ciXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLE1BQU0sUUFBUSxzQkFBcUI7QUFDNUMsU0FBU0MsWUFBWSxFQUFFQyxZQUFZLFFBQVEsc0JBQXFCO0FBQ2hFLFNBQVNDLFNBQVMsUUFBUSxpQkFBZ0I7QUFFMUMsU0FDRUMsS0FBSyxFQUNMQyxTQUFTLEVBQ1RDLE1BQU0sRUFDTkMsTUFBTSxFQUNOQyxRQUFRLEVBQ1JDLFlBQVksRUFDWkMsR0FBRyxFQUNIQyxTQUFTLEVBQ1RDLFlBQVksRUFDWkMsTUFBTSxFQUNOQyxZQUFZLEVBQ1pDLE9BQU8sRUFDUEMsWUFBWSxFQUNaQyxZQUFZLEVBQ1pDLFdBQVcsRUFDWEMsU0FBUyxFQUNUQyxRQUFRLEVBQ1JDLGFBQWEsUUFDUixzQkFBcUI7QUFDNUIsU0FBU0MsV0FBVyxRQUFRLHNCQUFxQjtBQUNqRCxTQUFTQyxPQUFPLFFBQVEsOEJBQTZCO0FBQ3JELFNBQVNDLEdBQUcsUUFBUSwwQkFBeUI7QUFDN0MsU0FBU0MsS0FBSyxRQUFRLHdCQUF1QjtBQUM3QyxTQUFTQyxLQUFLLFFBQVEsZ0JBQWU7QUFDckMsT0FBT0MsWUFBWSxTQUFRO0FBRTNCLE9BQU9DLFFBQVEsbUJBQWtCO0FBQ2pDLE9BQU9DLFVBQVUsWUFBVztBQUM1QixTQUFTQyxhQUFhLFFBQVEsV0FBVTtBQUV4QyxNQUFNQyxjQUFjLElBQUlMLE1BQU07SUFDNUJNLGFBQWE7SUFDYkMsUUFBUTtBQUNWO0FBRUEsTUFBTUMsZUFBZSxJQUFJUCxPQUFPLHlDQUF5QztJQUN2RVEsWUFBWTtBQUNkO0FBRUEsTUFBTUMsVUFBVTtJQUNkaEI7SUFDQWhCO0lBQ0FFO0lBQ0FpQjtJQUNBdEI7SUFDQUM7SUFDQUs7SUFDQUMsU0FBUztRQUFFNkIscUJBQXFCLFdBQWE7SUFBRTtJQUMvQzFCLFVBQVU7UUFBRTJCLGVBQWUsV0FBYTtJQUFFO0lBQzFDcEIsWUFBWTtRQUFFcUIsU0FBUyxXQUFhO0lBQUU7SUFDdEMxQjtJQUNBUjtJQUNBTztJQUNBRTtJQUNBRyxhQUFhO1FBQUV1QixXQUFXO0lBQUc7SUFDN0JoQjtJQUNBZixhQUFhO1FBQUVnQyxRQUFRO1lBQUM7Z0JBQUVDLFlBQVk7Z0JBQWNDLFVBQVU7Z0JBQWNDLGNBQWM7WUFBYTtTQUFFO0lBQUM7SUFDMUc3QjtJQUNBQyxhQUFhO1FBQUU2QixPQUFPO1lBQUVDLFNBQVM7UUFBSztJQUFFO0lBQ3hDcEM7SUFDQVM7SUFDQUQ7SUFDQUk7SUFDQUQsY0FBYyxVQUFhLENBQUEsQ0FBQyxDQUFBO0lBQzVCckIsT0FBTztRQUNMa0M7UUFDQWEscUJBQXFCO1FBQ3JCQyxjQUFjO1lBQ1pGLFNBQVM7WUFDVEcsT0FBTztnQkFDTDtvQkFBRUMsTUFBTTtvQkFBU0MsU0FBUztvQkFBZUMsV0FBVztnQkFBUTtnQkFDNUQ7b0JBQUVGLE1BQU07b0JBQU9DLFNBQVM7b0JBQWFDLFdBQVc7Z0JBQU07Z0JBQ3REO29CQUFFRixNQUFNO29CQUFjQyxTQUFTO29CQUFvQkMsV0FBVztnQkFBYTthQUM1RTtRQUNIO0lBQ0Y7SUFDQSwyR0FBMkc7SUFDM0czQixNQUFNO1FBQ0o0QixRQUFRdEI7UUFDUnVCLFVBQVU7WUFDUlIsU0FBUztZQUNUUyxVQUFVO2dCQUNSO29CQUFFQyxXQUFXO29CQUFTQyxNQUFNO2dCQUFRO2dCQUNwQztvQkFBRUQsV0FBVztvQkFBT0MsTUFBTTtnQkFBTTtnQkFDaEM7b0JBQUVELFdBQVc7b0JBQWNDLE1BQU07Z0JBQWE7YUFDL0M7UUFDSDtJQUNGO0NBQ0Q7QUFFRCxNQUFNQyxtQkFBK0M7SUFDbkRDLGtCQUFrQjtRQUFFYixTQUFTO0lBQUs7SUFDbENjLE1BQU07UUFBRUMsa0JBQWtCO1lBQUVDLE1BQU07Z0JBQUVDLE1BQU07Z0JBQVVDLGNBQWM7Z0JBQVFDLE9BQU87WUFBTTtRQUFFO0lBQUU7SUFDM0Y3QjtBQUNGO0FBRUEsTUFBTThCLGFBQWEvRCxVQUFVO0lBQUUsR0FBR3VELGdCQUFnQjtJQUFFdEIsU0FBUyxFQUFFO0FBQUM7QUFJaEUsTUFBTStCLE1BQU0sQ0FBQ0M7SUFDWCxJQUFJQSxNQUFNLFdBQVcsT0FBTztJQUM1QixJQUFJQSxNQUFNLFFBQVEsT0FBTztJQUN6QixJQUFJQSxNQUFNLFVBQVUsT0FBTztJQUMzQixJQUFJQSxNQUFNLFVBQVUsT0FBTztJQUMzQixJQUFJQSxNQUFNLFlBQVksT0FBTztJQUM3QixJQUFJQSxNQUFNLFlBQVksT0FBTztJQUM3QixPQUFPO0FBQ1Q7QUFFQSxNQUFNQyxTQUFTLENBQUNDLElBQ2RBLEVBQ0dDLEtBQUssQ0FBQyxTQUNOSixHQUFHLENBQUMsQ0FBQ0ssSUFBTUEsRUFBRUMsTUFBTSxDQUFDLEdBQUdDLFdBQVcsS0FBS0YsRUFBRUcsS0FBSyxDQUFDLElBQy9DQyxJQUFJLENBQUM7QUFFVixNQUFNQyxPQUFPLENBQUNDLE1BQWNDO0lBQzFCLE1BQU1DLElBQW9ELENBQUM7SUFDM0QsS0FBSyxNQUFNLENBQUNDLEdBQUcsRUFBRUMsTUFBTSxFQUFFLENBQUMsSUFBSUMsT0FBT0MsT0FBTyxDQUFDTCxRQUFTO1FBQ3BELE1BQU1NLFFBQVFGLE9BQU9DLE9BQU8sQ0FBQ0YsUUFBUUksTUFBTSxDQUFDLENBQUMsQ0FBQ0MsRUFBRSxHQUFLLENBQUVBLENBQUFBLEtBQU1ULENBQUFBLElBQUksQ0FBQ0csRUFBRSxFQUFFQyxVQUFVLENBQUMsQ0FBQSxDQUFDO1FBQ2xGLElBQUlHLE1BQU1HLE1BQU0sRUFBRVIsQ0FBQyxDQUFDQyxFQUFFLEdBQUdFLE9BQU9NLFdBQVcsQ0FBQ0o7SUFDOUM7SUFDQSxPQUFPTDtBQUNUO0FBRUEsTUFBTVUsTUFBTTtJQUNWLElBQUlDLE1BQU07SUFFVixNQUFNQyxhQUE2RSxDQUFDO0lBQ3BGLE1BQU1DLE9BQU8sSUFBSUM7SUFFakIsS0FBSyxNQUFNQyxNQUFNM0QsUUFBUztRQUN4QixNQUFNNEQsS0FBSyxBQUFDRCxHQUFXQyxFQUFFO1FBQ3pCLElBQUksQ0FBQ0EsTUFBTUgsS0FBS0ksR0FBRyxDQUFDRCxLQUFLO1FBQ3pCSCxLQUFLSyxHQUFHLENBQUNGO1FBQ1QsTUFBTUcsT0FBT3RCLEtBQUtYLFlBQVkvRCxVQUFVO1lBQUUsR0FBR3VELGdCQUFnQjtZQUFFdEIsU0FBUztnQkFBQzJEO2FBQUc7UUFBQztRQUM3RSxLQUFLLE1BQU0sQ0FBQ2QsR0FBR21CLEVBQUUsSUFBSWpCLE9BQU9DLE9BQU8sQ0FBQ2UsTUFBTztZQUN6Q1AsVUFBVSxDQUFDWCxFQUFFLEtBQUssQ0FBQztZQUNuQlcsVUFBVSxDQUFDWCxFQUFFLENBQUNlLEdBQUcsR0FBR0k7UUFDdEI7SUFDRjtJQUVBLE1BQU1DLFNBQVMsSUFBSVAsSUFBWTtXQUFJWCxPQUFPbUIsSUFBSSxDQUFDcEM7V0FBZ0JpQixPQUFPbUIsSUFBSSxDQUFDVjtLQUFZO0lBRXZGLEtBQUssTUFBTVcsU0FBU0YsT0FBUTtRQUMxQixNQUFNRyxJQUFJbkMsT0FBT2tDO1FBQ2pCLE1BQU16QixPQUFPWixVQUFVLENBQUNxQyxNQUFNLEVBQUVyQixVQUFVLENBQUM7UUFDM0MsTUFBTXVCLGtCQUFrQmIsVUFBVSxDQUFDVyxNQUFNLElBQUksQ0FBQztRQUM5QyxNQUFNRyxZQUFZdkIsT0FBT21CLElBQUksQ0FBQ0c7UUFFOUIsSUFBSXRCLE9BQU9tQixJQUFJLENBQUN4QixNQUFNVSxNQUFNLEVBQUU7WUFDNUJHLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRWEsRUFBRSxZQUFZLENBQUM7WUFDekMsS0FBSyxNQUFNLENBQUNqQixHQUFHYSxFQUFFLElBQUlqQixPQUFPQyxPQUFPLENBQUNOLE1BQU9hLE9BQU8sQ0FBQyxFQUFFLEVBQUVTLEVBQUVPLFNBQVMsSUFBSXBCLElBQUlhLEVBQUVRLFFBQVEsR0FBRyxLQUFLLElBQUksRUFBRSxFQUFFekMsSUFBSWlDLEVBQUVyQyxJQUFJLEVBQVksRUFBRSxDQUFDO1lBQzdINEIsT0FBTztRQUNUO1FBRUEsTUFBTWtCLGdCQUFnQkgsVUFBVWxCLE1BQU0sR0FBRyxLQUFLTCxPQUFPbUIsSUFBSSxDQUFDeEIsTUFBTVUsTUFBTTtRQUN0RSxJQUFJcUIsaUJBQWlCSCxVQUFVbEIsTUFBTSxFQUFFO1lBQ3JDRyxPQUFPLENBQUMsWUFBWSxFQUFFYSxFQUFFLGtCQUFrQixDQUFDO1lBQzNDLEtBQUssTUFBTSxDQUFDTSxLQUFLQyxLQUFLLElBQUk1QixPQUFPQyxPQUFPLENBQUNxQixpQkFBa0I7Z0JBQ3pEZCxPQUFPLENBQUMsRUFBRSxFQUFFcUIsS0FBS0MsU0FBUyxDQUFDSCxLQUFLLEtBQUssQ0FBQztnQkFDdEMsS0FBSyxNQUFNLENBQUN2QixHQUFHYSxFQUFFLElBQUlqQixPQUFPQyxPQUFPLENBQUMyQixNQUFPcEIsT0FBTyxDQUFDLElBQUksRUFBRVMsRUFBRU8sU0FBUyxJQUFJcEIsSUFBSWEsRUFBRVEsUUFBUSxHQUFHLEtBQUssSUFBSSxFQUFFLEVBQUV6QyxJQUFJaUMsRUFBRXJDLElBQUksRUFBWSxFQUFFLENBQUM7Z0JBQy9INEIsT0FBTztZQUNUO1lBQ0FBLE9BQU87UUFDVDtRQUVBLElBQUksQ0FBQ1IsT0FBT21CLElBQUksQ0FBQ3hCLE1BQU1VLE1BQU0sSUFBSWtCLFVBQVVsQixNQUFNLEtBQUssR0FBRztZQUN2RCxNQUFNMEIsT0FBT1IsU0FBUyxDQUFDLEVBQUU7WUFDekJmLE9BQU8sQ0FBQyxZQUFZLEVBQUVhLEVBQUUsWUFBWSxDQUFDO1lBQ3JDLEtBQUssTUFBTSxDQUFDakIsR0FBR2EsRUFBRSxJQUFJakIsT0FBT0MsT0FBTyxDQUFDcUIsZUFBZSxDQUFDUyxLQUFLLEVBQ3ZEdkIsT0FBTyxDQUFDLEVBQUUsRUFBRVMsRUFBRU8sU0FBUyxJQUFJcEIsSUFBSWEsRUFBRVEsUUFBUSxHQUFHLEtBQUssSUFBSSxFQUFFLEVBQUV6QyxJQUFJaUMsRUFBRXJDLElBQUksRUFBWSxFQUFFLENBQUM7WUFDcEY0QixPQUFPO1lBQ1BBLE9BQU8sQ0FBQyxZQUFZLEVBQUVhLEVBQUUsR0FBRyxFQUFFQSxFQUFFLFVBQVUsQ0FBQztZQUMxQztRQUNGO1FBRUEsTUFBTVcsUUFBa0IsRUFBRTtRQUMxQixJQUFJaEMsT0FBT21CLElBQUksQ0FBQ3hCLE1BQU1VLE1BQU0sRUFBRTJCLE1BQU1DLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRVosRUFBRSxNQUFNLENBQUM7UUFDekQsSUFBSUUsVUFBVWxCLE1BQU0sRUFBRTtZQUNwQixNQUFNNkIsVUFBVVIsZ0JBQWdCLEdBQUdMLEVBQUUsWUFBWSxDQUFDLEdBQUdjO1lBQ3JESCxNQUFNQyxJQUFJLElBQUlWLFVBQVV2QyxHQUFHLENBQUMsQ0FBQzZCLEtBQVFxQixVQUFVLEdBQUdBLFFBQVEsQ0FBQyxFQUFFTCxLQUFLQyxTQUFTLENBQUNqQixJQUFJLENBQUMsQ0FBQyxHQUFHO1FBQ3ZGO1FBQ0FMLE9BQU8sQ0FBQyxZQUFZLEVBQUVhLEVBQUUsR0FBRyxFQUFFVyxNQUFNdkMsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDO0lBQ3REO0lBRUEsNENBQTRDO0lBQzVDLE1BQU0yQyxnQkFBZ0I7V0FBSTFCO0tBQUssQ0FDNUIxQixHQUFHLENBQUMsQ0FBQzZCLEtBQU9nQixLQUFLQyxTQUFTLENBQUNqQixLQUMzQnBCLElBQUksQ0FBQztJQUNSZSxPQUFPLENBQUMsdUJBQXVCLEVBQUU0QixjQUFjLElBQUksQ0FBQztJQUVwRCwrQkFBK0I7SUFDL0I1QixPQUFPLENBQUMsc0NBQXNDLENBQUM7SUFDL0MsS0FBSyxNQUFNWSxTQUFTRixPQUFRO1FBQzFCLE1BQU1HLElBQUluQyxPQUFPa0M7UUFDakJaLE9BQU8sQ0FBQyxFQUFFLEVBQUVxQixLQUFLQyxTQUFTLENBQUNWLE9BQU8sRUFBRSxFQUFFQyxFQUFFLEVBQUUsQ0FBQztJQUM3QztJQUNBYixPQUFPLENBQUMsS0FBSyxDQUFDO0lBRWQseUNBQXlDO0lBQ3pDQSxPQUFPLENBQUMsaURBQWlELENBQUM7SUFFMUQsT0FBT0E7QUFDVDtBQUVBLE1BQU02QixZQUFZOUI7QUFFbEIsTUFBTStCLFlBQVk1RixLQUFLNkYsT0FBTyxDQUFDNUYsY0FBYyxZQUFZNkYsR0FBRztBQUMxRCxDQUFBO0lBQ0EsTUFBTUMsT0FBTy9GLEtBQUtnRyxPQUFPLENBQUNKLFdBQVc7SUFDckMsTUFBTTdGLEdBQUdrRyxTQUFTLENBQUNGLE1BQU1KLFdBQVc7SUFDcENPLFFBQVFDLEdBQUcsQ0FBQyxDQUFDLDJCQUEyQixFQUFFSixNQUFNO0FBQ2xELENBQUEifQ==