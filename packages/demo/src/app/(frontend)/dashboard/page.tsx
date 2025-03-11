import { headers } from "next/headers";
import { redirect } from "next/navigation";
import UserCard from "./user-card";
import { OrganizationCard } from "./organization-card";
import AccountSwitcher from "@/components/account-switch";
import getPayload from "@/lib/getPayload";

export default async function DashboardPage() {
  const payload = await getPayload();

  const [session, activeSessions, deviceSessions, organization] =
    await Promise.all([
      payload.betterAuth.api.getSession({
        headers: await headers(),
      }),
      payload.betterAuth.api.listSessions({
        headers: await headers(),
      }),
      payload.betterAuth.api.listDeviceSessions({
        headers: await headers(),
      }),
      payload.betterAuth.api.getFullOrganization({
        headers: await headers(),
      }),
    ]).catch((e) => {
      throw redirect("/sign-in");
    });

  console.log(activeSessions, deviceSessions, organization);
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
