import { baModelKey } from "../../../../constants";
import { getCollectionByModelKey } from "../../../../helpers/get-collection";
import { getPayloadAuth } from "../../../get-payload-auth";
import { cookies } from "next/headers";
export function getAfterLogoutHook() {
    const hook = async ({ req })=>{
        const store = await cookies();
        const payload = await getPayloadAuth(req.payload.config);
        const { sessionToken, sessionData, dontRememberToken } = (await payload.betterAuth.$context).authCookies;
        const sessionsSlug = getCollectionByModelKey(req.payload.collections, baModelKey.session).slug;
        await deleteSessionFromDb(payload, sessionsSlug, store.get(sessionToken.name)?.value, req);
        const baseNames = [
            sessionToken.name,
            sessionData.name,
            dontRememberToken.name,
            //This is a hacky wat to delete the admin session cookie (BETTER AUTH HARDCODED THIS)
            // see https://github.com/better-auth/better-auth/blob/25e82669eed83ba6da063c167e8ae5b7da84ef9f/packages/better-auth/src/plugins/admin/admin.ts#L917C7-L917C23
            'admin_session'
        ];
        const multiBase = `${sessionToken.name}_multi`;
        const multiCandidates = store.getAll().filter((c)=>c.name.startsWith(multiBase) || c.name.startsWith(`__Secure-${multiBase}`)).map((c)=>c.name);
        const allNames = [
            ...baseNames.flatMap((n)=>{
                const clean = n.replace(/^__Secure-/, '');
                return [
                    clean,
                    `__Secure-${clean}`
                ];
            }),
            ...multiCandidates
        ];
        allNames.forEach((n)=>deleteCookie(store, n));
    };
    return hook;
}
async function deleteSessionFromDb(payload, slug, rawCookieValue, req) {
    if (!rawCookieValue) return;
    const [token] = rawCookieValue.split('.');
    const { docs } = await payload.find({
        collection: slug,
        where: {
            token: {
                equals: token
            }
        },
        limit: 1,
        req
    });
    const session = docs.at(0);
    if (!session) return;
    try {
        await payload.delete({
            collection: slug,
            where: {
                id: {
                    equals: session.id
                }
            },
            req
        });
    } catch  {}
}
/**
 * Deleting __Secure-* cookies need to set options.secure = true
 */ function deleteCookie(store, name) {
    const cookie = store.get(name);
    if (!cookie) return;
    const isSecure = name.startsWith('__Secure-') || name.startsWith('__Host-');
    const options = {
        path: '/',
        maxAge: 0,
        httpOnly: true,
        sameSite: 'lax'
    };
    if (isSecure) options.secure = true;
    store.set(name, '', options);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vbGliL2J1aWxkLWNvbGxlY3Rpb25zL3VzZXJzL2hvb2tzL2FmdGVyLWxvZ291dC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBiYU1vZGVsS2V5IH0gZnJvbSAnQC9iZXR0ZXItYXV0aC9wbHVnaW4vY29uc3RhbnRzJ1xuaW1wb3J0IHsgZ2V0Q29sbGVjdGlvbkJ5TW9kZWxLZXkgfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi9oZWxwZXJzL2dldC1jb2xsZWN0aW9uJ1xuaW1wb3J0IHsgZ2V0UGF5bG9hZEF1dGggfSBmcm9tICdAL2JldHRlci1hdXRoL3BsdWdpbi9saWIvZ2V0LXBheWxvYWQtYXV0aCdcbmltcG9ydCB7IGNvb2tpZXMgfSBmcm9tICduZXh0L2hlYWRlcnMnXG5pbXBvcnQgdHlwZSB7IENvbGxlY3Rpb25BZnRlckxvZ291dEhvb2ssIFBheWxvYWRSZXF1ZXN0IH0gZnJvbSAncGF5bG9hZCdcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFmdGVyTG9nb3V0SG9vaygpIHtcbiAgY29uc3QgaG9vazogQ29sbGVjdGlvbkFmdGVyTG9nb3V0SG9vayA9IGFzeW5jICh7IHJlcSB9KSA9PiB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBjb29raWVzKClcbiAgICBjb25zdCBwYXlsb2FkID0gYXdhaXQgZ2V0UGF5bG9hZEF1dGgocmVxLnBheWxvYWQuY29uZmlnKVxuXG4gICAgY29uc3QgeyBzZXNzaW9uVG9rZW4sIHNlc3Npb25EYXRhLCBkb250UmVtZW1iZXJUb2tlbiB9ID0gKGF3YWl0IHBheWxvYWQuYmV0dGVyQXV0aC4kY29udGV4dCkuYXV0aENvb2tpZXNcblxuICAgIGNvbnN0IHNlc3Npb25zU2x1ZyA9IGdldENvbGxlY3Rpb25CeU1vZGVsS2V5KHJlcS5wYXlsb2FkLmNvbGxlY3Rpb25zLCBiYU1vZGVsS2V5LnNlc3Npb24pLnNsdWdcblxuICAgIGF3YWl0IGRlbGV0ZVNlc3Npb25Gcm9tRGIocGF5bG9hZCwgc2Vzc2lvbnNTbHVnLCBzdG9yZS5nZXQoc2Vzc2lvblRva2VuLm5hbWUpPy52YWx1ZSwgcmVxKVxuXG4gICAgY29uc3QgYmFzZU5hbWVzID0gW1xuICAgICAgc2Vzc2lvblRva2VuLm5hbWUsXG4gICAgICBzZXNzaW9uRGF0YS5uYW1lLFxuICAgICAgZG9udFJlbWVtYmVyVG9rZW4ubmFtZSxcbiAgICAgIC8vVGhpcyBpcyBhIGhhY2t5IHdhdCB0byBkZWxldGUgdGhlIGFkbWluIHNlc3Npb24gY29va2llIChCRVRURVIgQVVUSCBIQVJEQ09ERUQgVEhJUylcbiAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vYmV0dGVyLWF1dGgvYmV0dGVyLWF1dGgvYmxvYi8yNWU4MjY2OWVlZDgzYmE2ZGEwNjNjMTY3ZThhZTViN2RhODRlZjlmL3BhY2thZ2VzL2JldHRlci1hdXRoL3NyYy9wbHVnaW5zL2FkbWluL2FkbWluLnRzI0w5MTdDNy1MOTE3QzIzXG4gICAgICAnYWRtaW5fc2Vzc2lvbidcbiAgICBdXG5cbiAgICBjb25zdCBtdWx0aUJhc2UgPSBgJHtzZXNzaW9uVG9rZW4ubmFtZX1fbXVsdGlgXG4gICAgY29uc3QgbXVsdGlDYW5kaWRhdGVzID0gc3RvcmVcbiAgICAgIC5nZXRBbGwoKVxuICAgICAgLmZpbHRlcigoYykgPT4gYy5uYW1lLnN0YXJ0c1dpdGgobXVsdGlCYXNlKSB8fCBjLm5hbWUuc3RhcnRzV2l0aChgX19TZWN1cmUtJHttdWx0aUJhc2V9YCkpXG4gICAgICAubWFwKChjKSA9PiBjLm5hbWUpXG5cbiAgICBjb25zdCBhbGxOYW1lcyA9IFtcbiAgICAgIC4uLmJhc2VOYW1lcy5mbGF0TWFwKChuKSA9PiB7XG4gICAgICAgIGNvbnN0IGNsZWFuID0gbi5yZXBsYWNlKC9eX19TZWN1cmUtLywgJycpXG4gICAgICAgIHJldHVybiBbY2xlYW4sIGBfX1NlY3VyZS0ke2NsZWFufWBdXG4gICAgICB9KSxcbiAgICAgIC4uLm11bHRpQ2FuZGlkYXRlc1xuICAgIF1cblxuICAgIGFsbE5hbWVzLmZvckVhY2goKG4pID0+IGRlbGV0ZUNvb2tpZShzdG9yZSwgbikpXG4gIH1cblxuICByZXR1cm4gaG9va1xufVxuXG5hc3luYyBmdW5jdGlvbiBkZWxldGVTZXNzaW9uRnJvbURiKFxuICBwYXlsb2FkOiBBd2FpdGVkPFJldHVyblR5cGU8dHlwZW9mIGdldFBheWxvYWRBdXRoPj4sXG4gIHNsdWc6IHN0cmluZyxcbiAgcmF3Q29va2llVmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgcmVxOiBQYXlsb2FkUmVxdWVzdFxuKSB7XG4gIGlmICghcmF3Q29va2llVmFsdWUpIHJldHVyblxuICBjb25zdCBbdG9rZW5dID0gcmF3Q29va2llVmFsdWUuc3BsaXQoJy4nKVxuICBjb25zdCB7IGRvY3MgfSA9IGF3YWl0IHBheWxvYWQuZmluZCh7XG4gICAgY29sbGVjdGlvbjogc2x1ZyxcbiAgICB3aGVyZTogeyB0b2tlbjogeyBlcXVhbHM6IHRva2VuIH0gfSxcbiAgICBsaW1pdDogMSxcbiAgICByZXFcbiAgfSlcbiAgY29uc3Qgc2Vzc2lvbiA9IGRvY3MuYXQoMClcbiAgaWYgKCFzZXNzaW9uKSByZXR1cm5cbiAgdHJ5IHtcbiAgICBhd2FpdCBwYXlsb2FkLmRlbGV0ZSh7XG4gICAgICBjb2xsZWN0aW9uOiBzbHVnLFxuICAgICAgd2hlcmU6IHsgaWQ6IHsgZXF1YWxzOiBzZXNzaW9uLmlkIH0gfSxcbiAgICAgIHJlcVxuICAgIH0pXG4gIH0gY2F0Y2gge31cbn1cblxuLyoqXG4gKiBEZWxldGluZyBfX1NlY3VyZS0qIGNvb2tpZXMgbmVlZCB0byBzZXQgb3B0aW9ucy5zZWN1cmUgPSB0cnVlXG4gKi9cbmZ1bmN0aW9uIGRlbGV0ZUNvb2tpZShzdG9yZTogQXdhaXRlZDxSZXR1cm5UeXBlPHR5cGVvZiBjb29raWVzPj4sIG5hbWU6IHN0cmluZykge1xuICBjb25zdCBjb29raWUgPSBzdG9yZS5nZXQobmFtZSlcbiAgaWYgKCFjb29raWUpIHJldHVyblxuXG4gIGNvbnN0IGlzU2VjdXJlID0gbmFtZS5zdGFydHNXaXRoKCdfX1NlY3VyZS0nKSB8fCBuYW1lLnN0YXJ0c1dpdGgoJ19fSG9zdC0nKVxuXG4gIGNvbnN0IG9wdGlvbnM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge1xuICAgIHBhdGg6ICcvJyxcbiAgICBtYXhBZ2U6IDAsXG4gICAgaHR0cE9ubHk6IHRydWUsXG4gICAgc2FtZVNpdGU6ICdsYXgnXG4gIH1cblxuICBpZiAoaXNTZWN1cmUpIG9wdGlvbnMuc2VjdXJlID0gdHJ1ZVxuXG4gIHN0b3JlLnNldChuYW1lLCAnJywgb3B0aW9ucylcbn1cbiJdLCJuYW1lcyI6WyJiYU1vZGVsS2V5IiwiZ2V0Q29sbGVjdGlvbkJ5TW9kZWxLZXkiLCJnZXRQYXlsb2FkQXV0aCIsImNvb2tpZXMiLCJnZXRBZnRlckxvZ291dEhvb2siLCJob29rIiwicmVxIiwic3RvcmUiLCJwYXlsb2FkIiwiY29uZmlnIiwic2Vzc2lvblRva2VuIiwic2Vzc2lvbkRhdGEiLCJkb250UmVtZW1iZXJUb2tlbiIsImJldHRlckF1dGgiLCIkY29udGV4dCIsImF1dGhDb29raWVzIiwic2Vzc2lvbnNTbHVnIiwiY29sbGVjdGlvbnMiLCJzZXNzaW9uIiwic2x1ZyIsImRlbGV0ZVNlc3Npb25Gcm9tRGIiLCJnZXQiLCJuYW1lIiwidmFsdWUiLCJiYXNlTmFtZXMiLCJtdWx0aUJhc2UiLCJtdWx0aUNhbmRpZGF0ZXMiLCJnZXRBbGwiLCJmaWx0ZXIiLCJjIiwic3RhcnRzV2l0aCIsIm1hcCIsImFsbE5hbWVzIiwiZmxhdE1hcCIsIm4iLCJjbGVhbiIsInJlcGxhY2UiLCJmb3JFYWNoIiwiZGVsZXRlQ29va2llIiwicmF3Q29va2llVmFsdWUiLCJ0b2tlbiIsInNwbGl0IiwiZG9jcyIsImZpbmQiLCJjb2xsZWN0aW9uIiwid2hlcmUiLCJlcXVhbHMiLCJsaW1pdCIsImF0IiwiZGVsZXRlIiwiaWQiLCJjb29raWUiLCJpc1NlY3VyZSIsIm9wdGlvbnMiLCJw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