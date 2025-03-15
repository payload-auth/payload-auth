import { headers } from "next/headers";
import { redirect } from "next/navigation";
import UserCard from "./user-card";
import { OrganizationCard } from "./organization-card";
import AccountSwitcher from "@/components/account-switch";
import getPayload from "@/lib/getPayload";

export default async function DashboardPage() {
  const payload = await getPayload();
  const awaitedHeaders = await headers();

  const [session, activeSessions, deviceSessions, organization] =
    await Promise.all([
      payload.betterAuth.api.getSession({
        headers: awaitedHeaders,
      }),
      payload.betterAuth.api.listSessions({
        headers: awaitedHeaders,
      }),
      payload.betterAuth.api.listDeviceSessions({
        headers: awaitedHeaders,
      }),
      payload.betterAuth.api.getFullOrganization({
        headers: awaitedHeaders,
      }),
    ]).catch((e) => {
      throw redirect("/sign-in");
    });

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
