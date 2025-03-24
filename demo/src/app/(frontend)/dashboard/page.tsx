import { headers } from "next/headers";
import { redirect } from "next/navigation";
import UserCard from "./user-card";
import { OrganizationCard } from "./organization-card";
import AccountSwitcher from "@/components/account-switch";
import getPayload from "@/lib/payload";
import { cookies } from "next/headers";

async function setSessionCookie(session: any) {
  "use server";
  const cookieStore = await cookies();
  cookieStore.set(
    "better-auth.session_data",
    session.headers.get("set-cookie") || ""
  );
}

export default async function DashboardPage() {
  const payload = await getPayload();
  const awaitedHeaders = await headers();

  const [session, activeSessions, deviceSessions, organization] =
    await Promise.all([
      payload.betterAuth.api.getSession({
        headers: awaitedHeaders,
        query: {
          disableCookieCache: true,
        },
      }),
      payload.betterAuth.api.listSessions({
        headers: awaitedHeaders,
        query: {
          disableCookieCache: true,
        },
      }),
      payload.betterAuth.api.listDeviceSessions({
        headers: awaitedHeaders,
        query: {
          disableCookieCache: true,
        },
      }),
      payload.betterAuth.api.getFullOrganization({
        headers: awaitedHeaders,
        query: {
          disableCookieCache: true,
        },
      }),
    ]);

  return (
    <div className="w-full">
      <div className="flex gap-4 flex-col">
        <AccountSwitcher
          sessions={JSON.parse(JSON.stringify(deviceSessions))}
        />
        <UserCard
          session={JSON.parse(JSON.stringify(session))}
          activeSessions={JSON.parse(JSON.stringify(activeSessions))}
        />
        <OrganizationCard
          session={JSON.parse(JSON.stringify(session))}
          activeOrganization={JSON.parse(JSON.stringify(organization))}
        />
      </div>
    </div>
  );
}
