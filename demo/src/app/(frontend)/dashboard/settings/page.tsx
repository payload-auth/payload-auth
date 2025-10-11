import { Main } from '@/components/main'
import { UserCard } from '../../../../components/user-card'

export default function SettingsPage() {
  return (
    <Main className="w-full">
      <div className="container mx-auto flex max-w-screen-lg flex-col gap-6">
        <UserCard />
      </div>
    </Main>
  )
}
