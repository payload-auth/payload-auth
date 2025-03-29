import { Main } from '@/components/main'
import { AuthCard } from '@daveyplate/better-auth-ui'

export default function Page() {
  return (
    <Main className="place-content-center">
      <div className="mx-auto h-full w-full max-w-md self-center px-4 sm:px-0">
        <AuthCard view="forgotPassword" />
      </div>
    </Main>
  )
}
