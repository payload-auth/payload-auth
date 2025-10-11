import { Main } from '@/components/main'
import { OrganizationCard } from '../../../../components/organization-card'

export default function OrganizationPage() {
  return (
    <Main className="w-full">
      <div className="container mx-auto flex max-w-screen-lg flex-col gap-6">
        <OrganizationCard />
      </div>
    </Main>
  )
}
