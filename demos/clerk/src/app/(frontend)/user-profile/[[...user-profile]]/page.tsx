import { Main } from '@/components/main'
import { UserProfile } from '@clerk/nextjs'

export default function UserProfilePage() {
  return (
    <Main className="my-12">
      <div className="container">
        <UserProfile />
      </div>
    </Main>
  )
}
