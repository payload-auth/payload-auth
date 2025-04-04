import AccountSwitcher from '@/components/account-switch'
import { Main } from '@/components/main'
import { OrganizationCard } from './organization-card'
import { UserCard } from './user-card'

export default function DashboardPage() {
  return (
    <Main className="w-full">
      <div className="container mx-auto flex max-w-screen-lg flex-col gap-6">
        <AccountSwitcher />
        <UserCard />
        <OrganizationCard />
      </div>
    </Main>
  )
}
